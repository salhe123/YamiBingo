import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/libs/prismadb";
import bcrypt from "bcrypt";

async function requireCashierShop() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "Cashier") {
    return {
      error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }
  if (!session.user.shopId) {
    return {
      error: NextResponse.json(
        { message: "Cashier is not assigned to a shop" },
        { status: 400 },
      ),
    };
  }
  return { session, shopId: session.user.shopId };
}

/** List FloorGuys for the logged-in cashier's shop only */
export async function GET() {
  try {
    const auth = await requireCashierShop();
    if (auth.error) return auth.error;

    const floorGuys = await prisma.floorGuy.findMany({
      where: { shopId: auth.shopId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            isBlocked: true,
            createdAt: true,
          },
        },
        shop: { select: { id: true, shopName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(floorGuys);
  } catch (error) {
    console.error("cashier floor-guys GET:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

/** Register a FloorGuy for this cashier's shop only */
export async function POST(request) {
  try {
    const auth = await requireCashierShop();
    if (auth.error) return auth.error;

    const body = await request.json();
    const { firstName, lastName, email, password, phoneNumber } = body;

    if (!firstName || !lastName || !email || !password || !phoneNumber) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: "FloorGuy",
        phoneNumber,
      },
    });

    const floorGuy = await prisma.floorGuy.create({
      data: {
        userId: user.id,
        shopId: auth.shopId,
        isBlocked: false,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            isBlocked: true,
          },
        },
        shop: { select: { id: true, shopName: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "FloorGuy registered for your shop",
      floorGuy,
    });
  } catch (error) {
    console.error("cashier floor-guys POST:", error);
    return NextResponse.json(
      { message: error.message || "Failed to register FloorGuy" },
      { status: 500 },
    );
  }
}

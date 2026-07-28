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

async function getOwnedFloorGuy(id, shopId) {
  return prisma.floorGuy.findFirst({
    where: { id, shopId },
    include: { user: true },
  });
}

/** Edit FloorGuy belonging to this cashier's shop */
export async function PATCH(request, { params }) {
  try {
    const auth = await requireCashierShop();
    if (auth.error) return auth.error;

    const { id } = await params;
    const body = await request.json();
    const { firstName, lastName, phoneNumber, password, isBlocked } = body;

    const existing = await getOwnedFloorGuy(id, auth.shopId);
    if (!existing) {
      return NextResponse.json(
        { message: "FloorGuy not found in your shop" },
        { status: 404 },
      );
    }

    const userData = {};
    if (firstName !== undefined) userData.firstName = firstName;
    if (lastName !== undefined) userData.lastName = lastName;
    if (phoneNumber !== undefined) userData.phoneNumber = phoneNumber;
    if (typeof isBlocked === "boolean") userData.isBlocked = isBlocked;
    if (password && String(password).trim().length > 0) {
      userData.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(userData).length > 0 && existing.userId) {
      await prisma.user.update({
        where: { id: existing.userId },
        data: userData,
      });
    }

    if (typeof isBlocked === "boolean") {
      await prisma.floorGuy.update({
        where: { id },
        data: { isBlocked },
      });
    }

    const updated = await prisma.floorGuy.findUnique({
      where: { id },
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
      message: "FloorGuy updated",
      floorGuy: updated,
    });
  } catch (error) {
    console.error("cashier floor-guys PATCH:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

/** Delete FloorGuy (and linked user) from this cashier's shop only */
export async function DELETE(_request, { params }) {
  try {
    const auth = await requireCashierShop();
    if (auth.error) return auth.error;

    const { id } = await params;
    const existing = await getOwnedFloorGuy(id, auth.shopId);
    if (!existing) {
      return NextResponse.json(
        { message: "FloorGuy not found in your shop" },
        { status: 404 },
      );
    }

    const userId = existing.userId;

    await prisma.floorGuy.delete({ where: { id } });

    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => null);
    }

    return NextResponse.json({
      success: true,
      message: "FloorGuy deleted",
    });
  } catch (error) {
    console.error("cashier floor-guys DELETE:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

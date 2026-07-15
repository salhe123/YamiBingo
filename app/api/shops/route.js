import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";

// Create Shop
export const POST = async (request) => {
  try {
    const body = await request.json();
    const { shopName, location, ownerId, agentId, shopCommissionRate } = body;

    if (!shopName || !location || !ownerId) {
      return NextResponse.json(
        { message: "shopName, location, and ownerId are required" },
        { status: 400 }
      );
    }

    const newShop = await prisma.shop.create({
      data: {
        shopName,
        location,
        ownerId,
        agentId: agentId || null,
        shopCommissionRate: shopCommissionRate ?? 0.2,
      },
      include: {
        owner: true,
        wallet: true,
        cashiers: true,
        games: true,
      },
    });

    // Fetch agent separately if agentId exists
    let agent = null;
    if (newShop.agentId) {
      agent = await prisma.user.findUnique({
        where: { id: newShop.agentId },
        select: { id: true, firstName: true, lastName: true, email: true },
      });
    }

    return NextResponse.json({ ...newShop, agent }, { status: 201 });
  } catch (err) {
    if (err.code === "P2002") {
      return NextResponse.json(
        { message: "Shop with the same unique field already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: err.message || "Failed to create shop" },
      { status: 500 }
    );
  }
};

export const GET = async () => {
  try {
    const shops = await prisma.shop.findMany({
      include: {
        owner: true,
        cashiers: true,
      },
    });

    return NextResponse.json(shops);
  } catch (err) {
    return NextResponse.json({ message: "Shops GET Error" }, { status: 500 });
  }
};

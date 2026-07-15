import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";

export async function PATCH(request, { params }) {
  const { shopId } = await params;
  const { shopCommissionRate } = await request.json();

  try {
    // Update the commission rate
    await prisma.shop.update({
      where: { id: shopId },
      data: { shopCommissionRate: parseFloat(shopCommissionRate) },
    });

    // Fetch full updated shop including relations
    const updatedShop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: {
        cashiers: { include: { user: true } },
        wallet: true,
        games: true,
      },
    });

    return NextResponse.json(updatedShop, { status: 200 });
  } catch (error) {
    console.error("Error updating shop commission rate:", error);
    return NextResponse.json(
      { error: "Error updating shop commission rate" },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  // Await params because in Next.js 15+ it's a Promise
  const resolvedParams = await params;
  const shopId = resolvedParams.shopId;

  try {
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      select: { shopCommissionRate: true },
    });

    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    return NextResponse.json(
      { shopCommissionRate: shop.shopCommissionRate || 0.2 },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching shop:", error);
    return NextResponse.json({ error: "Error fetching shop" }, { status: 500 });
  }
}

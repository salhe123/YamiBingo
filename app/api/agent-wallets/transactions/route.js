import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";

export const GET = async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get("adminId");

    if (!adminId) {
      return NextResponse.json({ message: "adminId is required" }, { status: 400 });
    }

    const shop = await prisma.shop.findFirst({
      where: { ownerId: adminId },
      include: { wallet: true },
    });

    if (!shop || !shop.wallet) {
      return NextResponse.json({ message: "No wallet found for this admin" }, { status: 404 });
    }

    const transactions = await prisma.transaction.findMany({
      where: { walletId: shop.wallet.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(transactions);
  } catch (err) {
    console.error("Error fetching transactions:", err);
    return NextResponse.json({ message: "Transactions GET Error" }, { status: 500 });
  }
};
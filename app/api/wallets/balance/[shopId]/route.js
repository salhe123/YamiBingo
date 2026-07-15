import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";

export async function GET(req, { params }) {
  const { shopId } = await params;

  try {
    if (!shopId) {
      return NextResponse.json(
        { error: "shopId is required" },
        { status: 400 }
      );
    }

    // Fetch the wallet balance based on the shopId
    const wallet = await prisma.shopWallet.findUnique({
      where: { shopId },
      select: {
        balance: true,
      },
    });

    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet not found for the given shopId" },
        { status: 404 }
      );
    }

    return NextResponse.json({ balance: wallet.balance });
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

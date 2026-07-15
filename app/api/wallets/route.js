// /api/wallets/route.js
import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";

export async function GET() {
  try {
    const shopWallets = await prisma.shopWallet.findMany({
      include: {
        shop: {
          select: {
            id: true,
            shopName: true,
            location: true,
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(shopWallets, { status: 200 });
  } catch (error) {
    console.error("Error fetching shop wallets:", {
      message: error.message,
      code: error.code, // Prisma error code if applicable
      stack: error.stack,
    });
    return NextResponse.json(
      { error: "Failed to fetch shop wallets" },
      { status: 500 }
    );
  }
}

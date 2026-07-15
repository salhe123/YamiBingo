import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { message: "User ID is required" },
      { status: 400 }
    );
  }

  try {
    // Find the user's associated shop wallet through the shop relationship
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        shops: {
          include: {
            wallet: {
              include: {
                transactions: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Extract transactions along with their associated shop names
    const shopWalletTransactions = user.shops
      .map((shop) =>
        (shop.wallet?.transactions || []).map((transaction) => ({
          ...transaction,
          shopName: shop.shopName,
        }))
      )
      .flat();

    return NextResponse.json(
      { transactions: shopWalletTransactions },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving transactions:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

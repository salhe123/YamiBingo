import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";

export async function POST(req) {
  try {
    const { shopId, initialBalance } = await req.json();

    // Validation
    if (!shopId || initialBalance === undefined) {
      return NextResponse.json(
        { error: "shopId and initialBalance are required." },
        { status: 400 }
      );
    }

    // Check if the wallet already exists for the shop
    const existingWallet = await prisma.shopWallet.findUnique({
      where: { shopId },
    });

    if (existingWallet) {
      return NextResponse.json(
        { error: "Wallet already exists for this shop." },
        { status: 406 }
      );
    }

    // Create the wallet and the initial transaction in one operation
    console.log(
      "Creating wallet for shopId:",
      shopId,
      "with balance:",
      initialBalance
    );

    const newWallet = await prisma.shopWallet.create({
      data: {
        shopId,
        balance: initialBalance,
        transactions: {
          create: {
            amount: initialBalance,
            type: "TopUp",
            description: `Initial wallet creation with balance of ${initialBalance}`,
          },
        },
      },
      include: {
        transactions: true,
      },
    });

    console.log("Created wallet:", newWallet);

    return NextResponse.json(
      {
        message: "Wallet created successfully with the initial transaction.",
        wallet: newWallet,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating wallet:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

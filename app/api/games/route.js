import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";

export async function POST(request) {
  const { cashierId, betAmount, numberOfPlayers, status, comm } =
    await request.json();

  try {
    // Find the cashier and include the shop wallet and shop details
    const cashier = await prisma.cashier.findUnique({
      where: { id: cashierId },
      include: { shop: { include: { wallet: true, owner: true } } },
    });

    if (
      !cashier ||
      !cashier.shop ||
      !cashier.shop.wallet ||
      !cashier.shop.shopCommissionRate
    ) {
      return NextResponse.json(
        { error: "Cashier, Shop, or Shop Wallet not found" },
        { status: 404 }
      );
    }

    const shopWallet = cashier.shop.wallet;
    const shopCommissionRate = cashier.shop.shopCommissionRate;

    // Calculate amounts
    const winningAmount = betAmount * numberOfPlayers;
    const shopCommission = 0;
    let systemCommission = 0;

    if (numberOfPlayers >= comm && shopCommissionRate) {
      systemCommission = winningAmount * 0.04; // static system commission

      if (shopWallet.balance < systemCommission) {
        return NextResponse.json(
          { error: "Insufficient balance in the shop wallet" },
          { status: 400 }
        );
      }
    }

    // Use a transaction to ensure atomicity
    const result = await prisma.$transaction(async (prisma) => {
      let updatedWallet = shopWallet;

      // Create the new game
      const newGame = await prisma.game.create({
        data: {
          shopId: cashier.shop.id,
          cashierId,
          status,
          betAmount,
          numberOfPlayers,
          winningAmount,
          shopCommission: 0,
          systemCommission: 0,
          winnerCard: null,
        },
      });

      return { newGame, updatedWallet };
    });

    return NextResponse.json(
      {
        gameId: result.newGame.id,
        game: result.newGame,
        wallet: result.updatedWallet,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating game:", error);
    return NextResponse.json({ error: "Error creating game" }, { status: 500 });
  }
}

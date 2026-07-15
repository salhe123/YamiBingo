import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";

export async function POST(request) {
  const { id, comm } = await request.json();

  try {
    const game = await prisma.game.findUnique({
      where: { id },
      include: {
        shop: { include: { wallet: true, owner: true } },
        cashier: true,
      },
    });

    if (!game || !game.shop || !game.shop.wallet) {
      return NextResponse.json(
        { error: "Game, Shop, or Shop Wallet not found" },
        { status: 404 }
      );
    }

    const { betAmount, numberOfPlayers } = game;
    const shopWallet = game.shop.wallet;
    const shopCommissionRate = game.shop.shopCommissionRate;

    // Calculate amounts
    const winningAmount = betAmount * numberOfPlayers;
    let shopCommission = 0;
    let systemCommission = 0;

    if (numberOfPlayers >= comm && shopCommissionRate) {
      shopCommission = winningAmount * shopCommissionRate;
      systemCommission = winningAmount * 0.04;
    }

    // Use a transaction to ensure atomicity. Perform a conditional decrement
    // so it only succeeds if the wallet has enough balance.
    const result = await prisma.$transaction(async (prisma) => {
      if (numberOfPlayers >= comm && shopCommissionRate) {
        const updateRes = await prisma.shopWallet.updateMany({
          where: { id: shopWallet.id, balance: { gte: systemCommission } },
          data: { balance: { decrement: systemCommission } },
        });

        if ((updateRes.count || 0) === 0) {
          // Not enough balance (or concurrent deduction). Throw to rollback.
          throw new Error("Insufficient balance in the shop wallet");
        }

        // Write commissions to the existing game record
        await prisma.game.update({
          where: { id },
          data: { systemCommission, shopCommission },
        });

        return { systemCommission, shopCommission };
      }

      // If no commission applies, still write zeros to be explicit
      await prisma.game.update({
        where: { id },
        data: { systemCommission, shopCommission },
      });
      return { systemCommission, shopCommission };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error updating commissions:", error);

    if (error?.message === "Insufficient balance in the shop wallet") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Error updating commissions" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

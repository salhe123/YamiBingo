import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";
import dayjs from "dayjs";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  try {
    // Build date filter
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        gte: new Date(startDate),
        lte: new Date(dayjs(endDate).endOf("day").toISOString()),
      };
    }

    // Aggregate sum of transaction amounts for all shops in date range
    const transactionSum = await prisma.transaction.aggregate({
      where: {
        ...dateFilter,
      },
      _sum: { amount: true },
    });

    // Aggregate total wallet balance for all shops
    const walletSum = await prisma.shopWallet.aggregate({
      _sum: { balance: true },
    });

    // Aggregate games stats WITH date filter
    const gameStats = await prisma.game.aggregate({
      where: {
        ...dateFilter,
      },
      _count: { id: true },
      _sum: {
        shopCommission: true,
        systemCommission: true,
      },
    });

    // Calculate the difference
    const difference =
      (transactionSum._sum.amount || 0) -
      (gameStats._sum.systemCommission || 0);

    return NextResponse.json({
      startDate,
      endDate,
      totalTransactionAmount: transactionSum._sum.amount || 0,
      totalWalletBalance: walletSum._sum.balance || 0,
      difference,
      totalGamesPlayed: gameStats._count.id || 0,
      totalShopCommission: gameStats._sum.shopCommission || 0,
      totalSystemCommission: gameStats._sum.systemCommission || 0,
    });
  } catch (error) {
    console.error("Error fetching wallet transaction sum:", error);
    return NextResponse.json(
      { message: "Could not fetch wallet transaction sum" },
      { status: 500 }
    );
  }
}

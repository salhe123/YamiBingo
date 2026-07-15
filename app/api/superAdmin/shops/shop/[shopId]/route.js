import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";
import dayjs from "dayjs";

export async function GET(request, { params }) {
  const { shopId } = await params;
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (!shopId) {
    return NextResponse.json(
      { message: "Shop ID is required" },
      { status: 400 }
    );
  }

  try {
    // Fetch shop info
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      select: {
        shopName: true,
        shopCommissionRate: true,
        owner: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        wallet: {
          select: {
            id: true,
            balance: true,
          },
        },
      },
    });

    // Build date filter for games
    const gameFilters = { shopId };
    if (startDate && endDate) {
      gameFilters.createdAt = {
        gte: new Date(startDate),
        lte: new Date(`${endDate}T23:59:59.999Z`), // Full day
      };
    }

    // Aggregate game stats WITH date filter
    const gameStats = await prisma.game.aggregate({
      where: gameFilters,
      _count: { id: true },
      _sum: {
        shopCommission: true,
        systemCommission: true,
      },
    });

    // Wallet balance (always current)
    const shopWallet = shop?.wallet;

    // Total wallet transactions (all time)
    let totalWalletTransactions = 0;
    if (shopWallet?.id) {
      const transactionSum = await prisma.transaction.aggregate({
        where: { walletId: shopWallet.id },
        _sum: { amount: true },
      });
      totalWalletTransactions = transactionSum._sum.amount || 0;
    }

    // Last 5 games WITH date filter
    const lastFiveGames = await prisma.game.findMany({
      where: gameFilters, // Now filtered by date
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        status: true,
        betAmount: true,
        numberOfPlayers: true,
        winningAmount: true,
        shopCommission: true,
        systemCommission: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      shopName: shop?.shopName || "",
      shopCommissionRate: shop?.shopCommissionRate ?? 0,
      ownerName: shop?.owner
        ? `${shop.owner.firstName} ${shop.owner.lastName}`
        : "",
      totalGamesPlayed: gameStats._count.id || 0,
      totalShopCommission: gameStats._sum.shopCommission || 0,
      totalSystemCommission: gameStats._sum.systemCommission || 0,
      walletBalance: shopWallet?.balance || 0,
      totalWalletTransactions,
      lastFiveGames,
    });
  } catch (error) {
    console.error("Error fetching shop stats:", error);
    return NextResponse.json(
      { message: "Could not fetch shop stats" },
      { status: 500 }
    );
  }
}
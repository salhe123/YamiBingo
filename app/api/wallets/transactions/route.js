import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Fetch transactions with pagination, total count, and sum of amounts
    const [transactions, totalCount, totalAmount] = await Promise.all([
      prisma.transaction.findMany({
        skip,
        take: limit,
        include: {
          wallet: {
            include: {
              shop: {
                include: {
                  owner: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc", // Default sorting by createdAt descending
        },
      }),
      prisma.transaction.count(),
      prisma.transaction.aggregate({
        _sum: {
          amount: true,
        },
      }),
    ]);

    // Format the transactions
    const transactionsWithDetails = transactions.map((transaction) => ({
      id: transaction.id,
      amount: transaction.amount,
      type: transaction.type,
      description: transaction.description,
      createdAt: transaction.createdAt,
      walletBalance: transaction.wallet ? transaction.wallet.balance : null,
      shopName: transaction.wallet ? transaction.wallet.shop.shopName : "N/A",
      shopLocation: transaction.wallet
        ? transaction.wallet.shop.location
        : "N/A",
      shopOwner:
        transaction.wallet && transaction.wallet.shop.owner
          ? `${transaction.wallet.shop.owner.firstName} ${transaction.wallet.shop.owner.lastName}`
          : "N/A",
      shopId: transaction.wallet ? transaction.wallet.shop.id : "N/A",
    }));

    return NextResponse.json({
      transactions: transactionsWithDetails,
      totalCount,
      totalAmount: totalAmount._sum.amount || 0, // Add the sum of all amounts
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Error fetching transactions" },
      { status: 500 }
    );
  }
}

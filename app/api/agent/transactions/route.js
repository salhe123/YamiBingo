import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";

export const GET = async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get("agentId");

    if (!agentId) {
      return NextResponse.json(
        { message: "Agent ID is required" },
        { status: 400 }
      );
    }

    const wallet = await prisma.agentWallet.findUnique({
      where: { agentId },
    });

    if (!wallet) {
      return NextResponse.json(
        { message: "Wallet not found for this agent" },
        { status: 404 }
      );
    }

    const transactions = await prisma.agentTransaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        amount: true,
        type: true,
        description: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch transactions",
      },
      { status: 500 }
    );
  }
};
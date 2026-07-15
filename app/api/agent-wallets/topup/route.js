import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const POST = async (request) => {
  try {
    // Get session to verify the user is an agent
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "Agent") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { adminId, amount } = await request.json();

    // Validation
    if (!adminId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "adminId and a positive amount are required" },
        { status: 400 }
      );
    }

    // Fetch shop and wallet
    const shop = await prisma.shop.findFirst({
      where: { ownerId: adminId },
      include: { wallet: true },
    });

    if (!shop || !shop.wallet) {
      return NextResponse.json(
        { error: "Shop or wallet not found for this admin" },
        { status: 404 }
      );
    }

    // Fetch agent's wallet
    const agentWallet = await prisma.agentWallet.findUnique({
      where: { agentId: session.user.id },
    });
    if (!agentWallet) {
      return NextResponse.json(
        { error: "Agent wallet not found" },
        { status: 404 }
      );
    }

    // Check if agent has sufficient balance
    if (agentWallet.balance < amount) {
      return NextResponse.json(
        { error: "Insufficient balance in agent wallet" },
        { status: 400 }
      );
    }

    // Perform top-up and deduction in a transaction
    const result = await prisma.$transaction([
      // Deduct from agent's wallet
      prisma.agentWallet.update({
        where: { agentId: session.user.id },
        data: { balance: { decrement: amount } },
      }),
      // Create deduction transaction for agent
      prisma.agentTransaction.create({
        data: {
          walletId: agentWallet.id,
          amount: -amount,
          type: "Deduction",
          description: `Top-up of ${amount} to shop wallet (shopId: ${shop.id})`,
        },
      }),
      // Create top-up transaction for shop wallet
      prisma.transaction.create({
        data: {
          walletId: shop.wallet.id,
          amount,
          type: "TopUp",
          description: `Top-up of ${amount} from agent (agentId: ${session.user.id})`,
        },
      }),
      // Increment shop wallet balance
      prisma.shopWallet.update({
        where: { id: shop.wallet.id },
        data: { balance: { increment: amount } },
      }),
    ]);

    console.log("Topped up wallet and updated agent balance:", {
      agentWallet: result[0],
      shopWallet: result[3],
    });

    return NextResponse.json({
      success: true,
      message: "Wallet topped up successfully and agent balance updated",
    });
  } catch (err) {
    console.error("Error topping up wallet:", err);
    return NextResponse.json(
      { error: err.message || "Wallet Top-Up Error" },
      { status: 500 }
    );
  }
};
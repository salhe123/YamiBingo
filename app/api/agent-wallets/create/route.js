import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session?.user ||
      !["Agent", "SuperAdmin"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { shopId, adminId, initialBalance, agentId } = await req.json();

    // Validation
    if (!shopId || !adminId || initialBalance === undefined || !agentId) {
      return NextResponse.json(
        { error: "shopId, adminId, initialBalance, and agentId are required" },
        { status: 400 }
      );
    }
    if (initialBalance < 0) {
      return NextResponse.json(
        { error: "Initial balance cannot be negative" },
        { status: 400 }
      );
    }

    if (session.user.role === "Agent" && agentId !== session.user.id) {
      return NextResponse.json({ error: "Agent ID mismatch" }, { status: 403 });
    }

    // Check if the wallet already exists for the shop
    const existingWallet = await prisma.shopWallet.findUnique({
      where: { shopId },
    });
    if (existingWallet) {
      return NextResponse.json(
        { error: "Wallet already exists for this shop" },
        { status: 406 }
      );
    }

    // Prepare transaction array
    const transactionOps = [];

    // Only fetch and deduct agent wallet if role is Agent
    let agentWallet = null;
    if (session.user.role === "Agent") {
      agentWallet = await prisma.agentWallet.findUnique({
        where: { agentId: session.user.id },
      });
      if (!agentWallet) {
        return NextResponse.json(
          { error: "Agent wallet not found" },
          { status: 404 }
        );
      }

      if (agentWallet.balance < initialBalance) {
        return NextResponse.json(
          { error: "Insufficient balance in agent wallet" },
          { status: 400 }
        );
      }

      // Deduct from agent's wallet
      transactionOps.push(
        prisma.agentWallet.update({
          where: { agentId: session.user.id },
          data: { balance: { decrement: initialBalance } },
        }),
        prisma.agentTransaction.create({
          data: {
            walletId: agentWallet.id,
            amount: -initialBalance,
            type: "Deduction",
            description: `Transferred ${initialBalance} to shop wallet (shopId: ${shopId})`,
          },
        })
      );
    }

    // Create shop wallet (both Agent and SuperAdmin)
    transactionOps.push(
      prisma.shopWallet.create({
        data: {
          shopId,
          balance: initialBalance,
          transactions: {
            create: {
              amount: initialBalance,
              type: "TopUp",
              description: `Initial wallet creation with balance of ${initialBalance} from ${session.user.role} (userId: ${session.user.id})`,
            },
          },
        },
        include: { transactions: true },
      })
    );

    const result = await prisma.$transaction(transactionOps);

    const newWallet = result[result.length - 1]; // Shop wallet is always the last operation

    console.log("Created wallet and updated agent balance:", {
      agentWallet: session.user.role === "Agent" ? result[0] : null,
      shopWallet: newWallet,
    });

    return NextResponse.json(
      {
        message:
          session.user.role === "Agent"
            ? "Wallet created successfully and agent balance updated"
            : "Wallet created successfully by SuperAdmin",
        wallet: newWallet,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating wallet:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

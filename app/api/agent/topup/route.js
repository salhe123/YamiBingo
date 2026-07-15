import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";

export const POST = async (request) => {
  try {
    const { agentId, amount } = await request.json();
    if (!agentId || amount <= 0) {
      return NextResponse.json(
        { message: "Agent ID and positive amount are required" },
        { status: 400 }
      );
    }

    const wallet = await prisma.agentWallet.update({
      where: { agentId },
      data: { balance: { increment: parseFloat(amount) } },
    });

    await prisma.agentTransaction.create({
      data: {
        walletId: wallet.id,
        amount: parseFloat(amount),
        type: "TopUp",
        description: "Admin top-up",
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Top-up error:", err);
    return NextResponse.json(
      { message: err.message || "Top-up error" },
      { status: 500 }
    );
  }
};
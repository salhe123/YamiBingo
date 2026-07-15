import prisma from "@/libs/prismadb";

export async function POST(req) {
  try {
    const { adminId, amount } = await req.json();

    if (!adminId || !amount || amount <= 0) {
      return new Response(
        JSON.stringify({ message: "Invalid data provided" }),
        { status: 400 }
      );
    }

    const wallet = await prisma.adminWallet.findUnique({
      where: { adminId },
    });

    if (!wallet) {
      return new Response(JSON.stringify({ message: "Wallet not found" }), {
        status: 404,
      });
    }

    if (wallet.balance < amount) {
      return new Response(
        JSON.stringify({ message: "Insufficient wallet balance" }),
        { status: 400 }
      );
    }

    const updatedWallet = await prisma.adminWallet.update({
      where: { id: wallet.id },
      data: {
        balance: { decrement: amount },
        transactions: {
          create: {
            amount: -amount,
            type: "Deduction",
            description: `Deducted ${amount} from wallet`,
          },
        },
      },
    });

    return new Response(
      JSON.stringify({
        message: "Wallet deducted successfully",
        wallet: updatedWallet,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
}

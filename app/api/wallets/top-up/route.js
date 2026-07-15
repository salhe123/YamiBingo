import prisma from "@/libs/prismadb";

export async function POST(req) {
  try {
    const { walletId, amount } = await req.json();

    // Validate the request data
    if (!walletId || !amount || amount <= 0) {
      return new Response(
        JSON.stringify({ message: "Invalid data provided" }),
        { status: 400 }
      );
    }

    // Find the wallet by its ID
    const wallet = await prisma.shopWallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet) {
      return new Response(JSON.stringify({ message: "Wallet not found" }), {
        status: 404,
      });
    }

    // Update the wallet balance and create a transaction
    const updatedWallet = await prisma.shopWallet.update({
      where: { id: walletId },
      data: {
        balance: { increment: amount }, // Increment the wallet balance
        transactions: {
          create: {
            amount,
            type: "TopUp",
            description: `Topped up ${amount} to wallet`,
          },
        },
      },
    });

    return new Response(
      JSON.stringify({
        message: "Wallet topped up successfully",
        wallet: updatedWallet,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error while topping up wallet:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
}

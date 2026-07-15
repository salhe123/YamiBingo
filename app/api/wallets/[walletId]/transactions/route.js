import prisma from "@/libs/prismadb";

export async function GET(request, { params }) {
  // Await params because in Next.js 15+ it's a Promise
  const resolvedParams = await params;
  const walletId = resolvedParams.walletId;

  try {
    if (!walletId) {
      return new Response(
        JSON.stringify({ message: "Wallet ID is required" }),
        { status: 400 }
      );
    }

    const transactions = await prisma.transaction.findMany({
      where: { walletId },
      orderBy: { createdAt: "desc" },
    });

    return new Response(JSON.stringify(transactions), { status: 200 });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
}

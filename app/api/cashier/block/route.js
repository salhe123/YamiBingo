import prisma from "@/libs/prismadb";

export default async function handler(req, res) {
  if (req.method === "PATCH") {
    const { cashierId, blockStatus } = req.body;

    try {
      const cashier = await prisma.cashier.update({
        where: { id: cashierId },
        data: { isBlocked: blockStatus }, // Toggle block/unblock status
      });

      // Optionally, also block the cashier user account
      await prisma.user.update({
        where: { id: cashier.userId },
        data: { isBlocked: blockStatus },
      });

      res.status(200).json({
        message: `Cashier ${blockStatus ? "blocked" : "unblocked"}`,
        cashier,
      });
    } catch (error) {
      res.status(500).json({ error: "Unable to update cashier status" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

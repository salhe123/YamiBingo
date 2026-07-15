import prisma from "@/libs/prismadb";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    // Fetch all cashiers where shopId is null
    const unassignedCashiers = await prisma.cashier.findMany({
      where: {
        shopId: null,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Return unassigned cashiers as a flat array
    return NextResponse.json(unassignedCashiers);
  } catch (err) {
    console.error("Error fetching unassigned cashiers:", err);
    return NextResponse.json(
      { success: false, message: "Error fetching unassigned cashiers." },
      { status: 500 }
    );
  }
};

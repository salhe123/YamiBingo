import prisma from "@/libs/prismadb";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    // Fetch all cashiers with related user and shop data
    const cashiers = await prisma.cashier.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            role: true,
            isBlocked: true,
            createdAt: true,
          },
        },
        shop: {
          select: {
            id: true,
            shopName: true,
            location: true,
          },
        },
      },
    });

    // Return the cashiers as a JSON response
    return NextResponse.json(
      {
        success: true,
        data: cashiers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching cashiers:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch cashiers",
      },
      { status: 500 }
    );
  } finally {
    // Disconnect Prisma client to avoid connection leaks
    await prisma.$disconnect();
  }
};

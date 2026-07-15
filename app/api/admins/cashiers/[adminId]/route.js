import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";

export async function GET(request, { params }) {
  const { adminId } = await params;

  try {
    // Find all shops owned by this admin
    const shops = await prisma.shop.findMany({
      where: {
        ownerId: adminId,
      },
      select: {
        id: true, // Only select shop ID for further querying
      },
    });

    if (shops.length === 0) {
      return NextResponse.json(
        { message: "No shops found for this admin." },
        { status: 404 }
      );
    }

    // Collect all shop IDs
    const shopIds = shops.map((shop) => shop.id);

    // Find all cashiers working at these shops
    const cashiers = await prisma.cashier.findMany({
      where: {
        shopId: { in: shopIds },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            isBlocked: true,
            phoneNumber: true,
            createdAt: true,
          },
        },
      },
    });

    if (cashiers.length === 0) {
      return NextResponse.json(
        { message: "No cashiers found for this admin." },
        { status: 404 }
      );
    }

    return NextResponse.json(cashiers, { status: 200 });
  } catch (error) {
    console.error("Error fetching cashiers:", error);
    return NextResponse.json(
      { message: "Error fetching cashiers." },
      { status: 500 }
    );
  }
}

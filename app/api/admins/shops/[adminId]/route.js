import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";

export async function GET(request, { params }) {
  const { adminId } = await params;

  try {
    const shops = await prisma.shop.findMany({
      where: { ownerId: adminId },
      include: {
        cashiers: {
          include: {
            user: true,
          },
        },
        games: true,
        wallet: true,
      },
    });

    return NextResponse.json(shops);
  } catch (error) {
    console.error("Error fetching shops:", error);
    return NextResponse.json(
      { message: "Could not fetch shops" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";

export async function GET(request, { params }) {
  const { id } = await params; // Extract cashier ID from the request parameters

  try {
    // Calculate the start of the current day (midnight)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0); 

    const games = await prisma.game.findMany({
      where: {
        cashierId: id,
        createdAt: {
          gte: startOfDay, 
        },
      },
      include: {
        shop: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(games, { status: 200 });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return NextResponse.json(
      { error: "Error fetching games" },
      { status: 500 }
    );
  }
}

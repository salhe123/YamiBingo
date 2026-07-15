import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";

export async function PUT(request, { params }) {
  // In Next.js 15+, `params` is a Promise that must be awaited
  const resolvedParams = await params;
  const id = resolvedParams.id; // matches dynamic segment [id] in the route folder

  // Guard against misconfigured routes (e.g., file not in [id] folder)
  if (!id) {
    return NextResponse.json(
      { error: "Missing game ID in route parameters" },
      { status: 400 }
    );
  }

  try {
    const { status, winnerCard, numbersCalled } = await request.json();

    const updatedGame = await prisma.game.update({
      where: { id }, // use parseInt(id, 10) if your Prisma ID is an integer
      data: {
        status,
        winnerCard,
        numbersCalled,
      },
      include: {
        shop: {
          select: {
            shopName: true,
          },
        },
      },
    });

    return NextResponse.json(updatedGame);
  } catch (error) {
    console.error("Error updating game:", error);

    // Handle Prisma "record not found" gracefully
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to update game" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";
import dayjs from "dayjs"; // Import dayjs to manipulate dates

export async function GET(request, { params }) {
  const { shopId } = await params;
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (!shopId) {
    return NextResponse.json(
      { message: "Shop ID is required" },
      { status: 400 }
    );
  }

  console.log(
    "Shop ID:",
    shopId,
    "Start Date:",
    startDate,
    "End Date:",
    endDate
  );

  try {
    // Build the query for games
    const filters = {
      shopId: shopId,
    };

    // If both startDate and endDate are provided, add a filter on createdAt
    if (startDate && endDate) {
      filters.createdAt = {
        gte: new Date(startDate),
        // Adjust the end date to include the entire day
        lte: new Date(dayjs(endDate).endOf("day").toISOString()),
      };
    }

    // Fetch games related to the shop
    const games = await prisma.game.findMany({
      where: filters,
      orderBy: {
        createdAt: "desc",
      },
    });

    // Fetch wallet details for the shop
    const shopWallet = await prisma.shopWallet.findUnique({
      where: {
        shopId: shopId,
      },
    });

    if (!games.length && !shopWallet) {
      return NextResponse.json({
        message: "No data found for this shop",
      });
    }

    // Combine game data and wallet details
    return NextResponse.json({
      games,
      wallet: shopWallet || { message: "Wallet not found for this shop" },
    });
  } catch (error) {
    console.error("Error fetching shop data:", error);
    return NextResponse.json(
      { message: "Could not fetch shop data" },
      { status: 500 }
    );
  }
}

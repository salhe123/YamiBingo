import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";// Get All Shops
export const GET = async () => {
  try {
    const shops = await prisma.shop.findMany({
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        cashiers: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
        wallet: true,
        games: true,
      },
    });

    // Add agent info manually
    const shopsWithAgents = await Promise.all(
      shops.map(async (shop) => {
        let agent = null;
        if (shop.agentId) {
          agent = await prisma.user.findUnique({
            where: { id: shop.agentId },
            select: { id: true, firstName: true, lastName: true, email: true },
          });
        }
        return { ...shop, agent };
      })
    );

    return NextResponse.json(shopsWithAgents, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: err.message || "Failed to fetch shops" },
      { status: 500 }
    );
  }
};
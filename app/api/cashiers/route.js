import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";

export const POST = async (request) => {
  try {
    const body = await request.json();
    console.log("Request Body:", body);

    const { userId, shopId, agentId } = body;

    if (!userId || !shopId || !agentId) {
      return NextResponse.json(
        { message: "userId, shopId, and agentId are required" },
        { status: 400 }
      );
    }

    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
    });
    if (!shop) {
      return NextResponse.json({ message: "Shop not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user || user.role !== "Cashier") {
      return NextResponse.json(
        { message: "Valid Cashier user not found" },
        { status: 404 }
      );
    }

    const existingCashier = await prisma.cashier.findFirst({
      where: { userId },
    });

    let cashier;
    if (existingCashier) {
      cashier = await prisma.cashier.update({
        where: { id: existingCashier.id },
        data: { shopId, agentId },
      });
    } else {
      cashier = await prisma.cashier.create({
        data: { userId, shopId, agentId, isBlocked: false },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Cashier assigned to shop successfully.",
      cashier,
    });
  } catch (err) {
    console.error("Error assigning cashier to shop:", err);
    return NextResponse.json(
      { message: err.message || "Error assigning cashier to shop" },
      { status: 500 }
    );
  }
};
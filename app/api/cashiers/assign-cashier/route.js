import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";

export async function POST(request) {
  const { cashierId, shopId } = await request.json();

  try {
    const updatedCashier = await prisma.cashier.update({
      where: {
        id: cashierId,
      },
      data: {
        shopId: shopId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Cashier assigned to shop successfully.",
      data: updatedCashier,
    });
  } catch (error) {
    console.error("Error assigning cashier to shop:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error assigning cashier to shop.",
      },
      { status: 500 }
    );
  }
}

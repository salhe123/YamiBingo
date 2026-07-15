import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";

export async function POST(request) {
  try {
    const { floorGuyId, shopId } = await request.json();
    if (!floorGuyId || !shopId) {
      return NextResponse.json(
        { message: "floorGuyId and shopId are required" },
        { status: 400 },
      );
    }

    const updated = await prisma.floorGuy.update({
      where: { id: floorGuyId },
      data: { shopId },
      include: { user: true, shop: true },
    });

    return NextResponse.json({
      success: true,
      message: "FloorGuy assigned to shop successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("assign FloorGuy:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

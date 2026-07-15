import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";

export async function GET() {
  try {
    const unassigned = await prisma.floorGuy.findMany({
      where: { OR: [{ shopId: null }, { shopId: { isSet: false } }] },
      include: { user: true },
    });
    return NextResponse.json(unassigned);
  } catch (error) {
    // Fallback if isSet isn't supported the same on this Prisma version
    try {
      const all = await prisma.floorGuy.findMany({ include: { user: true } });
      return NextResponse.json(all.filter((f) => !f.shopId));
    } catch (err) {
      console.error("FloorGuy unassigned:", err);
      return NextResponse.json({ message: err.message }, { status: 500 });
    }
  }
}

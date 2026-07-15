import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";
import bcrypt from "bcrypt";

// Create FloorGuy user (+ FloorGuy row). Optional shopId assigns immediately.
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      shopId,
      agentId,
      userId,
    } = body;

    // Assign existing FloorGuy user to shop
    if (userId && shopId) {
      const existing = await prisma.floorGuy.findFirst({ where: { userId } });
      let floorGuy;
      if (existing) {
        floorGuy = await prisma.floorGuy.update({
          where: { id: existing.id },
          data: { shopId },
        });
      } else {
        floorGuy = await prisma.floorGuy.create({
          data: { userId, shopId, agentId: agentId || null },
        });
      }
      return NextResponse.json({ success: true, floorGuy });
    }

    if (!firstName || !lastName || !email || !password || !phoneNumber) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: "FloorGuy",
        phoneNumber,
        agentId: agentId || null,
      },
    });

    const floorGuy = await prisma.floorGuy.create({
      data: {
        userId: user.id,
        shopId: shopId || null,
        agentId: agentId || null,
        isBlocked: false,
      },
    });

    return NextResponse.json({ success: true, user, floorGuy });
  } catch (error) {
    console.error("FloorGuy POST:", error);
    return NextResponse.json(
      { message: error.message || "Failed to create FloorGuy" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const floorGuys = await prisma.floorGuy.findMany({
      include: {
        user: true,
        shop: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(floorGuys);
  } catch (error) {
    console.error("FloorGuy GET:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

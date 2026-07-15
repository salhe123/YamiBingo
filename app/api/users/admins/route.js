import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";

export const GET = async () => {
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: "Admin", // Adjust based on your role field name
      },
      select: {
        id: true,
        firstName: true,
        lastName: true, // Include fields you want to display
      },
    });
    return NextResponse.json(admins);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch admins" },
      { status: 500 }
    );
  }
};

import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";

export const PATCH = async (request) => {
  try {
    const body = await request.json();
    const { userId, action } = body;

    if (!userId || !action || (action !== "block" && action !== "unblock")) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const isBlocked = action === "block";

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isBlocked },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (err) {
    console.error("Error updating user:", err);
    return NextResponse.json(
      { success: false, message: "User update error" },
      { status: 500 }
    );
  }
};

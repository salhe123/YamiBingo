import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";

export const PATCH = async (request) => {
  try {
    const body = await request.json();
    const { cashierId, action } = body; // Destructure cashierId and action from the body

    // Validate action
    if (!cashierId || !action || (action !== "block" && action !== "unblock")) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    // Determine new blocked status based on the action
    const isBlocked = action === "block";

    // Update the user's block status directly using cashierId
    const updatedUser = await prisma.user.update({
      where: {
        // Directly using cashier.userId by joining tables internally
        id: (
          await prisma.cashier.findUnique({
            where: { id: cashierId },
          })
        ).userId,
      },
      data: { isBlocked },
    });

    return NextResponse.json(updatedUser);
  } catch (err) {
    return NextResponse.json({ message: "User update error" }, { status: 500 });
  }
};

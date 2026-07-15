import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";

export async function GET(request, { params }) {
  const resolvedParams = await params;
  const adminId = resolvedParams.adminId;
  try {
    // Retrieve the admin's data along with related shops, cashiers, and wallet
    const adminData = await prisma.user.findUnique({
      where: { id: adminId },
      include: {
        shops: {
          include: {
            cashiers: {
              include: {
                user: true, // Include cashier user info
              },
            },
            games: true,
          },
        },
        adminWallet: true,
      },
    });

    if (!adminData) {
      return NextResponse.json({ message: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json(adminData); // Return the complete data structure
  } catch (error) {
    console.error("Error fetching admin data:", error);
    return NextResponse.json(
      { message: "Could not fetch admin data" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "Agent") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const agent = await prisma.user.findUnique({
      where: { id: session.user.id, role: "Agent" },
      include: { agentWallet: { select: { balance: true } } },
    });

    if (!agent) {
      return NextResponse.json({ message: "Agent not found" }, { status: 404 });
    }

    const balance = agent.agentWallet?.balance ?? 0;

    return NextResponse.json({
      success: true,
      balance: balance.toFixed(2),
    });
  } catch (error) {
    console.error("Error fetching agent wallet:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch wallet balance" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "Agent") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { adminId, action } = await request.json();
    if (!adminId || !["activate", "deactivate"].includes(action)) {
      return NextResponse.json(
        {
          message:
            "adminId and valid action (activate/deactivate) are required",
        },
        { status: 400 }
      );
    }

    const admin = await prisma.user.findUnique({
      where: { id: adminId, role: "Admin", agentId: session.user.id },
      select: {
        id: true,
        isBlocked: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });
    console.log("Found admin:", admin);
    if (!admin) {
      return NextResponse.json(
        { message: "Admin not found or not managed by this agent" },
        { status: 404 }
      );
    }

    const isBlocked = action === "deactivate";
    const updatedAdmin = await prisma.user
      .update({
        where: { id: adminId },
        data: { isBlocked },
        select: { id: true, isBlocked: true },
      })
      .catch((dbError) => {
        console.error("Database update error:", dbError);
        throw new Error("Failed to update admin status in database");
      });

    const verifiedAdmin = await prisma.user.findUnique({
      where: { id: adminId },
      select: { isBlocked: true },
    });
    console.log("Verified admin status:", verifiedAdmin);

    if (verifiedAdmin.isBlocked !== isBlocked) {
      console.error("Update verification failed:", {
        expected: isBlocked,
        actual: verifiedAdmin.isBlocked,
      });
      throw new Error("Database update did not persist");
    }

    console.log(`Admin ${action}d:`, { adminId, isBlocked });

    return NextResponse.json(
      {
        success: true,
        message: `Admin ${action}d successfully`,
        admin: updatedAdmin,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error(`Error ${action || "updating"} admin:`, error);
    return NextResponse.json(
      { message: error.message || `Failed to ${action || "update"} admin` },
      { status: 500 }
    );
  }
}

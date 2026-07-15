import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Create a new Agent
export const POST = async (request) => {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      initialBalance = 0,
    } = body;

    if (!firstName || !lastName || !email || !password || !phoneNumber) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with role Agent
    const agent = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phoneNumber,
        role: "Agent",
        isBlocked: false, // Explicitly set to match schema
      },
    });

    // Create AgentWallet with initial balance
    const wallet = await prisma.agentWallet.create({
      data: {
        agentId: agent.id,
        balance: parseFloat(initialBalance),
      },
    });

    // Add initial transaction if initialBalance > 0
    if (initialBalance > 0) {
      await prisma.agentTransaction.create({
        data: {
          walletId: wallet.id,
          amount: parseFloat(initialBalance),
          type: "TopUp",
          description: "Initial top-up",
        },
      });
    }

    return NextResponse.json(agent, { status: 201 });
  } catch (err) {
    console.error("Error creating agent:", err);
    return NextResponse.json(
      { message: err.message || "Agent creation error" },
      { status: 500 }
    );
  }
};

// Fetch Agents
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    const where = {
      role: "Agent",
      AND: [
        search
          ? {
              OR: [
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
                { phoneNumber: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        status === "active"
          ? { isBlocked: false }
          : status === "inactive"
          ? { isBlocked: true }
          : {},
      ],
    };

    const [agents, totalAgents] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy:
          sortBy === "name"
            ? [{ firstName: sortOrder }, { lastName: sortOrder }]
            : { [sortBy]: sortOrder },
        include: {
          agentWallet: {
            select: { balance: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(totalAgents / limit);

    return NextResponse.json({
      success: true,
      agents: agents.map((agent) => ({
        ...agent,
        createdAt: agent.createdAt.toISOString(),
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalAgents,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching agents:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch agents",
      },
      { status: 500 }
    );
  }
}

// Block or unblock an Agent
export const PATCH = async (request) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "SuperAdmin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, isBlocked } = body;

    if (!id || typeof isBlocked !== "boolean") {
      return NextResponse.json(
        { message: "Agent ID and isBlocked (boolean) are required" },
        { status: 400 }
      );
    }

    const agent = await prisma.user.findUnique({
      where: { id, role: "Agent" },
    });
    if (!agent) {
      return NextResponse.json({ message: "Agent not found" }, { status: 404 });
    }

    const updatedAgent = await prisma.user.update({
      where: { id },
      data: { isBlocked },
      include: { agentWallet: { select: { balance: true } } },
    });

    console.log("Updated agent in DB:", updatedAgent); // Debug log

    return NextResponse.json({
      success: true,
      agent: {
        ...updatedAgent,
        createdAt: updatedAgent.createdAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("Error updating agent status:", err);
    return NextResponse.json(
      { message: err.message || "Agent update error" },
      { status: 500 }
    );
  }
};

import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";
import bcrypt from "bcrypt";

export const POST = async (request) => {
  try {
    const body = await request.json();
    console.log("Request Body:", body);

    const { firstName, lastName, email, password, role, phoneNumber, agentId } = body;

    if (!firstName || !lastName || !email || !password || !phoneNumber || !role) {
      return NextResponse.json(
        { message: "All fields (except agentId for SuperAdmin) are required" },
        { status: 400 }
      );
    }
    if (
      role !== "SuperAdmin" &&
      (role === "Admin" || role === "Cashier") &&
      !agentId
    ) {
      return NextResponse.json(
        { message: "agentId is required for Admin and Cashier roles" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
        phoneNumber,
        agentId:
          role === "Admin" || role === "Cashier" || role === "FloorGuy"
            ? agentId || null
            : null,
      },
    });

    console.log("Newly Created User:", newUser);

    let cashier = null;
    let floorGuy = null;
    if (role === "Cashier") {
      cashier = await prisma.cashier.create({
        data: {
          userId: newUser.id,
          shopId: null,
          isBlocked: false,
          agentId: agentId || null,
        },
      });
    }

    if (role === "FloorGuy") {
      floorGuy = await prisma.floorGuy.create({
        data: {
          userId: newUser.id,
          shopId: null,
          isBlocked: false,
          agentId: agentId || null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "User created successfully.",
      user: newUser,
      cashier,
      floorGuy,
    });
  } catch (err) {
    console.error("Error creating user:", err);
    return NextResponse.json({ message: err.message || "User Post Error" }, { status: 500 });
  }
};

export const GET = async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get("agentId");

    if (agentId) {
      // Fetch Admins
      const admins = await prisma.user.findMany({
        where: { agentId, role: "Admin" },
        include: {
          shops: {
            include: {
              wallet: true,
            },
          },
        },
      });

      // Fetch Cashiers with their associated Shop (if any)
      const cashiers = await prisma.user.findMany({
        where: { agentId, role: "Cashier" },
        include: {
          cashiers: {
            include: {
              shop: {
                include: {
                  wallet: true,
                },
              },
            },
          },
        },
      });

      // Fetch Shops assigned to the agent
      const shops = await prisma.shop.findMany({
        where: { agentId },
        include: {
          wallet: true,
        },
      });

      // Map Admins
      const mappedAdmins = admins.map((user) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isBlocked: user.isBlocked,
        createdAt: user.createdAt.toISOString(),
        shop: user.shops[0] ? {
          id: user.shops[0].id,
          shopName: user.shops[0].shopName,
          wallet: user.shops[0].wallet ? {
            id: user.shops[0].wallet.id,
            balance: user.shops[0].wallet.balance,
          } : null,
        } : null,
        type: "Admin",
      }));

      // Map Cashiers
      const mappedCashiers = cashiers.map((user) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isBlocked: user.isBlocked,
        createdAt: user.createdAt.toISOString(),
        shop: user.cashiers[0]?.shop ? {
          id: user.cashiers[0].shop.id,
          shopName: user.cashiers[0].shop.shopName,
          wallet: user.cashiers[0].shop.wallet ? {
            id: user.cashiers[0].shop.wallet.id,
            balance: user.cashiers[0].shop.wallet.balance,
          } : null,
        } : null,
        type: "Cashier",
      }));

      // Map Shops
      const mappedShops = shops.map((shop) => ({
        id: shop.id,
        shopName: shop.shopName,
        location: shop.location,
        isBlocked: shop.isBlocked,
        createdAt: shop.createdAt.toISOString(),
        wallet: shop.wallet ? {
          id: shop.wallet.id,
          balance: shop.wallet.balance,
        } : null,
        type: "Shop",
      }));

      return NextResponse.json({
        admins: mappedAdmins,
        cashiers: mappedCashiers,
        shops: mappedShops,
      });
    }

    const users = await prisma.user.findMany();
    return NextResponse.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    return NextResponse.json({ message: "Users GET Error" }, { status: 500 });
  }
};
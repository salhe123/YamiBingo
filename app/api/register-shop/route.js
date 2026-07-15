import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["Agent", "SuperAdmin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { admin, cashier, shop, walletAmount, agentId } = await req.json();

    if (!admin || !cashier || !shop || walletAmount === undefined || !agentId) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (session.user.role === "Agent" && agentId !== session.user.id) {
      return NextResponse.json({ error: "Agent ID mismatch" }, { status: 403 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create Admin
      const hashedAdminPassword = await bcrypt.hash(admin.password, 10);
      const newAdmin = await tx.user.create({
        data: {
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
          password: hashedAdminPassword,
          role: "Admin",
          phoneNumber: admin.phoneNumber,
          agentId,
        },
      });

      // Create Cashier
      const hashedCashierPassword = await bcrypt.hash(cashier.password, 10);
      const newCashier = await tx.user.create({
        data: {
          firstName: cashier.firstName,
          lastName: cashier.lastName,
          email: cashier.email,
          password: hashedCashierPassword,
          role: "Cashier",
          phoneNumber: cashier.phoneNumber,
          agentId,
        },
      });

      // Create Shop
      const newShop = await tx.shop.create({
        data: {
          shopName: shop.shopName,
          location: shop.location,
          ownerId: newAdmin.id,
          agentId,
        },
      });

      // Assign Cashier to Shop
      const cashierAssignment = await tx.cashier.create({
        data: {
          userId: newCashier.id,
          shopId: newShop.id,
          agentId,
          isBlocked: false,
        },
      });

      // Create Shop Wallet
      if (session.user.role === "Agent") {
        const agentWallet = await tx.agentWallet.findUnique({
          where: { agentId: session.user.id },
        });
        if (!agentWallet || agentWallet.balance < walletAmount) {
          throw new Error("Insufficient agent wallet balance");
        }
        await tx.agentWallet.update({
          where: { agentId: session.user.id },
          data: { balance: { decrement: walletAmount } },
        });
        await tx.agentTransaction.create({
          data: {
            walletId: agentWallet.id,
            amount: -walletAmount,
            type: "Deduction",
            description: `Transferred ${walletAmount} to shop wallet (shopId: ${newShop.id})`,
          },
        });
      }

      const newWallet = await tx.shopWallet.create({
        data: {
          shopId: newShop.id,
          balance: walletAmount,
          transactions: {
            create: {
              amount: walletAmount,
              type: "TopUp",
              description: `Initial wallet creation with balance of ${walletAmount}`,
            },
          },
        },
      });

      return { admin: newAdmin, cashier: newCashier, shop: newShop, cashierAssignment, wallet: newWallet };
    });

    return NextResponse.json({
      success: true,
      message: "Shop registered successfully",
      data: result,
    }, { status: 201 });
  } catch (err) {
    console.error("Error registering shop:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
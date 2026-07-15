/**
 * Seed full local demo data so you can test immediately.
 *
 *   node prisma/seed-demo.mjs
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function upsertUser({ email, firstName, lastName, role, password, phoneNumber, agentId }) {
  const hashed = await bcrypt.hash(password, 10);
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return prisma.user.update({
      where: { email },
      data: { password: hashed, role, agentId: agentId || null, isBlocked: false },
    });
  }
  return prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashed,
      role,
      phoneNumber,
      agentId: agentId || null,
    },
  });
}

async function main() {
  const password = "password123";

  const superAdmin = await upsertUser({
    email: "superadmin@yemi.local",
    firstName: "Super",
    lastName: "Admin",
    role: "SuperAdmin",
    password,
    phoneNumber: "0911000001",
  });

  const agent = await upsertUser({
    email: "agent@yemi.local",
    firstName: "Demo",
    lastName: "Agent",
    role: "Agent",
    password,
    phoneNumber: "0911000002",
  });

  let agentWallet = await prisma.agentWallet.findUnique({ where: { agentId: agent.id } });
  if (!agentWallet) {
    agentWallet = await prisma.agentWallet.create({
      data: { agentId: agent.id, balance: 100000 },
    });
  } else {
    agentWallet = await prisma.agentWallet.update({
      where: { agentId: agent.id },
      data: { balance: 100000 },
    });
  }

  const admin = await upsertUser({
    email: "admin@yemi.local",
    firstName: "Shop",
    lastName: "Admin",
    role: "Admin",
    password,
    phoneNumber: "0911000003",
    agentId: agent.id,
  });

  const cashierUser = await upsertUser({
    email: "cashier@yemi.local",
    firstName: "Demo",
    lastName: "Cashier",
    role: "Cashier",
    password,
    phoneNumber: "0911000004",
    agentId: agent.id,
  });

  const floorUser = await upsertUser({
    email: "floorguy@yemi.local",
    firstName: "Demo",
    lastName: "FloorGuy",
    role: "FloorGuy",
    password,
    phoneNumber: "0911000005",
    agentId: agent.id,
  });

  let shop = await prisma.shop.findFirst({ where: { shopName: "Demo Shop" } });
  if (!shop) {
    shop = await prisma.shop.create({
      data: {
        shopName: "Demo Shop",
        location: "Addis Ababa",
        ownerId: admin.id,
        agentId: agent.id,
        shopCommissionRate: 0.2,
      },
    });
  } else {
    shop = await prisma.shop.update({
      where: { id: shop.id },
      data: { ownerId: admin.id, agentId: agent.id },
    });
  }

  let wallet = await prisma.shopWallet.findUnique({ where: { shopId: shop.id } });
  if (!wallet) {
    wallet = await prisma.shopWallet.create({
      data: { shopId: shop.id, balance: 50000 },
    });
  } else {
    wallet = await prisma.shopWallet.update({
      where: { shopId: shop.id },
      data: { balance: 50000 },
    });
  }

  let cashier = await prisma.cashier.findFirst({ where: { userId: cashierUser.id } });
  if (!cashier) {
    cashier = await prisma.cashier.create({
      data: {
        userId: cashierUser.id,
        shopId: shop.id,
        agentId: agent.id,
        isBlocked: false,
      },
    });
  } else {
    cashier = await prisma.cashier.update({
      where: { id: cashier.id },
      data: { shopId: shop.id, agentId: agent.id, isBlocked: false },
    });
  }

  let floorGuy = await prisma.floorGuy.findFirst({ where: { userId: floorUser.id } });
  if (!floorGuy) {
    floorGuy = await prisma.floorGuy.create({
      data: {
        userId: floorUser.id,
        shopId: shop.id,
        agentId: agent.id,
        isBlocked: false,
      },
    });
  } else {
    floorGuy = await prisma.floorGuy.update({
      where: { id: floorGuy.id },
      data: { shopId: shop.id, agentId: agent.id, isBlocked: false },
    });
  }

  // Ensure empty card selection for shop
  const selection = await prisma.cardSelection.findUnique({ where: { shopId: shop.id } });
  if (!selection) {
    await prisma.cardSelection.create({
      data: { shopId: shop.id, selectedCards: [], locked: false },
    });
  } else {
    await prisma.cardSelection.update({
      where: { shopId: shop.id },
      data: { selectedCards: [], locked: false },
    });
  }

  console.log("\n✅ Demo data ready. Password for all users: password123\n");
  console.log("  SuperAdmin : superadmin@yemi.local  → /SuperAdmin");
  console.log("  Agent      : agent@yemi.local       → /Agent");
  console.log("  Admin      : admin@yemi.local       → /Admin");
  console.log("  Cashier    : cashier@yemi.local     → /Cashier  then open Bingo Game");
  console.log("  FloorGuy   : floorguy@yemi.local    → /FloorGuy (select-only)\n");
  console.log("Shop:", shop.shopName, "| wallet:", wallet.balance);
  console.log("Login: http://localhost:3000/auth/login\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

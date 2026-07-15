/**
 * Seed a FloorGuy (and optional SuperAdmin) for local testing.
 *
 * Usage:
 *   node prisma/seed-floorguy.mjs
 *
 * Env: DATABASE_URL must point at your MongoDB.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("floorguy123", 10);

  // Pick first shop if any
  const shop = await prisma.shop.findFirst();
  if (!shop) {
    console.log(
      "No shop found. Create a shop first (SuperAdmin Auto-CASW / register-shop), then re-run.",
    );
    return;
  }

  const email = "floorguy@yemi.local";
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        firstName: "Floor",
        lastName: "Guy",
        email,
        password,
        role: "FloorGuy",
        phoneNumber: "0900000000",
      },
    });
    console.log("Created user", email);
  } else {
    console.log("User already exists", email);
  }

  let floorGuy = await prisma.floorGuy.findFirst({ where: { userId: user.id } });
  if (!floorGuy) {
    floorGuy = await prisma.floorGuy.create({
      data: {
        userId: user.id,
        shopId: shop.id,
        isBlocked: false,
      },
    });
  } else {
    floorGuy = await prisma.floorGuy.update({
      where: { id: floorGuy.id },
      data: { shopId: shop.id },
    });
  }

  console.log("FloorGuy ready:");
  console.log("  email:   ", email);
  console.log("  password:", "floorguy123");
  console.log("  shop:    ", shop.shopName, `(${shop.id})`);
  console.log("  Login → /FloorGuy select-only screen");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

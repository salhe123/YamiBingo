import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/libs/prismadb";

async function assertShopAccess(session, shopId) {
  if (!session?.user) {
    return { error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  }

  const role = session.user.role;
  if (role === "SuperAdmin" || role === "Supervisor") {
    return { ok: true };
  }

  if (
    (role === "Cashier" || role === "FloorGuy" || role === "Admin") &&
    session.user.shopId === shopId
  ) {
    return { ok: true };
  }

  return { error: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
}

async function getOrCreateSelection(shopId) {
  let selection = await prisma.cardSelection.findUnique({ where: { shopId } });
  if (!selection) {
    selection = await prisma.cardSelection.create({
      data: { shopId, selectedCards: [], locked: false },
    });
  }
  return selection;
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get("shopId") || session?.user?.shopId;

    if (!shopId) {
      return NextResponse.json({ message: "shopId is required" }, { status: 400 });
    }

    const access = await assertShopAccess(session, shopId);
    if (access.error) return access.error;

    const selection = await getOrCreateSelection(shopId);

    return NextResponse.json({
      selectedCards: selection.selectedCards,
      locked: selection.locked,
      updatedAt: selection.updatedAt,
      updatedBy: selection.updatedBy,
    });
  } catch (error) {
    console.error("card-selection GET:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const shopId = body.shopId || session?.user?.shopId;
    const action = body.action; // toggle | set | clear | lock | unlock
    const userId = session?.user?.id;

    if (!shopId) {
      return NextResponse.json({ message: "shopId is required" }, { status: 400 });
    }

    const access = await assertShopAccess(session, shopId);
    if (access.error) return access.error;

    const current = await getOrCreateSelection(shopId);

    // FloorGuy may only toggle/set/clear while unlocked
    if (session.user.role === "FloorGuy") {
      if (action === "lock" || action === "unlock") {
        return NextResponse.json(
          { message: "FloorGuy cannot lock/unlock selection" },
          { status: 403 },
        );
      }
      if (current.locked) {
        return NextResponse.json(
          { message: "Selection is locked — game already started" },
          { status: 409 },
        );
      }
    }

    let selectedCards = [...(current.selectedCards || [])];
    let locked = current.locked;

    if (action === "toggle") {
      if (current.locked && session.user.role !== "Cashier") {
        return NextResponse.json(
          { message: "Selection is locked" },
          { status: 409 },
        );
      }
      if (current.locked && session.user.role === "Cashier") {
        // Allow cashier to still change before draw? Once locked mid-game usually no.
        // Keep locked state; cashier can still toggle if we want — but typically lock means freeze.
        return NextResponse.json(
          { message: "Selection is locked — unlock by restarting selection" },
          { status: 409 },
        );
      }
      const card = Number(body.cardNumber);
      if (!Number.isInteger(card) || card < 1 || card > 200) {
        return NextResponse.json({ message: "Invalid cardNumber" }, { status: 400 });
      }
      if (selectedCards.includes(card)) {
        selectedCards = selectedCards.filter((n) => n !== card);
      } else {
        selectedCards.push(card);
      }
    } else if (action === "set") {
      if (current.locked) {
        return NextResponse.json({ message: "Selection is locked" }, { status: 409 });
      }
      const cards = Array.isArray(body.selectedCards)
        ? body.selectedCards.map(Number).filter((n) => n >= 1 && n <= 200)
        : [];
      selectedCards = [...new Set(cards)];
    } else if (action === "clear") {
      if (current.locked && session.user.role === "FloorGuy") {
        return NextResponse.json({ message: "Selection is locked" }, { status: 409 });
      }
      selectedCards = [];
      if (session.user.role === "Cashier") locked = false;
    } else if (action === "lock") {
      locked = true;
    } else if (action === "unlock") {
      locked = false;
      if (body.clear) selectedCards = [];
    } else {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }

    const updated = await prisma.cardSelection.update({
      where: { shopId },
      data: {
        selectedCards,
        locked,
        updatedBy: userId || null,
      },
    });

    return NextResponse.json({
      selectedCards: updated.selectedCards,
      locked: updated.locked,
      updatedAt: updated.updatedAt,
      updatedBy: updated.updatedBy,
    });
  } catch (error) {
    console.error("card-selection PATCH:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

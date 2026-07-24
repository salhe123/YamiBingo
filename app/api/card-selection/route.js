import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { TOTAL_CARDS } from "@/lib/bingoCards";
import {
  getOrCreateCardSelection,
  updateCardSelection,
} from "@/libs/cardSelectionDb";

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

function payload(selection) {
  return {
    selectedCards: selection.selectedCards,
    locked: selection.locked,
    selectionOpen: selection.selectionOpen,
    updatedAt: selection.updatedAt,
    updatedBy: selection.updatedBy,
  };
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

    const selection = await getOrCreateCardSelection(shopId);
    return NextResponse.json(payload(selection));
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
    const action = body.action;
    const userId = session?.user?.id;

    if (!shopId) {
      return NextResponse.json({ message: "shopId is required" }, { status: 400 });
    }

    const access = await assertShopAccess(session, shopId);
    if (access.error) return access.error;

    const current = await getOrCreateCardSelection(shopId);

    // FloorGuy: only toggle/set/clear while open + unlocked
    if (session.user.role === "FloorGuy") {
      if (["lock", "unlock", "open", "close"].includes(action)) {
        return NextResponse.json(
          { message: "FloorGuy cannot change selection session state" },
          { status: 403 },
        );
      }
      if (current.locked || !current.selectionOpen) {
        return NextResponse.json(
          {
            message: current.locked
              ? "Selection is locked — game already started"
              : "Waiting for cashier to open card selection",
          },
          { status: 409 },
        );
      }
    }

    let selectedCards = [...(current.selectedCards || [])];
    let locked = current.locked;
    let selectionOpen = current.selectionOpen;

    if (action === "toggle") {
      if (current.locked) {
        return NextResponse.json(
          { message: "Selection is locked — unlock by restarting selection" },
          { status: 409 },
        );
      }
      const card = Number(body.cardNumber);
      if (!Number.isInteger(card) || card < 1 || card > TOTAL_CARDS) {
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
        ? body.selectedCards.map(Number).filter((n) => n >= 1 && n <= TOTAL_CARDS)
        : [];
      selectedCards = [...new Set(cards)];
    } else if (action === "clear") {
      if (current.locked && session.user.role === "FloorGuy") {
        return NextResponse.json({ message: "Selection is locked" }, { status: 409 });
      }
      selectedCards = [];
      if (session.user.role === "Cashier") locked = false;
    } else if (action === "lock") {
      // Game started — close floor selection
      locked = true;
      selectionOpen = false;
    } else if (action === "unlock") {
      locked = false;
      selectionOpen = true;
      if (body.clear) selectedCards = [];
    } else if (action === "open") {
      // Cashier opened Bingo Game selection screen
      locked = false;
      selectionOpen = true;
    } else if (action === "close") {
      // Cashier left selection / closed tab
      selectionOpen = false;
    } else {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }

    const updated = await updateCardSelection(shopId, {
      selectedCards,
      locked,
      selectionOpen,
      updatedBy: userId || null,
    });

    return NextResponse.json(payload(updated));
  } catch (error) {
    console.error("card-selection PATCH:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

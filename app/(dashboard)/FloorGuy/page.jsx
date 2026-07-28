"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useSharedCardSelection } from "@/lib/useSharedCardSelection";
import { TOTAL_CARDS } from "@/lib/bingoCards";
import "@/app/Game/styles.css";

export default function FloorGuyPage() {
  const { data: session, status } = useSession();
  const shopId = session?.user?.shopId;
  const [betNumbers, setBetNumbers] = useState([]);
  const [busyCard, setBusyCard] = useState(null);

  const { locked, selectionOpen, syncing, toggleCard, clearCards } =
    useSharedCardSelection({
      shopId,
      enabled: status === "authenticated" && !!shopId,
      pollMs: 400,
      onRemoteChange: (cards) => {
        setBetNumbers(cards);
      },
    });

  const canSelect = selectionOpen && !locked;

  const handleToggle = async (card) => {
    if (!canSelect) {
      toast(
        locked
          ? "Game already started — selection locked"
          : "Wait for cashier to open card selection",
      );
      return;
    }
    setBetNumbers((prev) =>
      prev.includes(card) ? prev.filter((n) => n !== card) : [...prev, card],
    );
    setBusyCard(card);
    try {
      const data = await toggleCard(card);
      if (data?.selectedCards) setBetNumbers(data.selectedCards);
    } catch (err) {
      toast(err.response?.data?.message || "Failed to select card");
    } finally {
      setBusyCard(null);
    }
  };

  const handleClear = async () => {
    if (!canSelect) {
      toast(
        locked
          ? "Game already started — selection locked"
          : "Wait for cashier to open card selection",
      );
      return;
    }
    setBetNumbers([]);
    try {
      await clearCards();
    } catch (err) {
      toast(err.response?.data?.message || "Failed to clear");
    }
  };

  if (status === "loading") {
    return (
      <div className="p-8 text-center text-slate-300">Loading…</div>
    );
  }

  if (!shopId) {
    return (
      <div className="p-8 text-center text-slate-200 space-y-3">
        <h1 className="text-2xl font-bold text-orange-400">Floor Guy</h1>
        <p>Your account is not assigned to a shop yet. Ask your cashier.</p>
      </div>
    );
  }

  // Locked after New Game (checked before waiting — lock also closes selectionOpen)
  if (locked) {
    return (
      <div className="p-6 md:p-10 flex flex-col items-center justify-center min-h-[70vh] text-center gap-4">
        <h1 className="text-2xl font-bold text-red-400">Game started</h1>
        <p className="text-slate-300 max-w-md">
          Selection is locked. Wait for the cashier to finish and open a new
          selection round.
        </p>
        <p className="text-slate-400 text-sm">
          Players registered this round: {betNumbers.length}
        </p>
      </div>
    );
  }

  // Waiting: cashier has not opened Bingo Game selection yet
  if (!selectionOpen) {
    return (
      <div className="p-6 md:p-10 flex flex-col items-center justify-center min-h-[70vh] text-center gap-4">
        <div className="w-16 h-16 rounded-full border-4 border-orange-400 border-t-transparent animate-spin" />
        <h1 className="text-2xl font-bold text-orange-400">Waiting for cashier</h1>
        <p className="text-slate-300 max-w-md">
          This account is FloorGuy — you only select cards here.
          On another browser (or Incognito), login as{" "}
          <span className="text-orange-300 font-semibold">Cashier</span>, open{" "}
          <span className="text-orange-300 font-semibold">Bingo Game</span>, and
          stay on <span className="text-orange-300">/Game</span>. Then this
          table appears automatically.
        </p>
        <p className="text-sm text-slate-500">
          Shop: {session?.user?.shopName || "—"} · You:{" "}
          {session?.user?.email}
        </p>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-5">
      <header className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-bold text-orange-400">Select Cards</h1>
          <p className="text-sm text-slate-300">
            {session?.user?.shopName || "Shop"} · syncs to cashier
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="px-3 py-1 rounded-full bg-emerald-600">Selecting</span>
          <span className="text-slate-300">
            Cards 1–{TOTAL_CARDS} · Players:{" "}
            <strong className="text-white">{betNumbers.length}</strong>
            {syncing ? " · syncing…" : ""}
          </span>
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-1.5 bg-red-500 rounded"
          >
            Clear
          </button>
        </div>
      </header>

      <div className="cardSelectionArea !min-h-0 !grid-rows-none !h-[calc(100vh-180px)] !block bg-slate-800 rounded-xl p-3">
        <div className="cardSelector !col-span-full !row-auto !h-full !flex !flex-col">
          <div className="cardSelectSec !w-full !h-full !max-h-none !overflow-hidden !flex !flex-col">
            <div
              className="cardGrid !h-auto !overflow-y-auto"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(44px, 1fr))",
                gap: "4px",
                flex: 1,
                minHeight: 0,
                maxHeight: "calc(100vh - 220px)",
              }}
            >
              {Array.from({ length: TOTAL_CARDS }, (_, i) => i + 1).map((n) => {
                const selected = betNumbers.includes(n);
                return (
                  <button
                    key={n}
                    type="button"
                    disabled={busyCard === n}
                    onClick={() => handleToggle(n)}
                    className={selected ? "cardselected" : "cardToselect"}
                    style={{ minHeight: "42px", fontSize: "16px" }}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

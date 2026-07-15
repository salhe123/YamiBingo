"use client";

import React, { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
import { useSharedCardSelection } from "@/lib/useSharedCardSelection";
import "@/app/Game/styles.css";

const TOTAL_CARDS = 200;

export default function FloorGuyPage() {
  const { data: session, status } = useSession();
  const shopId = session?.user?.shopId;
  const [betNumbers, setBetNumbers] = useState([]);
  const [busyCard, setBusyCard] = useState(null);

  const { locked, syncing, toggleCard, clearCards } = useSharedCardSelection({
    shopId,
    enabled: status === "authenticated" && !!shopId,
    pollMs: 400,
    onRemoteChange: (cards) => {
      setBetNumbers(cards);
    },
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/auth/login";
    }
  }, [status]);

  const handleToggle = async (card) => {
    if (locked) {
      toast("Game already started — selection locked");
      return;
    }
    // Optimistic UI
    setBetNumbers((prev) =>
      prev.includes(card) ? prev.filter((n) => n !== card) : [...prev, card],
    );
    setBusyCard(card);
    try {
      const data = await toggleCard(card);
      if (data?.selectedCards) setBetNumbers(data.selectedCards);
    } catch (err) {
      toast(err.response?.data?.message || "Failed to select card");
      // Revert via next poll
    } finally {
      setBusyCard(null);
    }
  };

  const handleClear = async () => {
    if (locked) {
      toast("Game already started — selection locked");
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
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Loading…
      </div>
    );
  }

  if (!shopId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-4 p-6 text-center">
        <h1 className="text-2xl font-bold">Floor Guy</h1>
        <p>Your account is not assigned to a shop yet. Contact SuperAdmin.</p>
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="px-4 py-2 bg-red-600 rounded"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-3 md:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-orange-400">Floor Guy</h1>
          <p className="text-sm text-slate-300">
            {session?.user?.shopName || "Shop"} · Select player cards only
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span
            className={`px-3 py-1 rounded-full ${
              locked ? "bg-red-600" : "bg-emerald-600"
            }`}
          >
            {locked ? "Locked (game started)" : "Selecting"}
          </span>
          <span className="text-slate-300">
            Players: <strong className="text-white">{betNumbers.length}</strong>
            {syncing ? " · syncing…" : ""}
          </span>
          <button
            type="button"
            disabled={locked}
            onClick={handleClear}
            className="px-3 py-1.5 bg-red-500 rounded disabled:opacity-40"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="px-3 py-1.5 bg-slate-700 rounded"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="cardSelectionArea !min-h-0 !grid-rows-none !h-auto bg-slate-800 rounded-xl p-3">
        <div className="cardSelector !col-span-full !row-auto">
          <div className="cardSelectSec !w-full !h-auto !max-h-none overflow-visible">
            <div
              className="cardGrid !h-auto"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(44px, 1fr))",
                gap: "4px",
              }}
            >
              {Array.from({ length: TOTAL_CARDS }, (_, i) => i + 1).map(
                (n) => {
                  const selected = betNumbers.includes(n);
                  return (
                    <button
                      key={n}
                      type="button"
                      disabled={locked || busyCard === n}
                      onClick={() => handleToggle(n)}
                      className={selected ? "cardselected" : "cardToselect"}
                      style={{
                        opacity: locked ? 0.7 : 1,
                        cursor: locked ? "not-allowed" : "pointer",
                        minHeight: "42px",
                        fontSize: "16px",
                      }}
                    >
                      {n}
                    </button>
                  );
                },
              )}
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-slate-400 text-sm text-center">
        Selections sync instantly to the cashier game screen for this shop.
      </p>
    </div>
  );
}

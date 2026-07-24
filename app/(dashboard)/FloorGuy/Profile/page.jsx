"use client";

import React from "react";
import { useSession } from "next-auth/react";

export default function FloorGuyProfilePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="p-8 text-slate-300">Loading…</div>;
  }

  if (status !== "authenticated") {
    return <div className="p-8 text-slate-300">Not logged in</div>;
  }

  const user = session.user || {};

  const rows = [
    ["Role", user.role || "FloorGuy"],
    ["Email", user.email || "—"],
    ["Shop", user.shopName || "—"],
    ["Shop ID", user.shopId || "—"],
    ["FloorGuy ID", user.floorGuyId || "—"],
    ["User ID", user.id || "—"],
    ["Blocked", user.isBlocked ? "Yes" : "No"],
  ];

  return (
    <div className="p-4 md:p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-orange-400 mb-2">My Profile</h1>
      <p className="text-slate-400 text-sm mb-6">
        FloorGuy account linked to your cashier&apos;s shop.
      </p>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            {rows.map(([label, value]) => (
              <tr key={label} className="border-b border-slate-700 last:border-0">
                <td className="px-4 py-3 text-slate-400 w-1/3">{label}</td>
                <td className="px-4 py-3 text-white font-medium break-all">
                  {String(value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-slate-500 text-xs">
        You can only select cards when the cashier opens Bingo Game selection.
        You cannot start or control the game.
      </p>
    </div>
  );
}

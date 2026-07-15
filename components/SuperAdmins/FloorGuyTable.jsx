"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function FloorGuyTable() {
  const [floorGuys, setFloorGuys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/floor-guys")
      .then((res) => setFloorGuys(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-300">Loading FloorGuys…</p>;

  return (
    <div className="overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4 text-white">FloorGuys</h2>
      <table className="min-w-full text-sm text-left text-slate-200">
        <thead className="bg-slate-900 text-slate-300">
          <tr>
            <th className="px-3 py-2">Name</th>
            <th className="px-3 py-2">Email</th>
            <th className="px-3 py-2">Phone</th>
            <th className="px-3 py-2">Shop</th>
            <th className="px-3 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {floorGuys.length === 0 && (
            <tr>
              <td colSpan={5} className="px-3 py-4 text-slate-400">
                No FloorGuys yet. Register one under Users with role FloorGuy.
              </td>
            </tr>
          )}
          {floorGuys.map((fg) => (
            <tr key={fg.id} className="border-b border-slate-700">
              <td className="px-3 py-2">
                {fg.user
                  ? `${fg.user.firstName} ${fg.user.lastName}`
                  : "—"}
              </td>
              <td className="px-3 py-2">{fg.user?.email || "—"}</td>
              <td className="px-3 py-2">{fg.user?.phoneNumber || "—"}</td>
              <td className="px-3 py-2">
                {fg.shop?.shopName || (
                  <span className="text-amber-400">Unassigned</span>
                )}
              </td>
              <td className="px-3 py-2">
                {fg.isBlocked || fg.user?.isBlocked ? (
                  <span className="text-red-400">Blocked</span>
                ) : (
                  <span className="text-emerald-400">Active</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

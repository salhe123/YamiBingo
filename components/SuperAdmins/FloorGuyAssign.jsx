"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function FloorGuyAssign() {
  const [floorGuys, setFloorGuys] = useState([]);
  const [shops, setShops] = useState([]);
  const [selectedFloorGuy, setSelectedFloorGuy] = useState("");
  const [selectedShop, setSelectedShop] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    try {
      const [shopRes, fgRes] = await Promise.all([
        axios.get("/api/shops"),
        axios.get("/api/floor-guys/unassigned"),
      ]);
      setShops(shopRes.data || []);
      setFloorGuys(fgRes.data || []);
    } catch (err) {
      console.error(err);
      setError("Error fetching data.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFloorGuy || !selectedShop) {
      setError("Please select both FloorGuy and shop.");
      return;
    }
    try {
      await axios.post("/api/floor-guys/assign", {
        floorGuyId: selectedFloorGuy,
        shopId: selectedShop,
      });
      setSuccess("FloorGuy assigned to shop successfully.");
      setError("");
      setSelectedFloorGuy("");
      setSelectedShop("");
      load();
    } catch (err) {
      console.error(err);
      setError("Error assigning FloorGuy.");
      setSuccess("");
    }
  };

  return (
    <div className="max-w-lg w-full rounded-lg shadow-md bg-gray-800 p-6 text-white">
      <h2 className="text-2xl font-semibold">Assign FloorGuy to Shop</h2>
      {error && <div className="text-red-500 mt-4">{error}</div>}
      {success && <div className="text-green-500 mt-4">{success}</div>}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label className="block font-medium mb-2">Select Shop</label>
          <select
            value={selectedShop}
            onChange={(e) => setSelectedShop(e.target.value)}
            className="p-2 border rounded text-gray-900 w-full"
          >
            <option value="">-- Select Shop --</option>
            {shops.map((shop) => (
              <option key={shop.id} value={shop.id}>
                {shop.shopName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-2">Select FloorGuy</label>
          <select
            value={selectedFloorGuy}
            onChange={(e) => setSelectedFloorGuy(e.target.value)}
            className="p-2 border rounded text-gray-900 w-full"
          >
            <option value="">-- Select FloorGuy --</option>
            {floorGuys.map((fg) => (
              <option key={fg.id} value={fg.id}>
                {fg.user
                  ? `${fg.user.firstName} ${fg.user.lastName} (${fg.user.email})`
                  : fg.id}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded"
        >
          Assign
        </button>
      </form>
    </div>
  );
}

"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { TbListDetails } from "react-icons/tb";
import { useSession } from "next-auth/react";

const ShopsTable = () => {
  const [shopsData, setShopsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commissionInputs, setCommissionInputs] = useState({});
  const [savingShopId, setSavingShopId] = useState(null);
  const { data: session } = useSession();
  const [editingShopId, setEditingShopId] = useState(null);

  const adminId = session?.user?.id;

  useEffect(() => {
    const fetchShopsData = async () => {
      if (!adminId) return;
      try {
        const response = await axios.get(`/api/admins/shops/${adminId}`);
        setShopsData(response.data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchShopsData();
  }, [adminId]);

  const handleCommissionChange = (shopId, value) => {
    setCommissionInputs({ ...commissionInputs, [shopId]: value });
  };

  const validateCommissionRate = (newRate) => {
    const newPercent = parseInt(newRate);
    return newPercent >= 10 && newPercent <= 100;
  };

  const updateCommission = async (shopId) => {
    try {
      const rate = commissionInputs[shopId];
      if (rate === undefined || isNaN(rate)) {
        alert("Please enter a valid percentage");
        return;
      }

      const shop = shopsData.find((s) => s.id === shopId);
      if (!validateCommissionRate(rate, shop.shopCommissionRate)) {
        alert("Commission rate must be between 10% and 100%.");
        return;
      }

      setSavingShopId(shopId);
      const response = await axios.patch(`/api/shops/${shopId}`, {
        shopCommissionRate: parseInt(rate) / 100,
      });

      const updatedShop = response.data;
      setShopsData((prev) =>
        prev.map((s) => (s.id === shopId ? updatedShop : s))
      );

      setEditingShopId(null);
      setCommissionInputs((prev) => {
        const copy = { ...prev };
        delete copy[shopId];
        return copy;
      });

      alert("Shop commission updated successfully");
    } catch (error) {
      alert("Failed to update commission rate");
      console.error(error);
    } finally {
      setSavingShopId(null);
    }
  };

  if (loading)
    return (
      <div className="text-center text-gray-600 py-10">Loading shops...</div>
    );
  if (error)
    return (
      <div className="text-center text-red-500 py-10">
        Error fetching shop data: {error.message}
      </div>
    );
  if (!shopsData || shopsData.length === 0)
    return (
      <div className="text-gray-500 text-center py-10">
        No shops found for this admin
      </div>
    );

  return (
    <div className="mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Shops</h2>
      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4 text-center">View Shop</th>
              <th className="px-6 py-4 text-center">Shop Name</th>
              <th className="px-6 py-4 text-center">Location</th>
              <th className="px-6 py-4 text-center">Cashier Name</th>
              <th className="px-6 py-4 text-center">
                Shop Commission Rate (%)
              </th>
              <th className="px-6 py-4 text-center">Shop Commission ($)</th>
              <th className="px-6 py-4 text-center">System Commission ($)</th>
              <th className="px-6 py-4 text-center">Wallet Balance</th>
              <th className="px-6 py-4 text-center">Shop ID</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {shopsData.map((shop, index) => {
              const totalShopCommission = (shop.games ?? []).reduce(
                (acc, game) => acc + (game.shopCommission || 0),
                0
              );
              const totalSystemCommission = (shop.games ?? []).reduce(
                (acc, game) => acc + (game.systemCommission || 0),
                0
              );

              const cashierName =
                shop.cashiers?.length > 0
                  ? `${shop.cashiers[0]?.user?.firstName ?? ""} ${
                      shop.cashiers[0]?.user?.lastName ?? ""
                    }`
                  : "No cashiers assigned";

              return (
                <tr
                  key={shop.id ?? index}
                  className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <td className="px-6 py-4 text-center">
                    {shop.id ? (
                      <Link href={`/Admin/Shops/${shop.id}`}>
                        <TbListDetails
                          size={30}
                          className="inline-block text-orange-500 hover:text-orange-600 transition-colors"
                        />
                      </Link>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="px-6 py-4 text-center font-medium">
                    {shop.shopName ?? "N/A"}
                  </td>
                  <td className="px-6 py-4 text-center text-sm">
                    {shop.location ?? "N/A"}
                  </td>
                  <td className="px-6 py-4 text-center text-sm">
                    {cashierName}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {editingShopId === shop.id ? (
                      <>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="10"
                          value={
                            commissionInputs[shop.id] !== undefined
                              ? commissionInputs[shop.id]
                              : shop.shopCommissionRate
                              ? Math.round(shop.shopCommissionRate * 100)
                              : ""
                          }
                          onChange={(e) =>
                            handleCommissionChange(shop.id, e.target.value)
                          }
                          className="w-20 px-2 py-1 border rounded"
                          placeholder="Enter % (e.g., 20, 30, 40)"
                        />
                        <button
                          onClick={() => updateCommission(shop.id)}
                          disabled={savingShopId === shop.id}
                          className={`ml-2 px-2 py-1 rounded text-sm text-white ${
                            savingShopId === shop.id
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-green-500 hover:bg-green-600"
                          }`}
                        >
                          {savingShopId === shop.id ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={() => setEditingShopId(null)}
                          disabled={savingShopId === shop.id}
                          className="ml-1 bg-gray-400 hover:bg-gray-500 text-white px-2 py-1 rounded text-sm"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <span
                        onClick={() => setEditingShopId(shop.id)}
                        className="cursor-pointer text-blue-600 hover:underline"
                      >
                        {shop.shopCommissionRate
                          ? Math.round(shop.shopCommissionRate * 100) + "%"
                          : "N/A"}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-green-600 font-semibold">
                      ${totalShopCommission.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-green-600 font-semibold">
                      ${totalSystemCommission.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-green-600 font-semibold">
                      ${shop.wallet?.balance?.toFixed(2) ?? "0.00"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm">
                    {shop.id ? shop.id.slice(-5) : "N/A"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShopsTable;

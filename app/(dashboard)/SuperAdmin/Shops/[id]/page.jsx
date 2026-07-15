"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import dayjs from "dayjs";
import {
  FiActivity,
  FiDollarSign,
  FiCreditCard,
  FiPieChart,
  FiUser,
} from "react-icons/fi";

export default function ShopStats() {
  const { id: cashierId } = useParams();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dates, setDates] = useState({
    startDate: "2025-01-01",
    endDate: dayjs().format("YYYY-MM-DD"),
  });

  useEffect(() => {
    fetchStats();
  }, [dates]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/superAdmin/shops/shop/${cashierId}`, {
        params: {
          startDate: dates.startDate,
          endDate: dates.endDate,
        },
      });
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching shop stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-200 h-12 w-12"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Shop Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <StatCard
          title="Shop Name"
          value={stats.shopName}
          icon={<FiActivity className="w-6 h-6" />}
          color="from-gray-500 to-gray-600"
        />
        <StatCard
          title="Owner Name"
          value={stats.ownerName}
          icon={<FiUser className="w-6 h-6" />}
          color="from-gray-700 to-gray-800"
        />
        <StatCard
          title="Shop Commission Rate"
          value={`${(stats.shopCommissionRate * 100).toFixed(2)}%`}
          icon={<FiDollarSign className="w-6 h-6" />}
          color="from-yellow-500 to-yellow-600"
        />
      </div>

      {/* Date Picker */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex-1">
          <label
            htmlFor="startDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Start Date
          </label>
          <input
            id="startDate"
            type="date"
            value={dates.startDate}
            onChange={(e) => setDates({ ...dates, startDate: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
        <div className="flex-1">
          <label
            htmlFor="endDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            End Date
          </label>
          <input
            id="endDate"
            type="date"
            value={dates.endDate}
            onChange={(e) => setDates({ ...dates, endDate: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => {
              setDates({
                startDate: dayjs().format("YYYY-MM-DD"),
                endDate: dayjs().format("YYYY-MM-DD"),
              });
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Today
          </button>

          <button
            onClick={() => {
              setDates({
                startDate: dayjs().subtract(6, "day").format("YYYY-MM-DD"), 
                endDate: dayjs().format("YYYY-MM-DD"),
              });
            }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Weekly
          </button>

          <button
            onClick={() => {
              setDates({
                startDate: dayjs().subtract(29, "day").format("YYYY-MM-DD"), 
                endDate: dayjs().format("YYYY-MM-DD"),
              });
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Games Played"
          value={stats.totalGamesPlayed}
          icon={<FiActivity className="w-6 h-6" />}
          color="from-blue-500 to-blue-600"
        />
        <StatCard
          title="Shop Commission"
          value={`$${stats.totalShopCommission.toFixed(2)}`}
          icon={<FiDollarSign className="w-6 h-6" />}
          color="from-green-500 to-green-600"
        />
        <StatCard
          title="System Commission"
          value={`$${stats.totalSystemCommission.toFixed(2)}`}
          icon={<FiCreditCard className="w-6 h-6" />}
          color="from-purple-500 to-purple-600"
        />
        <StatCard
          title="Wallet Balance"
          value={`$${stats.walletBalance.toFixed(2)}`}
          icon={<FiPieChart className="w-6 h-6" />}
          color="from-orange-500 to-orange-600"
        />
        <StatCard
          title="Total Transactions"
          value={`$${stats.totalWalletTransactions.toFixed(2)}`}
          icon={<FiDollarSign className="w-6 h-6" />}
          color="from-pink-500 to-pink-600"
        />
      </div>
      {/* Last Five Games Table */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Last Five Games</h2>
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Bet Amount
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Players
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Winning Amount
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Shop Commission
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  System Commission
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.lastFiveGames && stats.lastFiveGames.length > 0 ? (
                stats.lastFiveGames.map((game) => (
                  <tr key={game.id} className="bg-white border-b">
                    <td className="px-1 sm:px-4 py-2 text-center">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          game.status === "active"
                            ? "bg-red-100 text-red-800"
                            : game.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {game.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      $
                      {game.betAmount?.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }) ?? "0.00"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {game.numberOfPlayers ?? 0}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      $
                      {game.winningAmount?.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }) ?? "0.00"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      $
                      {game.shopCommission?.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }) ?? "0.00"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      $
                      {game.systemCommission?.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }) ?? "0.00"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {game.createdAt
                        ? dayjs(game.createdAt).format("YYYY-MM-DD HH:mm")
                        : "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No games found for this shop.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div
      className={`bg-gradient-to-br ${color} rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300`}
    >
      <div className="p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium opacity-90">{title}</p>
            <h3 className="text-2xl font-bold mt-2">{value}</h3>
          </div>
          <div className="bg-white bg-opacity-20 p-3 rounded-lg">{icon}</div>
        </div>
      </div>
    </div>
  );
}

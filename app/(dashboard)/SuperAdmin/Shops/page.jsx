"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import ShopTable from "@/components/SuperAdmins/ShopTable";
import {
  FiLoader,
  FiAlertCircle,
  FiShoppingBag,
  FiDollarSign,
  FiPieChart,
  FiActivity,
} from "react-icons/fi";

const Page = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Transaction summary state
  const [transactionSummary, setTransactionSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(null);

  // Date picker state
  const [dates, setDates] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const start = `${year}-${month}-01`;
    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
    const end = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;
    return { startDate: start, endDate: end };
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/shops");
        setShops(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch shops data. Please try again later.");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Fetch transaction summary when dates change
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setSummaryLoading(true);
        const response = await axios.get(
          `/api/superAdmin/transactionSum?startDate=${dates.startDate}&endDate=${dates.endDate}`
        );
        setTransactionSummary(response.data);
        setSummaryError(null);
      } catch (err) {
        setSummaryError("Failed to fetch transaction summary.");
        console.error("Summary fetch error:", err);
      } finally {
        setSummaryLoading(false);
      }
    };

    fetchSummary();
  }, [dates]);

  // Function to fetch data based on date range
  const fetchDataByRange = (range) => {
    const now = new Date();
    let startDate, endDate;

    switch (range) {
      case "today":
        startDate = endDate = now.toISOString().split("T")[0]; // YYYY-MM-DD
        break;
      case "weekly":
        startDate = new Date(now.setDate(now.getDate() - 6)).toISOString().split("T")[0];
        endDate = new Date().toISOString().split("T")[0];
        break;
      case "monthly":
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        startDate = `${year}-${month}-01`;
        const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
        endDate = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;
        break;
      default:
        return;
    }

    setDates({ startDate, endDate });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Date Range Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => fetchDataByRange("today")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Today
        </button>
        <button
          onClick={() => fetchDataByRange("weekly")}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Weekly
        </button>
        <button
          onClick={() => fetchDataByRange("monthly")}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Monthly
        </button>
      </div>

      {/* Date Picker */}
      <div className="flex gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={dates.startDate}
            onChange={(e) =>
              setDates((prev) => ({ ...prev, startDate: e.target.value }))
            }
            className="border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={dates.endDate}
            onChange={(e) =>
              setDates((prev) => ({ ...prev, endDate: e.target.value }))
            }
            className="border rounded px-2 py-1"
          />
        </div>
      </div>

      {/* Transaction Summary Section */}
      <div className="mb-6">
        {summaryLoading ? (
          <div className="flex items-center space-x-2">
            <FiLoader className="h-5 w-5 text-indigo-500 animate-spin" />
            <span className="text-gray-600">
              Loading transaction summary...
            </span>
          </div>
        ) : summaryError ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded mb-4">
            <div className="flex items-center">
              <FiAlertCircle className="h-5 w-5 text-red-400 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Error loading transaction summary
                </h3>
                <p className="text-sm text-red-700 mt-1">{summaryError}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            <StatCard
              title="Total Transaction Amount"
              value={
                transactionSummary
                  ? `$${transactionSummary.totalTransactionAmount.toLocaleString(
                      undefined,
                      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                    )}`
                  : "--"
              }
              icon={<FiDollarSign className="w-7 h-7" />}
              color="from-indigo-500 to-indigo-700"
            />
            <StatCard
              title="Total Wallet Balance"
              value={
                transactionSummary
                  ? `$${transactionSummary.totalWalletBalance.toLocaleString(
                      undefined,
                      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                    )}`
                  : "--"
              }
              icon={<FiPieChart className="w-7 h-7" />}
              color="from-green-500 to-green-700"
            />
            <StatCard
              title="Difference between the Total transaction amount and the System Commission"
              value={
                transactionSummary
                  ? `$${transactionSummary.difference.toLocaleString(
                      undefined,
                      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                    )}`
                  : "--"
              }
              icon={<FiActivity className="w-7 h-7" />}
              color="from-pink-500 to-pink-700"
            />

            <StatCard
              title="Total Game Played"
              value={
                transactionSummary
                  ? `$${transactionSummary.totalGamesPlayed.toLocaleString(
                      undefined,
                      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                    )}`
                  : "--"
              }
              icon={<FiActivity className="w-7 h-7" />}
              color="from-orange-500 to-orange-700"
            />

            <StatCard
              title="Total Shop Commission"
              value={
                transactionSummary
                  ? `$${transactionSummary.totalShopCommission.toLocaleString(
                      undefined,
                      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                    )}`
                  : "--"
              }
              icon={<FiActivity className="w-7 h-7" />}
              color="from-purple-500 to-purple-700"
            />

            <StatCard
              title="Total System Commission"
              value={
                transactionSummary
                  ? `$${transactionSummary.totalSystemCommission.toLocaleString(
                      undefined,
                      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                    )}`
                  : "--"
              }
              icon={<FiActivity className="w-7 h-7" />}
              color="from-gold-500 to-gold-700"
            />
          </div>
        )}
      </div>

      {/* ...existing main content area... */}
      <div className="flex flex-col space-y-6 lg:space-y-0 lg:space-x-6 lg:flex-row">
        {/* Main Content Area */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header Section */}
            <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center mb-4 sm:mb-0">
                <FiShoppingBag className="h-6 w-6 text-indigo-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Shops Management
                </h2>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <FiLoader className="h-8 w-8 text-indigo-500 animate-spin mb-4" />
                  <p className="text-gray-600">Loading shops data...</p>
                </div>
              ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                  <div className="flex items-center">
                    <FiAlertCircle className="h-5 w-5 text-red-400 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-red-800">
                        Error loading data
                      </h3>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                      <button
                        onClick={() => window.location.reload()}
                        className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                      >
                        Retry Loading
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <ShopTable shops={shops} loading={loading} error={error} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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

export default Page;

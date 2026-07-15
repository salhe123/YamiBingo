"use client";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

const Page = () => {
  const { id: cashierId } = useParams();
  const [gamesData, setGamesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalShopCommission, setTotalShopCommission] = useState(0);
  const [totalWinningAmount, setTotalWinningAmount] = useState(0);
  const [totalSystemCommission, setTotalSystemCommission] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);

  const fetchGamesData = async (
    page = 1,
    customStartDate = null,
    customEndDate = null
  ) => {
    setLoading(true);
    setError(null);
    try {
      let queryString = `/api/admins/shops/shop/${cashierId}?page=${page}&limit=${itemsPerPage}`;
      if (customStartDate && customEndDate) {
        queryString += `&startDate=${customStartDate}&endDate=${customEndDate}`;
      } else if (startDate && endDate) {
        queryString += `&startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await axios.get(queryString);
      const { games, wallet } = response.data;

      setGamesData(games || []);
      const shopCommission = games.reduce(
        (sum, game) => sum + (game.shopCommission || 0),
        0
      );
      const winningAmount = games.reduce(
        (sum, game) => sum + (game.winningAmount || 0),
        0
      );
      const systemCommission = games.reduce(
        (sum, game) => sum + (game.systemCommission || 0),
        0
      );

      setTotalShopCommission(shopCommission);
      setTotalWinningAmount(winningAmount);
      setTotalSystemCommission(systemCommission);
      setWalletBalance(wallet?.balance || 0);
    } catch (error) {
      setError("There are no games between these dates!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cashierId) {
      fetchGamesData(currentPage);
    }
  }, [cashierId, currentPage]);

  const handleDateFilter = () => {
    setCurrentPage(1);
    fetchGamesData(1);
  };

  const handleDailyGames = () => {
    const today = dayjs().format("YYYY-MM-DD");
    fetchGamesData(1, today, today);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prevPage) => prevPage - 1);
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  return (
    <div className="w-full px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center sm:text-left">
        Shop Games
      </h1>

      {/* Date Filter Section */}
      <div className="mb-6 bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <div className="flex flex-col w-full sm:w-auto">
            <label className="font-semibold text-sm text-gray-700 mb-1">
              Start Date:
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 w-full"
            />
          </div>
          <div className="flex flex-col w-full sm:w-auto">
            <label className="font-semibold text-sm text-gray-700 mb-1">
              End Date:
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 w-full"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleDateFilter}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md font-medium transition-colors w-full sm:w-auto"
            >
              Filter
            </button>
            <button
              onClick={handleDailyGames}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md font-medium transition-colors w-full sm:w-auto"
            >
              Today's Games
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-6 text-center rounded-lg shadow-md bg-white">
          <h5 className="text-gray-900 text-lg font-medium mb-2">
            Wallet Balance
          </h5>
          <p className="text-xl sm:text-2xl text-green-600 font-semibold">
            ${walletBalance.toFixed(2)}
          </p>
        </div>
        <div className="p-4 sm:p-6 text-center rounded-lg shadow-md bg-white">
          <h5 className="text-gray-900 text-lg font-medium mb-2">
            Total Shop Commission
          </h5>
          <p className="text-xl sm:text-2xl text-green-600 font-semibold">
            ${totalShopCommission.toFixed(2)}
          </p>
        </div>
        <div className="p-4 sm:p-6 text-center rounded-lg shadow-md bg-white">
          <h5 className="text-gray-900 text-lg font-medium mb-2">
            Total Winning Amount
          </h5>
          <p className="text-xl sm:text-2xl text-green-600 font-semibold">
            ${totalWinningAmount.toFixed(2)}
          </p>
        </div>
        <div className="p-4 sm:p-6 text-center rounded-lg shadow-md bg-white">
          <h5 className="text-gray-900 text-lg font-medium mb-2">
            Total System Commission
          </h5>
          <p className="text-xl sm:text-2xl text-green-600 font-semibold">
            ${totalSystemCommission.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="w-full bg-white">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold sticky top-0 z-10">
            <tr>
              <th className="px-2 sm:px-6 py-3 text-center">Index</th>
              <th className="px-2 sm:px-6 py-3 text-center">Game ID</th>
              <th className="px-2 sm:px-6 py-3 text-center">Status</th>
              <th className="px-2 sm:px-6 py-3 text-center">Bet Amount</th>
              <th className="px-2 sm:px-6 py-3 text-center">Players</th>
              <th className="px-2 sm:px-6 py-3 text-center">Timestamp</th>
              <th className="px-2 sm:px-6 py-3 text-center">Winning Amount</th>
              <th className="px-2 sm:px-6 py-3 text-center">Winner Card</th>
              <th className="px-2 sm:px-6 py-3 text-center">Numbers Called</th>
              <th className="px-2 sm:px-6 py-3 text-center">Shop Commission</th>
              <th className="px-2 sm:px-6 py-3 text-center">
                System Commission
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {loading ? (
              <tr>
                <td colSpan="11" className="text-center py-10 text-gray-600">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="11" className="text-center py-10 text-red-500">
                  {error}
                </td>
              </tr>
            ) : gamesData.length === 0 ? (
              <tr>
                <td colSpan="11" className="text-center py-10 text-gray-500">
                  No games available.
                </td>
              </tr>
            ) : (
              gamesData.map((game, index) => (
                <tr
                  key={game.id}
                  className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <td className="px-2 sm:px-6 py-4 text-center">
                    {index + 1 + (currentPage - 1) * itemsPerPage}
                  </td>
                  <td className="px-2 sm:px-6 py-4 text-center">
                    {game.id.slice(-4)}
                  </td>
                  <td className="px-2 sm:px-6 py-4 text-center">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        game.status === "active"
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {game.status}
                    </span>
                  </td>
                  <td className="px-2 sm:px-6 py-4 text-center text-green-600 font-semibold">
                    ${game.betAmount?.toFixed(2) || "0.00"}
                  </td>
                  <td className="px-2 sm:px-6 py-4 text-center">
                    {game.numberOfPlayers || 0}
                  </td>
                  <td className="px-2 sm:px-6 py-4 text-center text-xs sm:text-sm whitespace-nowrap">
                    {new Date(game.createdAt).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-2 sm:px-6 py-4 text-center text-green-600 font-semibold">
                    ${game.winningAmount?.toFixed(2) || "0.00"}
                  </td>
                  <td className="px-2 sm:px-6 py-4 text-center text-xs sm:text-sm">
                    {game.winnerCard || "N/A"}
                  </td>
                  <td className="px-2 sm:px-6 py-4 text-center text-xs sm:text-sm">
                    {game.numbersCalled || "N/A"}
                  </td>
                  <td className="px-2 sm:px-6 py-4 text-center text-green-600 font-semibold">
                    ${game.shopCommission?.toFixed(2) || "0.00"}
                  </td>
                  <td className="px-2 sm:px-6 py-4 text-center text-green-600 font-semibold">
                    ${game.systemCommission?.toFixed(2) || "0.00"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end gap-3 mt-4 px-2 sm:px-0">
        <button
          onClick={handlePreviousPage}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <button
          onClick={handleNextPage}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          disabled={gamesData.length < itemsPerPage}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Page;

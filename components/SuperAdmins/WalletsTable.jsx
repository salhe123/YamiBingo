"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { IoEye } from "react-icons/io5";
import { FaEyeSlash } from "react-icons/fa6";

const ShopWalletsTable = () => {
  const [shopWallets, setShopWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topUpAmounts, setTopUpAmounts] = useState({});
  const [transactions, setTransactions] = useState({});
  const [viewingTransactions, setViewingTransactions] = useState(null);
  const [toppingUp, setToppingUp] = useState({});

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const response = await axios.get("/api/wallets");
        setShopWallets(response.data);
      } catch (err) {
        setError("Failed to fetch shop wallets");
      } finally {
        setLoading(false);
      }
    };

    fetchWallets();
  }, []);

  const handleInputChange = (id, value) => {
    // Allow empty string or valid number >= 0 for input flexibility
    if (value === "" || (!isNaN(value) && Number(value) >= 0)) {
      setTopUpAmounts({ ...topUpAmounts, [id]: value });
    }
  };

  const handleTopUp = async (walletId) => {
    const amount = parseFloat(topUpAmounts[walletId]);
    // Validate amount: must be a number and >= 50
    if (isNaN(amount) || amount < 50) {
      alert("Please enter a valid amount of 50 or more.");
      return;
    }

    setToppingUp((prev) => ({ ...prev, [walletId]: true }));

    try {
      const response = await axios.post(`/api/wallets/top-up`, {
        walletId,
        amount,
      });

      setShopWallets((prevWallets) =>
        prevWallets.map((wallet) =>
          wallet.id === walletId
            ? { ...wallet, balance: wallet.balance + amount }
            : wallet
        )
      );

      alert("Wallet topped up successfully!");
      setTopUpAmounts((prev) => ({ ...prev, [walletId]: "" }));
    } catch (err) {
      alert("Failed to top up wallet. Please try again.");
    } finally {
      setToppingUp((prev) => ({ ...prev, [walletId]: false }));
    }
  };

  const fetchTransactions = async (walletId) => {
    try {
      if (viewingTransactions === walletId) {
        setViewingTransactions(null);
        return;
      }

      const response = await axios.get(`/api/wallets/${walletId}/transactions`);
      setTransactions({ ...transactions, [walletId]: response.data });
      setViewingTransactions(walletId);
    } catch (err) {
      alert("Failed to fetch transactions. Please try again.");
    }
  };

  return (
    <div className="rounded-lg shadow-md bg-gray-50 font-[sans-serif] text-gray-800">
      <h1 className="text-xl font-semibold pb-4 border-b border-gray-200 text-gray-800">
        Shop Wallet List
      </h1>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="max-h-96 overflow-y-auto overflow-x-auto rounded-lg">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-800 text-white sticky top-0">
              <tr>
                <th className="py-2 px-4 text-left">Shop Name</th>
                <th className="py-2 px-4 text-left">Location</th>
                <th className="py-2 px-4 text-left">Balance</th>
                <th className="py-2 px-4 text-left">Top-Up</th>
                <th className="py-2 px-4 text-left">View History</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              {shopWallets.map((wallet, index) => (
                <React.Fragment key={wallet.id}>
                  <tr
                    className={`hover:bg-gray-50 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="py-2 px-4 border-b border-gray-200 text-sm">
                      {wallet.shop.shopName}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200 text-sm">
                      {wallet.shop.location}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200 text-sm">
                      ${wallet.balance.toFixed(2)}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200 text-sm">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          placeholder="min 50"
                          className="px-2 py-1 border border-gray-300 rounded text-black text-sm w-32 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200" // Increased width from w-20 to w-32
                          value={topUpAmounts[wallet.id] || ""}
                          onChange={(e) =>
                            handleInputChange(wallet.id, e.target.value)
                          }
                          disabled={toppingUp[wallet.id]}
                          min="50" // HTML5 min attribute for basic browser validation
                          step="0.01" // Allow decimals with 2 places
                        />
                        <button
                          className={`px-2 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 transition-colors duration-200 ${
                            toppingUp[wallet.id]
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          onClick={() => handleTopUp(wallet.id)}
                          disabled={toppingUp[wallet.id]}
                        >
                          {toppingUp[wallet.id] ? "Topping Up..." : "Top Up"}
                        </button>
                      </div>
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200 text-sm">
                      <button
                        className="px-2 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 transition-colors duration-200"
                        onClick={() => fetchTransactions(wallet.id)}
                      >
                        {viewingTransactions === wallet.id ? (
                          <FaEyeSlash />
                        ) : (
                          <IoEye />
                        )}
                      </button>
                    </td>
                  </tr>
                  {viewingTransactions === wallet.id &&
                    transactions[wallet.id] && (
                      <tr>
                        <td colSpan="5" className="bg-gray-100 px-4 py-2">
                          <h3 className="text-sm font-semibold mb-2 text-gray-700">
                            Transactions
                          </h3>
                          {transactions[wallet.id].length > 0 ? (
                            <div className="max-h-48 overflow-y-auto overflow-x-auto rounded-lg shadow-md">
                              <table className="min-w-full bg-white">
                                <thead className="bg-gray-800 text-white sticky top-0">
                                  <tr>
                                    <th className="py-2 px-4 text-left">
                                      Amount
                                    </th>
                                    <th className="py-2 px-4 text-left">
                                      Type
                                    </th>
                                    <th className="py-2 px-4 text-left">
                                      Description
                                    </th>
                                    <th className="py-2 px-4 text-left">
                                      Date
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="text-gray-600">
                                  {transactions[wallet.id].map((txn, idx) => (
                                    <tr
                                      key={txn.id}
                                      className={`hover:bg-gray-50 ${
                                        idx % 2 === 0
                                          ? "bg-white"
                                          : "bg-gray-50"
                                      }`}
                                    >
                                      <td className="py-2 px-4 border-b border-gray-200 text-sm">
                                        ${txn.amount.toFixed(2)}
                                      </td>
                                      <td className="py-2 px-4 border-b border-gray-200 text-sm">
                                        {txn.type}
                                      </td>
                                      <td className="py-2 px-4 border-b border-gray-200 text-sm">
                                        {txn.description}
                                      </td>
                                      <td className="py-2 px-4 border-b border-gray-200 text-sm">
                                        {new Date(
                                          txn.createdAt
                                        ).toLocaleString()}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">
                              No transactions found for this wallet.
                            </p>
                          )}
                        </td>
                      </tr>
                    )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ShopWalletsTable;

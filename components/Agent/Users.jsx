"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const Users = () => {
  const { data: session, status } = useSession();
  const [data, setData] = useState({ admins: [], cashiers: [], shops: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);
  const [walletError, setWalletError] = useState(null);
  const [topUpModal, setTopUpModal] = useState({
    open: false,
    entityId: null,
    entityName: "",
    entityType: "", 
  });
  const [topUpAmount, setTopUpAmount] = useState(0);
  const [historyModal, setHistoryModal] = useState({
    open: false,
    entityId: null,
    entityName: "",
    entityType: "",
  });
  const [transactions, setTransactions] = useState([]);

  const fetchData = async () => {
    if (!session?.user?.id) {
      setError("Agent not authenticated");
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(
        `/api/users?agentId=${session.user.id}&t=${Date.now()}`,
        {
          headers: { "Cache-Control": "no-store" },
        }
      );
      const data = await response.json();
      console.log("Fetched data:", data);
      if (response.ok) {
        setData({
          admins: data.admins || [],
          cashiers: data.cashiers || [],
          shops: data.shops || [],
        });
        setError("");
      } else {
        setError(data.message || "Failed to fetch data");
      }
    } catch (err) {
      setError("Error fetching data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    setWalletLoading(true);
    try {
      const response = await fetch("/api/agent-wallets");
      const data = await response.json();
      if (data.success) {
        setWalletBalance(data.balance);
      } else {
        setWalletError(data.message || "Failed to fetch wallet balance");
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      setWalletError("Failed to fetch wallet balance");
    } finally {
      setWalletLoading(false);
    }
  };

  const fetchTransactions = async (entityId, entityType) => {
    if (entityType !== "Admin") return; // Only for Admins
    try {
      const response = await fetch(
        `/api/agent-wallets/transactions?adminId=${entityId}`
      );
      const data = await response.json();
      if (response.ok) {
        setTransactions(data);
      } else {
        setError(data.message || "Failed to fetch transactions");
      }
    } catch (err) {
      setError("Error fetching transactions");
      console.error(err);
    }
  };

  const handleTopUp = async () => {
    if (topUpAmount <= 0) {
      setError("Top-up amount must be positive");
      return;
    }
    try {
      setLoading(true);
      const response = await fetch("/api/agent-wallets/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: topUpModal.entityId,
          amount: topUpAmount,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData?.message || "The wallet balance is insufficient for top-up"
        );
      }
      setTopUpModal({ open: false, entityId: null, entityName: "", entityType: "" });
      setTopUpAmount(0);
      setError("");
      await fetchData();
      fetchWalletBalance();
    } catch (err) {
      setError(err.message || "Error topping up wallet");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (entityId, entityType, action, entityName) => {
    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${entityName}?`
    );
    if (!confirmed) return;

    try {
      setLoading(true);
      const response = await fetch("/api/agent-wallets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [entityType === "Admin" ? "adminId" : entityType === "Cashier" ? "cashierId" : "shopId"]: entityId,
          action,
        }),
      });
      const data = await response.json();
      console.log("Toggle response:", data);
      if (!response.ok) {
        throw new Error(data.message || `Failed to ${action} ${entityType.toLowerCase()}`);
      }
      setError("");
      await fetchData();
    } catch (err) {
      setError(err.message || `Error ${action}ing ${entityType.toLowerCase()}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openTopUpModal = (entityId, entityName, entityType) => {
    if (entityType !== "Admin") return;
    setTopUpModal({ open: true, entityId, entityName, entityType });
    setError("");
  };

  const openHistoryModal = (entityId, entityName, entityType) => {
    if (entityType !== "Admin") return;
    setHistoryModal({ open: true, entityId, entityName, entityType });
    fetchTransactions(entityId, entityType);
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "Agent") {
      fetchWalletBalance();
    }
    fetchData();
  }, [status, session]);

  const formatDate = (date) => {
    if (!date || isNaN(new Date(date).getTime())) {
      return "Invalid Date";
    }
    // Format in EAT (UTC+3)
    return new Date(new Date(date).getTime() + 3 * 60 * 60 * 1000).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const renderTable = (title, entities, type) => (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-orange-400 mb-4">{title}</h3>
      {entities.length === 0 ? (
        <div className="text-center text-gray-300">No {title.toLowerCase()} found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs uppercase bg-gray-700 text-gray-100">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Balance</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created At</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entities.map((entity) => (
                <tr key={entity.id} className="border-b text-black border-gray-600">
                  <td className="px-4 py-3">
                    {entity.type === "Shop" ? entity.shopName : `${entity.firstName} ${entity.lastName}`}
                  </td>
                  <td className="px-4 py-3">{entity.email || "-"}</td>
                  <td className="px-4 py-3">{entity.phoneNumber || "-"}</td>
                  <td className="px-4 py-3">
                    {entity.shop?.wallet?.balance && entity.type !== "Shop"
                      ? `$${entity.shop.wallet.balance.toFixed(2)}`
                      : entity.type === "Shop" && entity.wallet?.balance
                      ? `$${entity.wallet.balance.toFixed(2)}`
                      : "0.00"}
                  </td>
                  <td className="px-4 py-3">
                    {entity.isBlocked ? (
                      <span className="text-red-500">Deactivated</span>
                    ) : (
                      <span className="text-green-500">Active</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{formatDate(entity.createdAt)}</td>
                  <td className="px-4 py-3 flex gap-2">
                    {entity.type === "Admin" && (
                      <>
                        <button
                          onClick={() => openTopUpModal(entity.id, `${entity.firstName} ${entity.lastName}`, entity.type)}
                          className={`bg-orange-500 text-white px-3 py-1 text-xs rounded-lg hover:bg-orange-600 transition-colors ${
                            !entity.shop?.wallet ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                          disabled={!entity.shop?.wallet}
                        >
                          Top Up
                        </button>
                        <button
                          onClick={() => openHistoryModal(entity.id, `${entity.firstName} ${entity.lastName}`, entity.type)}
                          className={`bg-blue-500 text-white px-3 py-1 text-xs rounded-lg hover:bg-blue-600 transition-colors ${
                            !entity.shop?.wallet ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                          disabled={!entity.shop?.wallet}
                        >
                          History
                        </button>
                      </>
                    )}
                    <button
                      onClick={() =>
                        handleToggleStatus(
                          entity.id,
                          entity.type,
                          entity.isBlocked ? "activate" : "deactivate",
                          entity.type === "Shop" ? entity.shopName : `${entity.firstName} ${entity.lastName}`
                        )
                      }
                      className={`px-3 py-1 text-xs rounded-lg text-white transition-colors ${
                        entity.isBlocked
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-red-500 hover:bg-red-600"
                      }`}
                      disabled={loading}
                    >
                      {entity.isBlocked ? "Activate" : "Deactivate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full mx-auto p-6 bg-white rounded-lg shadow-lg shadow-gray-700/50 font-sans text-black">
      <h2 className="text-2xl font-bold text-orange-400 text-center mb-6">
        Entities Managed by Agent
      </h2>
      {/* Wallet Balance Section */}
      <div className="flex justify-center text-gray-950 flex-wrap gap-4">
        <div className="p-6 text-center rounded-lg shadow-gray-50 shadow-lg">
          <h5 className="text-xl text-red-800 font-medium mb-2">
            Wallet Balance
          </h5>
          {walletLoading ? (
            <div className="text-sm text-gray-600">Loading balance...</div>
          ) : walletError ? (
            <div className="text-sm text-red-600">{walletError}</div>
          ) : (
            <div className="text-lg font-semibold text-green-600">
              {walletBalance ? `${walletBalance} ETB` : "0.00 ETB"}
            </div>
          )}
        </div>
      </div>
      {error && (
        <div className="text-red-500 text-sm text-center mb-4">{error}</div>
      )}
      {loading ? (
        <div className="text-center text-gray-300">Loading...</div>
      ) : (
        <>
          {renderTable("Admins", data.admins, "Admin")}
          {renderTable("Cashiers", data.cashiers, "Cashier")}
          {renderTable("Shops", data.shops, "Shop")}
        </>
      )}

      {/* Top-Up Modal */}
      {topUpModal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold text-orange-400 mb-4">
              Top Up Wallet for {topUpModal.entityName}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Top-Up Amount
                </label>
                <input
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(Number(e.target.value))}
                  placeholder="Enter amount"
                  className="p-3 border border-gray-600 bg-gray-700 text-white text-sm rounded-lg w-full focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                  min="0"
                />
              </div>
              {error && <p className="text-red-500 text-xs">{error}</p>}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleTopUp}
                className="bg-green-500 text-white px-4 py-2 text-sm rounded-lg hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                disabled={loading || topUpAmount <= 0}
              >
                {loading ? <span className="animate-spin mr-2">🔄</span> : null}
                Confirm
              </button>
              <button
                onClick={() =>
                  setTopUpModal({ open: false, entityId: null, entityName: "", entityType: "" })
                }
                className="bg-red-500 text-white px-4 py-2 text-sm rounded-lg hover:bg-red-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History Modal */}
      {historyModal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-lg font-semibold text-orange-400 mb-4">
              Transaction History for {historyModal.entityName}
            </h2>
            {transactions.length === 0 ? (
              <p className="text-sm text-gray-300">No transactions yet.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="text-sm border-b border-gray-600 py-2"
                  >
                    <p>Amount: ${tx.amount.toFixed(2)}</p>
                    <p>Type: {tx.type}</p>
                    <p>Description: {tx.description || "N/A"}</p>
                    <p>Date: {formatDate(tx.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() =>
                  setHistoryModal({ open: false, entityId: null, entityName: "", entityType: "" })
                }
                className="bg-red-500 text-white px-4 py-2 text-sm rounded-lg hover:bg-red-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
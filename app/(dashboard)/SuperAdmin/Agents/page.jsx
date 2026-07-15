"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const AgentsManagement = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState({}); 
  const [pagination, setPagination] = useState({});
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    initialBalance: 0,
  });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    status: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [topUpModal, setTopUpModal] = useState({
    open: false,
    agentId: null,
    amount: 0,
  });
  const [historyModal, setHistoryModal] = useState({
    open: false,
    agentId: null,
    transactions: [],
  });

  // Fetch agents
  const fetchAgents = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: filters.page,
        limit: filters.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      const response = await fetch(`/api/agent?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setAgents(data.agents);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
      alert("Failed to fetch agents");
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Agent registered successfully!");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          password: "",
          initialBalance: 0,
        });
        fetchAgents();
      } else {
        alert(data.message || "Failed to register agent");
      }
    } catch (error) {
      console.error("Error registering agent:", error);
      alert("Failed to register agent");
    } finally {
      setFormLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(key !== "page" && { page: 1 }),
    }));
  };

  // Toggle agent status
  const toggleAgentStatus = async (agentId, currentActive) => {
    if (!session?.user?.role || session?.user?.role !== "SuperAdmin") {
      alert("Not authorized");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to ${currentActive ? "deactivate" : "activate"} this agent?`
      )
    ) {
      return;
    }

    setToggleLoading((prev) => ({ ...prev, [agentId]: true }));
    try {
      const response = await fetch("/api/agent", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: agentId, isBlocked: !currentActive }),
      });

      const data = await response.json();
      console.log("Toggle status response:", data);

      if (response.ok && data.success) {
        alert(`Agent ${currentActive ? "deactivated" : "activated"} successfully!`);
        await fetchAgents();
      } else {
        alert(data.message || "Failed to update agent status");
      }
    } catch (error) {
      console.error("Error updating agent status:", error);
      alert("Failed to update agent status");
    } finally {
      setToggleLoading((prev) => ({ ...prev, [agentId]: false }));
    }
  };

  // Handle top-up submission
  const handleTopUp = async () => {
    if (topUpModal.amount <= 0) {
      alert("Amount must be greater than 0");
      return;
    }
    try {
      const response = await fetch("/api/agent/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: topUpModal.agentId,
          amount: parseFloat(topUpModal.amount),
        }),
      });
      if (response.ok) {
        alert("Top-up successful!");
        fetchAgents();
        setTopUpModal({ open: false, agentId: null, amount: 0 });
      } else {
        const data = await response.json();
        alert(data.message || "Top-up failed");
      }
    } catch (error) {
      console.error("Error during top-up:", error);
      alert("Error during top-up");
    }
  };

  // Fetch transaction history
  const fetchTransactionHistory = async (agentId) => {
    try {
      const response = await fetch(`/api/agent/transactions?agentId=${agentId}`);
      const data = await response.json();
      if (data.success) {
        setHistoryModal({
          open: true,
          agentId,
          transactions: data.transactions,
        });
      } else {
        alert(data.message || "Failed to fetch transaction history");
      }
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      alert("Error fetching transaction history");
    }
  };

  // Fetch agents on component mount and when filters change
  useEffect(() => {
    if (session?.user) fetchAgents();
  }, [filters, session?.status]);

  return (
    <div className="min-h-screen bg-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          Agents Management
        </h1>

        {/* Registration Form */}
        <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Register New Agent</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-50 bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter agent's first name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-50 bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter agent's last name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-50 bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter agent's email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-50 bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+251912345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-50 bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Initial Balance
                </label>
                <input
                  type="number"
                  name="initialBalance"
                  value={formData.initialBalance}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-50 bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter initial balance"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={formLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {formLoading ? "Registering..." : "Register Agent"}
            </button>
          </form>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Agents List</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Search
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                placeholder="Search by name or phone"
                className="w-full px-3 py-2 border border-gray-50 bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-50 bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="w-full px-3 py-2 border border-gray-50 bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt">Registration Date</option>
                <option value="name">Name</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Items Per Page
              </label>
              <select
                value={filters.limit}
                onChange={(e) =>
                  handleFilterChange("limit", parseInt(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-50 bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>

          {/* Agents Table */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading agents...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-800">
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Phone Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Balance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Registered Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gary-800 divide-y divide-gray-200">
                    {agents.map((agent) => {
                      const isActive = !agent.isBlocked;
                      return (
                        <tr
                          key={agent.id}
                          className="cursor-pointer hover:bg-gray-800 transition"
                          onClick={() =>
                            router.push(
                              `/SuperAdmin/AgentManagement/${agent.id}`
                            )
                          }
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">
                              {`${agent.firstName} ${agent.lastName}`}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-white">
                              {agent.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-white">
                              {agent.phoneNumber}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-white">
                              {agent.agentWallet?.balance?.toFixed(2) || "0.00"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-white">
                              {new Date(agent.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td
                            className="px-6 py-4 whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() =>
                                toggleAgentStatus(agent.id, isActive)
                              }
                              disabled={toggleLoading[agent.id]}
                              className={`px-3 py-1 text-xs rounded ${
                                isActive
                                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                                  : "bg-green-100 text-green-700 hover:bg-green-200"
                              } ${toggleLoading[agent.id] ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                              {toggleLoading[agent.id] ? "Updating..." : isActive ? "Deactivate" : "Activate"}
                            </button>
                            <button
                              onClick={() =>
                                setTopUpModal({
                                  open: true,
                                  agentId: agent.id,
                                  amount: 0,
                                })
                              }
                              className="px-3 py-1 text-xs rounded bg-blue-100 text-blue-700 hover:bg-blue-200 ml-2"
                            >
                              Top-Up
                            </button>
                            <button
                              onClick={() => fetchTransactionHistory(agent.id)}
                              className="px-3 py-1 text-xs rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200 ml-2"
                            >
                              History
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {agents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No agents found matching your criteria.
                </div>
              ) : (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-700">
                    Showing {(filters.page - 1) * filters.limit + 1} to{" "}
                    {Math.min(
                      filters.page * filters.limit,
                      pagination.totalAgents
                    )}{" "}
                    of {pagination.totalAgents} agents
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        handleFilterChange("page", filters.page - 1)
                      }
                      disabled={!pagination.hasPrev}
                      className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md">
                      Page {filters.page} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() =>
                        handleFilterChange("page", filters.page + 1)
                      }
                      disabled={!pagination.hasNext}
                      className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Top-Up Modal */}
          {topUpModal.open && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h2 className="text-lg font-semibold mb-4">Top-Up Agent</h2>
                <input
                  type="number"
                  value={topUpModal.amount}
                  onChange={(e) =>
                    setTopUpModal({
                      ...topUpModal,
                      amount: e.target.value,
                    })
                  }
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 bg-gray-800 rounded-md mb-4"
                  placeholder="Enter top-up amount"
                />
                <button
                  onClick={handleTopUp}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Submit
                </button>
                <button
                  onClick={() =>
                    setTopUpModal({ open: false, agentId: null, amount: 0 })
                  }
                  className="ml-2 px-4 py-2 border border-gray-300 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Transaction History Modal */}
          {historyModal.open && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-gray-800 p-6 rounded-lg max-w-2xl w-full">
                <h2 className="text-lg font-semibold mb-4">
                  Transaction History
                </h2>
                {historyModal.transactions.length === 0 ? (
                  <p className="text-gray-500">No transactions found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full table-auto">
                      <thead>
                        <tr className="bg-gray-800">
                          <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase">
                            Date
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase">
                            Type
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase">
                            Amount
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase">
                            Description
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-gray-800 divide-y divide-gray-200">
                        {historyModal.transactions.map((tx) => (
                          <tr key={tx.id}>
                            <td className="px-4 py-2 text-sm">
                              {new Date(tx.createdAt).toLocaleString()}
                            </td>
                            <td className="px-4 py-2 text-sm">{tx.type}</td>
                            <td className="px-4 py-2 text-sm">
                              {tx.amount.toFixed(2)}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              {tx.description || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <button
                  onClick={() =>
                    setHistoryModal({
                      open: false,
                      agentId: null,
                      transactions: [],
                    })
                  }
                  className="mt-4 px-4 py-2 border border-gray-300 rounded-md"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentsManagement;
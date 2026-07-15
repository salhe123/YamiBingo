"use client";
import React, { useState, useEffect } from "react";

const CashierTable = () => {
  const [cashiers, setCashiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch cashiers from the API
  useEffect(() => {
    const fetchCashiers = async () => {
      try {
        const response = await fetch("/api/cashiers/all-cashiers");
        if (!response.ok) {
          throw new Error("Failed to fetch cashiers");
        }
        const result = await response.json();
        if (result.success) {
          console.log("Fetched cashiers:", result.data); // Debug log
          setCashiers(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError(err.message || "An error occurred while fetching cashiers");
      } finally {
        setLoading(false);
      }
    };

    fetchCashiers();
  }, []);

  // Function to handle block/unblock action
  const handleBlockToggle = async (cashierId, currentStatus) => {
    try {
      const action = currentStatus ? "unblock" : "block";
      const response = await fetch("/api/users/user/blockUnblock", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cashierId,
          action,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update block status");
      }

      const updatedUser = await response.json();
      console.log("Updated user:", updatedUser); // Debug log

      // Update the local state to reflect the change
      setCashiers((prevCashiers) =>
        prevCashiers.map((cashier) =>
          cashier.id === cashierId
            ? {
                ...cashier,
                user: { ...cashier.user, isBlocked: !currentStatus },
              }
            : cashier
        )
      );
    } catch (err) {
      setError(err.message || "Failed to update block status");
    }
  };

  if (error) return <p className="text-center text-red-600 py-4">{error}</p>;

  return (
    <div className="max-h-96 overflow-y-auto overflow-x-auto rounded-lg shadow-md">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-800 text-white sticky top-0">
          <tr>
            <th className="py-2 px-4 text-left text-xs font-semibold">ID</th>
            <th className="py-2 px-4 text-left text-xs font-semibold">
              First Name
            </th>
            <th className="py-2 px-4 text-left text-xs font-semibold">
              Last Name
            </th>
            <th className="py-2 px-4 text-left text-xs font-semibold">Email</th>
            <th className="py-2 px-4 text-left text-xs font-semibold">Phone</th>
            <th className="py-2 px-4 text-left text-xs font-semibold">
              Shop Name
            </th>
            <th className="py-2 px-4 text-left text-xs font-semibold">
              Status
            </th>
            <th className="py-2 px-4 text-left text-xs font-semibold">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="text-gray-600">
          {loading ? (
            <tr>
              <td
                colSpan="8"
                className="py-4 px-4 text-center text-gray-500 text-sm"
              >
                Loading cashiers...
              </td>
            </tr>
          ) : cashiers && cashiers.length > 0 ? (
            cashiers.map((cashier, index) => (
              <tr
                key={cashier.id}
                className={`hover:bg-gray-50 ${
                  index % 2 === 0 ? "bg-gray-100" : "bg-white"
                }`}
              >
                <td className="py-2 px-4 border-b text-xs text-gray-500 whitespace-nowrap">
                  {cashier.id}
                  <button
                    className="ml-2 text-gray-600 hover:text-gray-800 text-xs"
                    onClick={() => navigator.clipboard.writeText(cashier.id)}
                    title="Copy ID"
                  >
                    📋
                  </button>
                </td>
                <td className="py-2 px-4 border-b text-sm">
                  {cashier.user.firstName}
                </td>
                <td className="py-2 px-4 border-b text-sm">
                  {cashier.user.lastName}
                </td>
                <td className="py-2 px-4 border-b text-sm text-blue-900">
                  {cashier.user.email}
                </td>
                <td className="py-2 px-4 border-b text-sm">
                  {cashier.user.phoneNumber}
                </td>
                <td className="py-2 px-4 border-b text-sm">
                  {cashier.shop?.shopName || "No Shop Assigned"}
                </td>
                <td className="py-2 px-4 border-b text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      cashier.user.isBlocked
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {cashier.user.isBlocked ? "Blocked" : "Active"}
                  </span>
                </td>
                <td className="py-2 px-4 border-b text-sm">
                  <button
                    onClick={() =>
                      handleBlockToggle(cashier.id, cashier.user.isBlocked)
                    }
                    className={`px-3 py-1 rounded-md text-xs font-medium ${
                      cashier.user.isBlocked
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                  >
                    {cashier.user.isBlocked ? "Unblock" : "Block"}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="8"
                className="py-4 px-4 text-center text-gray-500 text-sm"
              >
                No cashiers found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CashierTable;

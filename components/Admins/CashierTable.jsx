"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";

const CashierTable = () => {
  const [cashiers, setCashiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session } = useSession();
  const adminId = session?.user?.id;

  // Fetch cashiers
  const fetchCashiers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/admins/cashiers/${adminId}`);
      setCashiers(response.data);
    } catch (err) {
      setError("Failed to fetch cashiers. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminId) {
      fetchCashiers();
    }
  }, [adminId]);

  // Function to block or unblock a user
  const handleBlockUnblock = async (userId, action) => {
    try {
      await axios.patch("/api/users/user/blockUnblock", {
        cashierId: userId,
        action,
      });
      alert(`User has been ${action === "block" ? "blocked" : "unblocked"}`);
      fetchCashiers();
    } catch (err) {
      alert("Failed to update user status. Please try again later.");
    }
  };

  if (loading)
    return (
      <div className="text-center text-gray-600 py-10">Loading cashiers...</div>
    );
  if (error)
    return <div className="text-center text-red-500 py-10">{error}</div>;

  return (
    <div className="mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Cashiers</h2>
      {cashiers.length === 0 ? (
        <p className="text-gray-500 text-center py-10">
          No cashiers found under this admin.
        </p>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4 text-center">First Name</th>
                <th className="px-6 py-4 text-center">Last Name</th>
                <th className="px-6 py-4 text-center">Email</th>
                <th className="px-6 py-4 text-center">Phone Number</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Created At</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {cashiers.map((cashier, index) => (
                <tr
                  key={cashier.id}
                  className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <td className="px-6 py-4 text-center font-medium">
                    {cashier.user.firstName}
                  </td>
                  <td className="px-6 py-4 text-center font-medium">
                    {cashier.user.lastName}
                  </td>
                  <td className="px-6 py-4 text-center text-sm">
                    {cashier.user.email}
                  </td>
                  <td className="px-6 py-4 text-center text-sm">
                    {cashier.user.phoneNumber}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        cashier.user.isBlocked
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {cashier.user.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm">
                    {new Date(cashier.user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {cashier.user.isBlocked ? (
                      <button
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                        onClick={() =>
                          handleBlockUnblock(cashier.id, "unblock")
                        }
                      >
                        Unblock
                      </button>
                    ) : (
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                        onClick={() => handleBlockUnblock(cashier.id, "block")}
                      >
                        Block
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CashierTable;

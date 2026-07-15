"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React, { useState, useEffect } from "react";

const Page = () => {
  const { data: session, status } = useSession();
  const [walletBalance, setWalletBalance] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState(null);

  // Fetch wallet balance
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

  // Fetch wallet balance on mount if authenticated
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "Agent") {
      fetchWalletBalance();
    }
  }, [status, session]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div>You are not authenticated. Please log in.</div>;
  }

  const renderSessionData = (sessionData) => {
    return Object.entries(sessionData).map(([key, value]) => {
      if (typeof value === "object" && value !== null) {
        return (
          <div key={key}>
            <strong>{key}:</strong>
            {renderSessionData(value)}
          </div>
        );
      } else {
        return (
          <div key={key}>
            <strong>{key}:</strong> {value ? value.toString() : "N/A"}
          </div>
        );
      }
    });
  };

  return (
    <div className="container mx-auto px-2">
      <div className="grid grid-cols-1 lg:grid-cols gap-4">
        <h1 className="flex text-gray-50 justify-center flex-wrap gap-4 rounded p-7 shadow-md shadow-gray-50">
          Agent Home Dashboard
        </h1>

        {/* Wallet Balance Section */}
        <div className="flex justify-center text-gray-950 flex-wrap gap-4">
          <div className="p-6 text-center rounded-lg shadow-gray-50 shadow-lg">
            <h5 className="text-xl font-medium mb-2">Wallet Balance</h5>
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

        {/* Session Data Section */}
        <div className="flex justify-center text-gray-950 flex-wrap gap-4">
          {session?.user ? (
            Object.entries(session.user).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center space-x-2 p-2 bg-gray-100 rounded shadow"
              >
                <strong className="">{key}:</strong>
                <span className="">
                  {value !== null && value !== undefined
                    ? value.toString()
                    : "N/A"}
                </span>
              </div>
            ))
          ) : (
            <div>No session data available.</div>
          )}
        </div>

        {/* Navigation Links */}
        <div className="container flex flex-col lg:flex-row gap-4 justify-center">
          <div className="p-6 text-center border-gray-50 rounded-lg shadow-gray-50 shadow-lg">
            <h5 className="text-xl font-medium mb-2">Auto CASW</h5>
            <h5 className="text-sm text-orange-600">
              Auto Create Admin Cashier Shop And Wallet
            </h5>
            <Link
              className="text-sm text-blue-700 underline hover:text-blue-900"
              href={"/SuperAdmin/Auto-casw"}
            >
              Auto-CASW ---
            </Link>
          </div>
          <div className="p-6 text-center rounded-lg shadow-gray-50 shadow-lg">
            <h5 className="text-xl font-medium mb-2">Users Management</h5>
            <h5 className="text-sm text-orange-600">
              Manage the Users inside the System
            </h5>
            <Link
              className="text-sm text-blue-700 underline hover:text-blue-900"
              href={"/Agent/users"}
            >
              Users ---
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;

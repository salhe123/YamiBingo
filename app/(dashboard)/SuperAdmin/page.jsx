"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";

const Page = () => {
  const { data: session, status } = useSession();

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
          SuperAdmin Home Dashboard
        </h1>
        <div className="flex justify-center text-gray-950 flex-wrap gap-4">
          {session?.user ? (
            Object.entries(session.user).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center space-x-2 p-2 bg-gray-100 rounded shadow"
              >
                <strong className="">{key}:</strong>
                <span className="">{value ? value.toString() : "N/A"}</span>
              </div>
            ))
          ) : (
            <div>No session data available.</div>
          )}
        </div>

        <div className="container flex flex-col lg:flex-row gap-4 justify-center">
          <div className="p-6 text-center border-gray-50 rounded-lg shadow-gray-50 shadow-lg ">
            <h5 className="text-xl font-medium mb-2">Auto CASW</h5>
            <h5 className="text-sm text-orange-600">
              Auto Create Admin Cashier Shop And Wallet
            </h5>

            <Link
              className="text-sm text-blue-700 underline hover:text-blue-900 "
              href={"/SuperAdmin/Auto-casw"}
            >
              Auto-CASW ---
            </Link>
          </div>
          <div className="p-6 text-center rounded-lg shadow-gray-50 shadow-lg ">
            <h5 className="text-xl font-medium mb-2">Users Management</h5>
            <h5 className="text-sm text-orange-600">
              Manage the Users inside the System
            </h5>
            <Link
              className="text-sm text-blue-700 underline hover:text-blue-900 "
              href={"/SuperAdmin/Users"}
            >
              Users ---
            </Link>
          </div>
          <div className="p-6 text-center rounded-lg shadow-gray-50 shadow-lg ">
            <h5 className="text-xl font-medium mb-2">Shops Management</h5>
            <h5 className="text-sm text-orange-600">
              Manage the Shops inside the System
            </h5>
            <Link
              className="text-sm text-blue-700 underline hover:text-blue-900 "
              href={"/SuperAdmin/Shops"}
            >
              Shops ---
            </Link>
          </div>
          <div className="p-6 text-center rounded-lg shadow-gray-50 shadow-lg ">
            <h5 className="text-xl font-medium mb-2">Cashier Management</h5>
            <h5 className="text-sm text-orange-600">
              Manage the Cashier inside the System
            </h5>
            <Link
              className="text-sm text-blue-700 underline hover:text-blue-900 "
              href={"/SuperAdmin/Cashiers"}
            >
              Cashiers ---
            </Link>
          </div>
          <div className="p-6 text-center rounded-lg shadow-gray-50 shadow-lg ">
            <h5 className="text-xl font-medium mb-2">Wallets Management</h5>
            <h5 className="text-sm text-orange-600">
              Manage the Wallets inside the System
            </h5>
            <Link
              className="text-sm text-blue-700 underline hover:text-blue-900 "
              href={"/SuperAdmin/Wallets"}
            >
              Wallets ---
            </Link>
          </div>
          <div className="p-6 text-center rounded-lg shadow-gray-50 shadow-lg ">
            <h5 className="text-xl font-medium mb-2">
              Transactions Management
            </h5>
            <h5 className="text-sm text-orange-600">
              Manage the Transactions inside the System
            </h5>
            <Link
              className="text-sm text-blue-700 underline hover:text-blue-900 "
              href={"/SuperAdmin/Transaction"}
            >
              Transactions ---
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;

"use client";
import CashierGames from "@/components/Cashiers/CashierGames";
import { useSession } from "next-auth/react";
import Link from "next/link";

const CashierDashboard = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "authenticated") {
    const { user } = session;

    return (
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols gap-2">
          <div className="bg-gradient-to-br from-gray-200 to-white shadow-md rounded-xl hover:shadow-lg transition-shadow border p-6 mb-8 transform transition-transform duration-300">
            <div className="flex flex-col items-center text-center space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                Hello there!
                <span className="ml-2 text-3xl emoji-bounce">😊</span>
              </h2>
              <h1 className="font-bold text-orange-600 bg-orange-50 px-4 py-2 rounded-full shadow-md">
                {user?.email || "Guest"}
              </h1>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-8">
            <CashierGames />
          </div>
        </div>
      </div>
    );
  }

  return <div>You are not logged in.</div>;
};

export default CashierDashboard;

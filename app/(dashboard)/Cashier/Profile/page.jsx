"use client";
import React from "react";
import { useSession } from "next-auth/react";

const Page = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "authenticated") {
    const { user } = session;

    return (
      <div className="container mx-auto px-2">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white shadow-md rounded-lg p-8">
            <div className="flex flex-col">
              Welcome to the{" "}
              <h1 className="font-bold flex-col text-orange-500">
                {user?.email}
              </h1>{" "}
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-8">
            <h1 className="font-bold flex-col text-orange-500">
              Cashier Account Details
            </h1>{" "}
            <ul>
              {Object.entries(user).map(([key, value]) => (
                <li key={key}>
                  <strong>{key}:</strong> {value ? value.toString() : "N/A"}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return <div>You are not logged in.</div>;
};

export default Page;

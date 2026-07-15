"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import axios from "axios";

const WalletsTopUp = () => {
  const router = useRouter();
  const [inputs, setInputs] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    axios
      .post("/api/wallets/create", inputs)
      .then((res) => {
        console.log("Top-up successful:", res.data);
      })
      .catch((err) => {
        console.error("Error during TopUP:", err.response || err.message);
      })
      .finally(() => {
        setInputs({}); // Clear the inputs
        setLoading(false);
        window.location.reload(); // Reload the entire page after successful top-up
      });
  };

  const handleChange = (e) => {
    const name = e.target.name;
    let value = e.target.value;

    // Convert `initialBalance` to a float if it's being updated
    if (name === "initialBalance") {
      value = parseFloat(value) || ""; // Ensure it's a float or an empty string for invalid inputs
    }

    setInputs((prevState) => ({ ...prevState, [name]: value }));
  };

  return (
    <div className="max-w-lg w-full max-h-96 overflow-y-auto rounded-lg shadow-md bg-gray-800 p-6 font-[sans-serif] text-white">
      <h1 className="text-xl font-semibold pb-4 border-b border-gray-700">
        Top Up Shop Wallet
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div>
          <label className="block text-xs font-semibold mb-1">Shop ID</label>
          <input
            name="shopId"
            type="text"
            value={inputs.shopId || ""}
            onChange={handleChange}
            className="w-full text-black bg-gray-100 border border-gray-300 text-sm rounded p-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
            placeholder="Enter Admin ID"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">
            Top-Up Amount
          </label>
          <input
            name="initialBalance"
            type="number"
            value={inputs.initialBalance || ""}
            onChange={handleChange}
            className="w-full text-black bg-gray-100 border border-gray-300 text-sm rounded p-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
            placeholder="Enter Top-Up Amount"
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full py-2 text-sm font-semibold rounded text-white bg-orange-600 hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 focus:ring-offset-gray-800 transition-colors duration-200"
            disabled={loading}
          >
            {loading ? "Processing..." : "Top-Up Admin"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WalletsTopUp;

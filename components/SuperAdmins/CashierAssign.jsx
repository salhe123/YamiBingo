"use client";

import { useState, useEffect } from "react";
import axios from "axios";

const CashierAssign = () => {
  const [cashiers, setCashiers] = useState([]);
  const [shops, setShops] = useState([]);
  const [selectedCashier, setSelectedCashier] = useState("");
  const [selectedShop, setSelectedShop] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch shops and cashiers on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch shops
        const shopResponse = await axios.get("/api/shops");
        console.log("Shop API Response:", shopResponse.data);
        setShops(shopResponse.data || []);

        // Fetch unassigned cashiers
        const cashierResponse = await axios.get("/api/cashiers/unassigned");
        console.log("Cashier API Response:", cashierResponse.data);

        // Directly set cashiers
        setCashiers(cashierResponse.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Error fetching data.");
      }
    };

    fetchData();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCashier || !selectedShop) {
      setError("Please select both cashier and shop.");
      return;
    }

    try {
      const response = await axios.post("/api/cashiers/assign-cashier", {
        cashierId: selectedCashier,
        shopId: selectedShop,
      });

      setSuccess("Cashier assigned to shop successfully.");
      setError("");
    } catch (err) {
      console.error("Error assigning cashier to shop:", err);
      setError("Error assigning cashier to shop.");
      setSuccess("");
    }
  };

  return (
    <div className="max-w-lg w-full max-h-96 overflow-y-auto rounded-lg shadow-md shadow-gray-50 bg-gray-800 p-6 font-[sans-serif] text-white">
      <h2 className="text-2xl font-semibold">Assign Cashier to Shop</h2>

      {/* Error or Success Message */}
      {error && <div className="text-red-500 mt-4">{error}</div>}
      {success && <div className="text-green-500 mt-4">{success}</div>}

      <form onSubmit={handleSubmit} className="mt-4">
        {/* Shop Dropdown */}
        <div className="mb-4">
          <label htmlFor="shop" className="block font-medium mb-2">
            Select Shop
          </label>
          <select
            id="shop"
            value={selectedShop}
            onChange={(e) => setSelectedShop(e.target.value)}
            className="p-2 border rounded text-gray-900 focus:ring-orange-500 focus:outline-none w-full"
          >
            <option value="">Select Shop</option>
            {shops.map((shop) => (
              <option key={shop.id} value={shop.id}>
                {shop.shopName} - {shop.location}
              </option>
            ))}
          </select>
        </div>

        {/* Cashier Dropdown */}
        <div className="mb-4">
          <label htmlFor="cashier" className="block text-lg font-medium mb-2">
            Select Cashier
          </label>
          <select
            id="cashier"
            value={selectedCashier}
            onChange={(e) => setSelectedCashier(e.target.value)}
            className="p-2 border rounded text-gray-900 focus:ring-orange-500 focus:outline-none w-full"
          >
            <option value="">Select Cashier</option>
            {cashiers.map((cashier) => (
              <option key={cashier.id} value={cashier.id}>
                {cashier.user?.firstName} {cashier.user?.lastName}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <div className="text-center mt-4">
          <button
            type="submit"
            className="w-full py-2 text-sm font-semibold rounded text-white bg-orange-600 hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 focus:ring-offset-gray-800 transition-colors duration-200"
          >
            Assign Cashier
          </button>
        </div>
      </form>
    </div>
  );
};

export default CashierAssign;

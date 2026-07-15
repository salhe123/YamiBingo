"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import axios from "axios";

const ShopRegistration = ({ setShops }) => {
  const router = useRouter();
  const [inputs, setInputs] = useState({});
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState([]); // State for admin list
  const [error, setError] = useState(null); // State for error handling

  // Fetch admins on component mount
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await axios.get("/api/users/admins"); // Adjust endpoint as needed
        setAdmins(response.data);
      } catch (err) {
        setError("Failed to fetch admins");
        console.error(err);
      }
    };
    fetchAdmins();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    axios
      .post("/api/shops", inputs)
      .then((res) => {
        axios.get("/api/shops").then((response) => {
          setShops(response.data); // Update the shop list
        });
      })
      .catch((err) => {
        console.error(
          "Error during registration:",
          err.response || err.message
        );
      })
      .finally(() => {
        setInputs({});
        setLoading(false);
        router.refresh(); // Optionally refresh other parts of the app
      });
  };

  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setInputs((prevState) => ({ ...prevState, [name]: value }));
  };

  return (
    <div className="max-w-lg w-full max-h-96 overflow-y-auto rounded-lg shadow-md shadow-gray-50 bg-gray-800 p-6 font-[sans-serif] text-white">
      <h2 className="text-2xl font-semibold mb-6">Manual Shop Registration</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="grid sm:grid-cols-2 gap-8">
          <div>
            <label className="text-sm mb-2 block">Shop Name</label>
            <input
              name="shopName"
              value={inputs.shopName || ""}
              onChange={handleChange}
              type="text"
              className="bg-gray-100 w-full text-sm px-4 py-3.5 rounded-md focus:bg-transparent outline-blue-500 transition-all"
              placeholder="Shop Name"
              required
            />
          </div>
          <div>
            <label className="text-sm mb-2 block">Shop Location</label>
            <input
              name="location"
              value={inputs.location || ""}
              onChange={handleChange}
              type="text"
              className="bg-gray-100 w-full text-sm px-4 py-3.5 rounded-md focus:bg-transparent outline-blue-500 transition-all"
              placeholder="Shop Location"
              required
            />
          </div>
          <div>
            <label className="text-sm mb-2 block">Shop Owner (Admin)</label>
            <select
              name="ownerId"
              value={inputs.ownerId || ""}
              onChange={handleChange}
              className="bg-gray-100 w-full text-sm px-4 py-3.5 rounded-md focus:bg-transparent outline-blue-500 transition-all text-black"
              required
            >
              <option value="">Select an Admin</option>
              {admins.map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.firstName} {admin.lastName}{" "}
                  {/* Adjust based on your data */}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="!mt-12">
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 text-sm font-semibold rounded text-white ${
              loading
                ? "bg-orange-400 cursor-not-allowed"
                : "bg-orange-600 hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 focus:ring-offset-gray-800"
            } transition-colors duration-200`}
          >
            {loading ? "Registering..." : "Register new Shop"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShopRegistration;

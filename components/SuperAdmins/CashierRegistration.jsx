"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import axios from "axios";

const CashierRegistration = () => {
  const router = useRouter();
  const [inputs, setInputs] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    axios
      .post("/api/cashiers", inputs)
      .then((res) => {
        // Reload the page after successful registration
        window.location.reload();
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
      });
  };

  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setInputs((prevState) => ({ ...prevState, [name]: value }));
  };

  return (
    <div>
      <div>
        <div className="max-w-4xl mx-auto font-[sans-serif] p-6">
          <div className="text-4xl pb-4 underline">Registration</div>
          <form onSubmit={handleSubmit}>
            <div className="grid sm:grid-cols-2 gap-8">
              <div>
                <label className="text-gray-800 text-sm mb-2 block">
                  Shop ID
                </label>
                <input
                  name="shopId"
                  value={inputs.shopId || ""}
                  onChange={handleChange}
                  type="text"
                  className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md focus:bg-transparent outline-blue-500 transition-all"
                  placeholder="Enter Shop ID"
                />
              </div>
              <div>
                <label className="text-gray-800 text-sm mb-2 block">
                  Cashier ID
                </label>
                <input
                  name="userId"
                  value={inputs.userId || ""}
                  onChange={handleChange}
                  type="text"
                  className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3.5 rounded-md focus:bg-transparent outline-blue-500 transition-all"
                  placeholder="Cashier User ID"
                />
              </div>
              <div className="justify-center">
                <input type="checkbox" />
                <label>Is Blocked:</label>
              </div>
            </div>

            <div className="!mt-12">
              <button
                type="submit"
                className="py-3.5 px-7 text-sm font-semibold tracking-wider rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
              >
                Register new Shop
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CashierRegistration;

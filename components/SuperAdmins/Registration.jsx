"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const Registration = ({ setUsers }) => {
  const route = useRouter();
  const [inputs, setInputs] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    axios
      .post("/api/users", inputs)
      .then((res) => {
        axios.get("/api/users").then((response) => {
          setUsers(response.data);
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
        route.refresh(); // Optionally refresh other parts of the app
      });
  };

  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setInputs((prevState) => ({ ...prevState, [name]: value }));
  };

  return (
    <div className="container mx-auto px-2 py-2">
      <div className="max-w-4xl mx-auto font-sans bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Register New User
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label
                htmlFor="firstName"
                className="text-gray-700 text-sm font-medium mb-2 block"
              >
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-100 rounded-md border border-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Enter first name"
                value={inputs.firstName || ""}
                onChange={handleChange}
              />
            </div>

            {/* Last Name */}
            <div>
              <label
                htmlFor="lastName"
                className="text-gray-700 text-sm font-medium mb-2 block"
              >
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className="w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-100 rounded-md border border-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Enter last name"
                value={inputs.lastName || ""}
                onChange={handleChange}
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="text-gray-700 text-sm font-medium mb-2 block"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-100 rounded-md border border-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Enter email"
                value={inputs.email || ""}
                onChange={handleChange}
              />
            </div>

            {/* Phone Number */}
            <div>
              <label
                htmlFor="phoneNumber"
                className="text-gray-700 text-sm font-medium mb-2 block"
              >
                Mobile Number
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                className="w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-100 rounded-md border border-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Enter mobile number"
                value={inputs.phoneNumber || ""}
                onChange={handleChange}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="text-gray-700 text-sm font-medium mb-2 block"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-100 rounded-md border border-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Enter password"
                value={inputs.password || ""}
                onChange={handleChange}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="cpassword"
                className="text-gray-700 text-sm font-medium mb-2 block"
              >
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                id="cpassword"
                name="cpassword"
                type="password"
                required
                className="w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-100 rounded-md border border-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Confirm password"
                value={inputs.cpassword || ""}
                onChange={handleChange}
              />
            </div>

            {/* Role Selection */}
            <div className="sm:col-span-2">
              <label className="text-gray-700 text-sm font-medium mb-2 block">
                Role <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center space-x-2">
                  <input
                    id="SuperAdminRadio"
                    type="radio"
                    name="role"
                    value="SuperAdmin"
                    checked={inputs.role === "SuperAdmin"}
                    onChange={handleChange}
                    className="text-blue-500 focus:ring-blue-500"
                    required
                  />
                  <span className="text-gray-800 text-sm">SuperAdmin</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    id="AdminRadio"
                    type="radio"
                    name="role"
                    value="Admin"
                    checked={inputs.role === "Admin"}
                    onChange={handleChange}
                    className="text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-gray-800 text-sm">Admin</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    id="CashierRadio"
                    type="radio"
                    name="role"
                    value="Cashier"
                    checked={inputs.role === "Cashier"}
                    onChange={handleChange}
                    className="text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-gray-800 text-sm">Cashier</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    id="FloorGuyRadio"
                    type="radio"
                    name="role"
                    value="FloorGuy"
                    checked={inputs.role === "FloorGuy"}
                    onChange={handleChange}
                    className="text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-gray-800 text-sm">FloorGuy</span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              className="py-2.5 px-6 text-sm font-semibold text-white bg-gray-800 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
            >
              Register New User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Registration;

"use client";
import React, { useState, useEffect } from "react";
import Registration from "@/components/SuperAdmins/Registration";
import UsersTable from "@/components/SuperAdmins/UsersTable";
import axios from "axios";

const Page = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("/api/superAdmin/users");
        console.log("API Response Data:", response.data);
        if (response.data.success !== undefined) {
          setUsers(response.data.data || []);
        } else {
          setUsers(response.data);
        }
        setLoading(false);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError(`Failed to fetch users: ${err.message}`);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleBlockUnblock = async (userId, isBlocked) => {
    try {
      const action = isBlocked ? "unblock" : "block";
      const requestBody = { userId, action };
      console.log("Sending PATCH request with body:", requestBody); // Debug log
      const response = await axios.patch(
        "/api/users/block-unblock",
        requestBody
      );

      if (response.data.success) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, isBlocked: !isBlocked } : user
          )
        );
        setError(null);
      } else {
        setError(response.data.message || `Failed to ${action} user`);
      }
    } catch (err) {
      console.error("Block/Unblock Error:", err.response || err);
      setError(
        `Failed to ${isBlocked ? "unblock" : "block"} user: ${err.message}`
      );
    }
  };

  return (
    <div className="mx-auto px-2 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
        {/* <div className="bg-white shadow-md rounded-lg lg:col-span-5 lg:order-none">
          <Registration setUsers={setUsers} />
        </div> */}
        <div className="bg-white shadow-md rounded-lg p-6 lg:p-8 lg:col-span-7 order-2 lg:order-none">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            User List
          </h2>
          <UsersTable
            users={users}
            loading={loading}
            error={error}
            onBlockUnblock={handleBlockUnblock}
          />
          {loading && (
            <p className="text-gray-500 text-center mt-4">Loading users...</p>
          )}
          {error && (
            <p className="text-red-600 text-center mt-4">Error: {error}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;

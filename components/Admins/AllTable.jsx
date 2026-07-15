"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";

const AdminDetailsTable = () => {
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session, status } = useSession();

  const id = session?.user?.id;
  console.log("this is the All Table console", id);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await axios.get(`/api/admins/${id}`);
        setAdminData(response.data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error fetching admin data: {error.message}</div>;
  }

  if (!adminData) {
    return <div>Admin not found</div>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Field</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>ID</td>
          <td>{adminData.id}</td>
        </tr>
        <tr>
          <td>First Name</td>
          <td>{adminData.firstName}</td>
        </tr>
        <tr>
          <td>Last Name</td>
          <td>{adminData.lastName}</td>
        </tr>
        <tr>
          <td>Email</td>
          <td>{adminData.email}</td>
        </tr>
        <tr>
          <td>Role</td>
          <td>{adminData.role}</td>
        </tr>
        <tr>
          <td>Is Blocked</td>
          <td>{adminData.isBlocked ? "Yes" : "No"}</td>
        </tr>
        <tr>
          <td>Phone Number</td>
          <td>{adminData.phoneNumber}</td>
        </tr>
        <tr>
          <td>Created At</td>
          <td>{adminData.createdAt}</td>
        </tr>
        <tr>
          <td>Created By</td>
          <td>{adminData.createdBy}</td>
        </tr>
        <tr>
          <td>Wallet Balance</td>
          <td>{adminData.adminWallet?.balance || "N/A"}</td>
        </tr>
        {/* Add more rows for other fields as needed */}
        <tr>
          <td>Shops</td>
          <td>
            <table>
              <thead>
                <tr>
                  <th>Shop ID</th>
                  <th>Shop Name</th>
                  <th>Location</th>
                  <th>Cashiers</th>
                  <th>Games</th>
                </tr>
              </thead>
              <tbody>
                {adminData.shops.map((shop) => (
                  <tr key={shop.id}>
                    <td>{shop.id}</td>
                    <td>{shop.shopName}</td>
                    <td>{shop.location}</td>
                    <td>
                      <table>
                        <thead>
                          <tr>
                            <th>Cashier ID</th>
                            <th>Cashier Name</th>
                            <th>Is Blocked</th>
                          </tr>
                        </thead>
                        <tbody>
                          {shop.cashiers.map((cashier) => (
                            <tr key={cashier.id}>
                              <td>{cashier.id}</td>
                              <td>
                                {cashier.user.firstName} {cashier.user.lastName}
                              </td>
                              <td>{cashier.isBlocked ? "Yes" : "No"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                    <td>
                      <table>
                        <thead>
                          <tr>
                            <th>Game ID</th>
                            <th>Status</th>
                            <th>Bet Amount</th>
                            <th>Number of Players</th>
                            <th>Winning Amount</th>
                            <th>Winner Card</th>
                            <th>Shop Commission</th>
                            <th>System Commission</th>
                          </tr>
                        </thead>
                        <tbody>
                          {shop.games.map((game) => (
                            <tr key={game.id}>
                              <td>{game.id}</td>
                              <td>{game.status}</td>
                              <td>{game.betAmount}</td>
                              <td>{game.numberOfPlayers}</td>
                              <td>{game.winningAmount}</td>
                              <td>{game.winnerCard}</td>
                              <td>{game.shopCommission}</td>
                              <td>{game.systemCommission}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default AdminDetailsTable;

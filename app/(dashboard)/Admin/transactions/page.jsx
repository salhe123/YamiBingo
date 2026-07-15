"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";

const Transactions = () => {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "shopName",
    direction: "asc",
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!session || !session.user || !session.user.id) return;

      try {
        const response = await axios.get(
          `/api/admins/transactions?userId=${session.user.id}`
        );
        setTransactions(response.data.transactions);
      } catch (err) {
        setError("Failed to fetch transactions.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [session]);

  const sortData = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedTransactions = [...transactions].sort((a, b) => {
      if (key === "createdAt") {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return direction === "asc" ? dateA - dateB : dateB - dateA;
      } else {
        const valueA = a[key].toLowerCase();
        const valueB = b[key].toLowerCase();
        return direction === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
    });

    setTransactions(sortedTransactions);
  };

  if (loading)
    return (
      <div className="text-center text-gray-600 py-10">
        Loading transactions...
      </div>
    );
  if (error)
    return <div className="text-center text-red-500 py-10">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Transactions</h1>
      {transactions.length === 0 ? (
        <p className="text-gray-500 text-center py-10">
          No transactions found.
        </p>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold">
              <tr>
                <th
                  className="px-6 py-4 text-center cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => sortData("shopName")}
                >
                  Shop Name
                  {sortConfig.key === "shopName" && (
                    <span className="ml-1">
                      {sortConfig.direction === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th className="px-6 py-4 text-center">Amount</th>
                <th className="px-6 py-4 text-center">Type</th>
                <th className="px-6 py-4 text-center">Description</th>
                <th
                  className="px-6 py-4 text-center cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => sortData("createdAt")}
                >
                  Date
                  {sortConfig.key === "createdAt" && (
                    <span className="ml-1">
                      {sortConfig.direction === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {transactions.map((transaction, index) => (
                <tr
                  key={transaction.id}
                  className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <td className="px-6 py-4 text-center font-medium">
                    {transaction.shopName}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-green-600 font-semibold">
                      ${transaction.amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.type === "credit"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm">
                    {transaction.description || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-center text-sm">
                    {new Date(transaction.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Transactions;

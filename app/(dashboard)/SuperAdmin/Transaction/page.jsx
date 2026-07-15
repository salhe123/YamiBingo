"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

const TransactionsList = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shopFilter, setShopFilter] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [totalAmount, setTotalAmount] = useState(0);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(
          `/api/wallets/transactions?page=${currentPage}&limit=${itemsPerPage}`
        );

        setTransactions(response.data.transactions);
        setFilteredTransactions(response.data.transactions);
        setTotalItems(response.data.totalCount);
        setTotalPages(response.data.totalPages);
        setTotalAmount(response.data.totalAmount || 0);
      } catch (err) {
        setError("Failed to fetch transactions");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [currentPage, itemsPerPage]);

  // Function to filter transactions by shop
  const filterByShop = (shopName) => {
    setShopFilter(shopName);
    if (shopName === "") {
      // When filter is cleared, fetch the first page of all transactions
      setCurrentPage(1);
      axios
        .get(`/api/wallets/transactions?page=1&limit=${itemsPerPage}`)
        .then((response) => {
          setTransactions(response.data.transactions);
          setFilteredTransactions(response.data.transactions);
          setTotalItems(response.data.totalCount);
          setTotalPages(response.data.totalPages);
        });
    } else {
      // For client-side filtering (if you prefer server-side, modify the API to accept shop filter)
      const filtered = transactions.filter((transaction) =>
        transaction.shopName.toLowerCase().includes(shopName.toLowerCase())
      );
      setFilteredTransactions(filtered);
    }
    setSortConfig({ key: "createdAt", direction: "desc" });
  };

  // Function to handle sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });

    const sorted = [...filteredTransactions].sort((a, b) => {
      if (key === "createdAt") {
        return direction === "asc"
          ? new Date(a[key]) - new Date(b[key])
          : new Date(b[key]) - new Date(a[key]);
      }
      if (key === "amount" || key === "walletBalance") {
        return direction === "asc"
          ? (a[key] || 0) - (b[key] || 0)
          : (b[key] || 0) - (a[key] || 0);
      }
      // String comparison for other fields
      const aValue = a[key]?.toString().toLowerCase() || "";
      const bValue = b[key]?.toString().toLowerCase() || "";
      return direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

    setFilteredTransactions(sorted);
  };

  // Function to export the table data to Excel
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(filteredTransactions);
    XLSX.utils.book_append_sheet(wb, ws, "Filtered Transactions");
    XLSX.writeFile(wb, "filtered_transactions.xlsx");
  };

  // Function to change items per page
  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="max-h-screen overflow-y-auto overflow-x-auto rounded-lg shadow-md bg-gray-800 text-white p-6">
      <h1 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-4">
        Transactions List
      </h1>

      {/* Filter by Shop Input and Export Button */}
      <div className="mb-4 flex items-center space-x-3">
        <input
          type="text"
          placeholder="Filter by Shop Name"
          value={shopFilter}
          onChange={(e) => filterByShop(e.target.value)}
          className="px-2 py-1 border border-gray-300 bg-gray-100 text-black text-sm rounded focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200 w-full max-w-md"
        />
        <button
          onClick={exportToExcel}
          className="px-3 py-1 bg-orange-600 text-white text-sm font-semibold rounded hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 focus:ring-offset-gray-800 transition-colors duration-200 whitespace-nowrap"
        >
          Export to Excel
        </button>
      </div>

      {/* Total Amount Card */}
      <div className="mb-6 p-4 bg-gray-700 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-300">
              Total Transactions Amount
            </h2>
            <p className="text-sm text-gray-400">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(totalAmount)}
            </p>
          </div>
          <div className="text-2xl font-bold text-orange-500">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(totalAmount)}
          </div>
        </div>
      </div>

      {/* Items per page selector */}
      <div className="mb-4 flex items-center">
        <label htmlFor="itemsPerPage" className="mr-2 text-sm">
          Items per page:
        </label>
        <select
          id="itemsPerPage"
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
          className="px-2 py-1 border border-gray-300 bg-gray-100 text-black text-sm rounded focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800">
          <thead className="bg-gray-900 sticky top-0 text-sm font-semibold text-white z-10">
            <tr>
              <th
                className="px-4 py-2 text-left cursor-pointer"
                onClick={() => handleSort("id")}
              >
                ID{" "}
                {sortConfig.key === "id" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="px-4 py-2 text-left cursor-pointer"
                onClick={() => handleSort("amount")}
              >
                Amount{" "}
                {sortConfig.key === "amount" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="px-4 py-2 text-left cursor-pointer"
                onClick={() => handleSort("type")}
              >
                Type{" "}
                {sortConfig.key === "type" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="px-4 py-2 text-left cursor-pointer"
                onClick={() => handleSort("description")}
              >
                Description{" "}
                {sortConfig.key === "description" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="px-4 py-2 text-left cursor-pointer"
                onClick={() => handleSort("createdAt")}
              >
                Created At{" "}
                {sortConfig.key === "createdAt" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="px-4 py-2 text-left cursor-pointer"
                onClick={() => handleSort("walletBalance")}
              >
                Wallet Balance{" "}
                {sortConfig.key === "walletBalance" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="px-4 py-2 text-left cursor-pointer"
                onClick={() => handleSort("shopName")}
              >
                Shop Name{" "}
                {sortConfig.key === "shopName" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="px-4 py-2 text-left cursor-pointer"
                onClick={() => handleSort("shopLocation")}
              >
                Shop Location{" "}
                {sortConfig.key === "shopLocation" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="px-4 py-2 text-left cursor-pointer"
                onClick={() => handleSort("shopOwner")}
              >
                Shop Owner{" "}
                {sortConfig.key === "shopOwner" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="px-4 py-2 text-left cursor-pointer"
                onClick={() => handleSort("shopId")}
              >
                Shop ID{" "}
                {sortConfig.key === "shopId" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-200">
            {filteredTransactions.map((transaction, index) => (
              <tr
                key={transaction.id}
                className={`hover:bg-gray-700 ${
                  index % 2 === 0 ? "bg-gray-800" : "bg-gray-750"
                } border-b border-gray-700`}
              >
                <td className="px-4 py-2 text-xs text-gray-500 whitespace-nowrap">
                  {transaction.id}
                </td>
                <td className="px-4 py-2 text-sm">
                  ${transaction.amount.toFixed(2)}
                </td>
                <td className="px-4 py-2 text-sm">{transaction.type}</td>
                <td className="px-4 py-2 text-sm">
                  {transaction.description || "N/A"}
                </td>
                <td className="px-4 py-2 text-sm">
                  {new Date(transaction.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-2 text-sm">
                  ${transaction.walletBalance?.toFixed(2) || "N/A"}
                </td>
                <td className="px-4 py-2 text-sm">{transaction.shopName}</td>
                <td className="px-4 py-2 text-sm">
                  {transaction.shopLocation}
                </td>
                <td className="px-4 py-2 text-sm">{transaction.shopOwner}</td>
                <td className="px-4 py-2 text-xs text-gray-500 whitespace-nowrap">
                  {transaction.shopId}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">
          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
          {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
          transactions
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded ${
              currentPage === 1
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-orange-600 hover:bg-orange-700"
            }`}
          >
            Previous
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Show up to 5 page buttons
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-1 rounded ${
                  currentPage === pageNum
                    ? "bg-orange-700"
                    : "bg-orange-600 hover:bg-orange-700"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded ${
              currentPage === totalPages
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-orange-600 hover:bg-orange-700"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionsList;

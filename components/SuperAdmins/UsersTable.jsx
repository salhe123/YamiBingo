import React from "react";

const UsersTable = ({ users = [], loading, error, onBlockUnblock }) => {
  if (loading)
    return <p className="text-gray-500 text-center py-4">Loading users...</p>;
  if (error) return <p className="text-red-600 text-center py-4">{error}</p>;

  return (
    <div className="max-h-96 overflow-y-auto overflow-x-auto rounded-lg shadow-md">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-800 text-white sticky top-0">
          <tr>
            <th className="py-2 px-4 text-left text-xs font-semibold">_id</th>
            <th className="py-2 px-4 text-left text-xs font-semibold">
              First Name
            </th>
            <th className="py-2 px-4 text-left text-xs font-semibold">
              Last Name
            </th>
            <th className="py-2 px-4 text-left text-xs font-semibold">Email</th>
            <th className="py-2 px-4 text-left text-xs font-semibold">Role</th>
            <th className="py-2 px-4 text-left text-xs font-semibold">Phone</th>
            <th className="py-2 px-4 text-left text-xs font-semibold">
              Created At
            </th>
            <th className="py-2 px-4 text-center text-xs font-semibold">
              Is Blocked
            </th>
            <th className="py-2 px-4 text-left text-xs font-semibold">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="text-gray-600">
          {Array.isArray(users) && users.length > 0 ? (
            users.map((user, index) => (
              <tr
                key={user.id || index} // Use id instead of _id
                className={`hover:bg-gray-50 ${
                  index % 2 === 0 ? "bg-gray-100" : "bg-white"
                }`}
              >
                <td className="py-2 px-4 border-b text-xs text-gray-500 whitespace-nowrap">
                  {user.id || "N/A"}
                  <button
                    className="ml-2 text-gray-600 hover:text-gray-800 text-xs"
                    onClick={() => navigator.clipboard.writeText(user.id || "")}
                    title="Copy ID"
                  >
                    📋
                  </button>
                </td>
                <td className="py-2 px-4 border-b text-sm">
                  {user.firstName || "N/A"}
                </td>
                <td className="py-2 px-4 border-b text-sm">
                  {user.lastName || "N/A"}
                </td>
                <td className="py-2 px-4 border-b text-sm text-blue-900">
                  {user.email || "N/A"}
                </td>
                <td className="py-2 px-4 border-b">
                  <span className="px-2 py-1 bg-gray-200 rounded text-xs">
                    {user.role || "N/A"}
                  </span>
                </td>
                <td className="py-2 px-4 border-b text-sm">
                  {user.phoneNumber || "N/A"}
                </td>
                <td className="py-2 px-4 border-b text-sm">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "N/A"}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  <span className="px-2 py-1 bg-gray-200 rounded text-xs">
                    {user.isBlocked ? "Yes" : "No"}
                  </span>
                </td>
                <td className="py-2 px-4 border-b text-sm">
                  <button
                    className={`px-2 py-1 rounded text-xs ${
                      user.isBlocked
                        ? "text-green-600 hover:bg-green-100"
                        : "text-red-600 hover:bg-red-100"
                    }`}
                    onClick={() => onBlockUnblock(user.id, user.isBlocked)}
                  >
                    {user.isBlocked ? "Unblock" : "Block"}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="9"
                className="py-4 px-4 text-center text-gray-500 text-sm"
              >
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;

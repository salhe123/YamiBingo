"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { IoEye } from "react-icons/io5";
import { FaEyeSlash } from "react-icons/fa6";

const CashierGames = () => {
  const [games, setGames] = useState([]);
  const [error, setError] = useState(null);
  const { data: session } = useSession();
  const [showCards, setShowCards] = useState(false);

  // Function to fetch games
  const fetchGames = async () => {
    if (session?.user?.cashierId) {
      try {
        const response = await axios.get(
          `/api/games/cashier/${session.user.cashierId}`
        );
        setGames(response.data);
      } catch (error) {
        setError("Error fetching games");
      }
    }
  };

  // Fetch games on initial load and every 1 minute
  useEffect(() => {
    fetchGames(); // Initial fetch

    const intervalId = setInterval(() => {
      fetchGames();
    }, 30000); // Fetch every 30 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [session?.user?.cashierId]);

  const updateGameStatus = async (gameId, winnerCard) => {
    try {
      const response = await axios.put(`/api/games/${gameId}/update`, {
        status: "completed",
        winnerCard,
      });

      const updatedGame = response.data;

      // Update the game in the state
      setGames((prevGames) =>
        prevGames.map((game) =>
          game.id === updatedGame.id ? updatedGame : game
        )
      );
    } catch (error) {
      console.error("Error updating game:", error);
    }
  };

  // Calculate total games and total shop commission
  const totalGames = games.length;
  const totalShopCommission = games.reduce(
    (acc, game) => acc + (game.shopCommission || 0),
    0
  );

  // Toggle the visibility of the cards
  const toggleCardsVisibility = () => {
    setShowCards(!showCards);
  };

  return (
    <div className="mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Daily Games</h2>

      {error && <p className="text-red-500">{error}</p>}

      <button
        onClick={toggleCardsVisibility}
        size={50}
        className="inline-block text-orange-500 hover:text-orange-600 transition-colors"
      >
        {showCards ? <FaEyeSlash /> : <IoEye />}
      </button>

      {showCards && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Card for Total Games */}
          <div className="bg-white shadow-lg rounded-lg p-4">
            <h3 className="text-xl font-semibold text-gray-700">
              Total Games Played
            </h3>
            <p className="text-2xl text-orange-500 font-bold mt-2">
              {totalGames}
            </p>
          </div>

          {/* Card for Total Shop Work */}
          <div className="bg-white shadow-lg rounded-lg p-4">
            <h3 className="text-xl font-semibold text-gray-700">
              Total Shop Work
            </h3>
            <p className="text-2xl text-green-500 font-bold mt-2">
              ${totalShopCommission.toFixed(2)}
            </p>
          </div>
        </div>
      )}
      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold sticky top-0 z-10">
            <tr>
              <th className="px-2 sm:px-6 py-3 text-center">#</th>
              <th className="px-2 sm:px-6 py-3 text-center">Game ID</th>
              <th className="px-2 sm:px-6 py-3 text-center">Status</th>
              <th className="px-2 sm:px-6 py-3 text-center">Bet Amount</th>
              <th className="px-2 sm:px-6 py-3 text-center">
                Number of Players
              </th>
              <th className="px-2 sm:px-6 py-3 text-center">Winner Card</th>
              <th className="px-2 sm:px-6 py-3 text-center">Numbers Called</th>

              <th className="px-2 sm:px-6 py-3 text-center">Net Win Amount</th>
              <th className="px-2 sm:px-6 py-3 text-center">Shop Com</th>
              <th className="px-2 sm:px-6 py-3 text-center">System Com</th>
              <th className="px-2 sm:px-6 py-3 text-center">Total Amount</th>
              <th className="px-2 sm:px-6 py-3 text-center">Created At</th>
              <th className="px-2 sm:px-6 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {games.map((game, index) => (
              <tr
                key={game.id}
                className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                }`}
              >
                <td className="px-1 sm:px-4 py-2 text-center">{index + 1}</td>
                <td className="px-1 sm:px-4 py-2 text-center">
                  {game.id.slice(-4)}
                </td>
                <td className="px-1 sm:px-4 py-2 text-center">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      game.status === "active"
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {game.status}
                  </span>
                </td>
                <td className="px-1 sm:px-4 py-2 text-center text-green-600 font-semibold">
                  {game.betAmount || "N/A"}
                </td>
                <td className="px-1 sm:px-4 py-2 text-center">
                  {game.numberOfPlayers || "N/A"}
                </td>
                <td className="px-1 sm:px-4 py-2 text-center text-xs sm:text-sm">
                  {game.winnerCard || "N/A"}
                </td>
                <td className="px-1 sm:px-4 py-2 text-center text-xs sm:text-sm">
                  {game.numbersCalled || "N/A"}
                </td>
                <td className="px-1 sm:px-4 py-2 text-center text-green-600 font-semibold">
                  {(game.winningAmount - game.shopCommission)?.toFixed(2) ||
                    "N/A"}
                </td>

                <td className="px-1 sm:px-4 py-2 text-center text-green-600 font-semibold">
                  {game.shopCommission || "0.00"}
                </td>
                <td className="px-1 sm:px-4 py-2 text-center text-green-600 font-semibold">
                  {game.systemCommission?.toFixed(2) || "Null"}
                </td>

                <td className="px-1 sm:px-4 py-2 text-center text-green-600 font-semibold">
                  {game.winningAmount || "N/A"}
                </td>

                <td className="px-1 sm:px-4 py-2 text-center text-xs sm:text-sm whitespace-nowrap">
                  {new Date(game.createdAt).toLocaleString()}
                </td>
                <td className="px-1 sm:px-4 py-2 text-center text-xs sm:text-sm">
                  {game.status !== "completed" && game.status ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const winnerCard = e.target.winnerCard.value;
                        updateGameStatus(game.id, winnerCard);
                      }}
                      className="flex items-center "
                    >
                      <input
                        type="number"
                        name="winnerCard"
                        placeholder="Enter winner card"
                        className=" p-2 rounded"
                        required
                      />
                      <button
                        type="submit"
                        className="ml-2 bg-green-500 text-white px-3 py-2 rounded"
                      >
                        Complete Game
                      </button>
                    </form>
                  ) : (
                    <p>No actions needed</p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CashierGames;

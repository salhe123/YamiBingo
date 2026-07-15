"use client";
import "../../../globals.css";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // State for error messages
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Clear any previous errors

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res.ok) {
      const userSession = await fetch("/api/auth/session");
      const userData = await userSession.json();
      console.log(userData.role);

      switch (userData.user.role) {
        case "SuperAdmin":
        case "Supervisor":
          router.push("/SuperAdmin");
          break;
        case "Admin":
          router.push("/Admin");
          break;
        case "Cashier":
          router.push("/Cashier");
          break;
        case "FloorGuy":
          router.push("/FloorGuy");
          break;
        case "Agent":
          router.push("/Agent");
          break;
        default:
          setError("Unauthorized access");
          setLoading(false);
          break;
      }
    } else {
      // Check if the error is specifically for email/password mismatch
      if (res.error === "CredentialsSignin") {
        setError("Invalid email or password. Please try again.");
      } else {
        setError(
          `Login failed: ${res.error || "An unexpected error occurred."}`
        );
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      {loading ? (
        <div className="text-center">
          <div className="loader"></div> {/* Simple animation for loading */}
          <p className="text-xl font-bold text-orange-600 mt-2 thinking-emoji">
            Logging in
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="border-2 border-orange-700 shadow-2xl shadow-orange-500 p-10 items-center justify-center rounded-3xl w-150"
        >
          <div className="text-4xl text-center font-bold">
            <h1 className="text-orange-500 p-3 text-4xl"> \|/ </h1>
            <h1>Yami Bingo</h1>
          </div>
          <h2 className="text-4xl font-bold text-center mb-6">Login</h2>
          {error && (
            <p className="text-red-500 text-center mb-4">{error}</p> // Display error message
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full text-black p-2 mb-4 border border-zinc-800 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full text-black p-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
          />
          <button
            type="submit"
            className="w-40 bg-orange-500 text-white border-2 border-zinc-600 py-2 rounded-full hover:bg-zinc-800 hover:border-orange-600 hover:text-white transition duration-200 mx-auto block"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      )}
    </div>
  );
}

"use client";
import "./globals.css";
import Link from "next/link";
import React from "react";

const Page = () => {
  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-100 to-orange-400 text-gray-900 shadow-lg">
        <div className="container mx-auto flex justify-between items-center p-4">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-teal-800 ">
              \|/
            </h1>
            <Link
              href="/"
              className="text-2xl font-extrabold text-teal-800  hover:text-yellow-300 transition drop-shadow-md hover:drop-shadow-lg"
            >
              Yemi Bingo
            </Link>
          </div>
          <nav>
            <ul className="flex space-x-6 text-teal-800  font-medium">
              <li>
                <Link href="/" className="hover:text-yellow-300 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-yellow-300 transition">
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/login"
                  className="bg-yellow-400 text-teal-900 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition"
                >
                  Login
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-tr from-orange-700 text-white py-20">
        <div className="container mx-auto text-center px-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-wide">
            Welcome to Yemi Bingo
          </h1>
          <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto font-light">
            Dive into the ultimate bingo adventure! Play, win, and enjoy a
            thrilling experience like never before.
          </p>
          <Link
            href="/auth/login"
            className="bg-yellow-400 text-teal-900 px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-yellow-500 transition"
          >
            Start Playing Now
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto text-center px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-teal-800 mb-10">
            Why Choose Yemi Bingo?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-teal-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="mb-4 text-yellow-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-teal-700">
                Fun & Local Gameplay
              </h3>
              LCS{" "}
              <p className="text-gray-600">
                Enjoy seamless bingo rounds in your local language with a
                user-friendly interface.
              </p>
            </div>

            <div className="bg-teal-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="mb-4 text-yellow-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-teal-700">
                Exciting Rewards
              </h3>
              <p className="text-gray-600">
                Win big with unique prizes, bonuses, and thrilling game rewards.
              </p>
            </div>

            <div className="bg-teal-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="mb-4 text-yellow-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-teal-700">
                Easy to Enjoy
              </h3>
              <p className="text-gray-600">
                Simple, intuitive design makes bingo fun and accessible for all.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-orange-700 to-indigo-600 text-white py-8">
        <div className="container mx-auto text-center px-4">
          <p className="text-sm">© 2024 All rights reserved by ATS.</p>
          <nav className="mt-4">
            <h1 className="text-sm font-medium hover:underline">
              Developed by{" "}
              <span className="text-yellow-300">
                African Technology Solutions (ATS)
              </span>
            </h1>
            <div className="flex justify-center gap-6 mt-4">
              <Link
                href="https://www.linkedin.com/in/africantechnologies/"
                className="hover:text-yellow-300 transition"
              >
                <span className="[&>svg]:h-6 [&>svg]:w-6 [&>svg]:fill-white hover:[&>svg]:fill-yellow-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                    <path d="M100.3 448H7.4V148.9h92.9zM53.8 108.1C24.1 108.1 0 83.5 0 53.8a53.8 53.8 0 0 1 107.6 0c0 29.7-24.1 54.3-53.8 54.3zM447.9 448h-92.7V302.4c0-34.7-.7-79.2-48.3-79.2-48.3 0-55.7 37.7-55.7 76.7V448h-92.8V148.9h89.1v40.8h1.3c12.4-23.5 42.7-48.3 87.9-48.3 94 0 111.3 61.9 111.3 142.3V448z" />
                  </svg>
                </span>
              </Link>
              <Link
                href="https://t.me/african_solutions"
                className="hover:text-yellow-300 transition"
              >
                <span className="[&>svg]:h-6 [&>svg]:w-6 [&>svg]:fill-white hover:[&>svg]:fill-yellow-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512">
                    <path d="M248 8C111 8 0 119 0 256S111 504 248 504 496 393 496 256 385 8 248 8zM363 176.7c-3.7 39.2-19.9 134.4-28.1 178.3-3.5 18.6-10.3 24.8-16.9 25.4-14.4 1.3-25.3-9.5-39.3-18.7-21.8-14.3-34.2-23.2-55.3-37.2-24.5-16.1-8.6-25 5.3-39.5 3.7-3.8 67.1-61.5 68.3-66.7 .2-.7 .3-3.1-1.2-4.4s-3.6-.8-5.1-.5q-3.3 .7-106.4 71.2-15.1 10.4-27.1 10.1c-8.9-.3-25.9-5.1-38.8-9.3-15.6-5.1-28-7.8-27-16.4q.6-5.2 16.9-10.6 108.4-47.7 144.7-63.1c68.8-28.6 83.1-33.7 92.4-33.8 2 .1 6.4 .5 9.3 3.4 2.4 2.3 3.3 5.4 3.6 8.3z" />
                  </svg>
                </span>
              </Link>
            </div>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Page;

"use client";

import "../../globals.css";
import React from "react";
import { signOut } from "next-auth/react";
import { MdOutlineDashboard, MdFlashAuto } from "react-icons/md";
import { AiOutlineUser, AiOutlineTransaction } from "react-icons/ai";
import { IoWalletOutline } from "react-icons/io5";
import { FaUsers, FaUserTie } from "react-icons/fa";
import { CiShop } from "react-icons/ci";
import Link from "next/link";

const AdminLayout = ({ children }) => {
  const menus = [
    { name: "Home Dashboard", link: "/SuperAdmin", icon: MdOutlineDashboard },
    {
      name: "Auto CASW Create",
      link: "/SuperAdmin/Auto-casw",
      icon: MdFlashAuto,
    },
    { name: "Users", link: "/SuperAdmin/Users", icon: FaUsers },
    { name: "Shops", link: "/SuperAdmin/Shops", icon: CiShop },
    { name: "Cashiers", link: "/SuperAdmin/Cashiers", icon: AiOutlineUser },
    { name: "FloorGuys", link: "/SuperAdmin/FloorGuys", icon: FaUsers },
    { name: "Wallets", link: "/SuperAdmin/Wallets", icon: IoWalletOutline },
    {
      name: "Transaction",
      link: "/SuperAdmin/Transaction",
      icon: AiOutlineTransaction,
    },
    { name: "Agents", link: "/SuperAdmin/Agents", icon: FaUserTie },
  ];

  return (
    <section className="bg-gradient-to-b from-[#1F1A44] to-[#2E2A61] flex flex-col min-h-screen">
      {/* Header with Top Navbar */}
      <header className="bg-slate-950 p-4 flex flex-wrap justify-between items-center">
        <div className="text-xl text-slate-300 font-bold">
          SuperAdmin Dashboard
        </div>
        <nav className="flex flex-wrap gap-4 items-center">
          {menus.map((menu, i) => (
            <Link
              key={i}
              href={menu.link}
              className="flex items-center gap-2 text-slate-300 hover:text-orange-400 transition"
            >
              {React.createElement(menu.icon, { size: "20" })}
              <span>{menu.name}</span>
            </Link>
          ))}
          <div className="ml-4 flex items-center gap-4">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="hover:underline text-red-500"
            >
              Logout
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 m-1 text-xl bg-gray-800 text-zinc-400 font-semibold rounded-lg">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#181818] text-white p-4 flex justify-center items-center">
        <p>&copy; Developed by 2024 ATS . All rights reserved.</p>
      </footer>
    </section>
  );
};

export default AdminLayout;

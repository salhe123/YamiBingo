"use client";

import "../../globals.css";
import React, { useState } from "react";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { MdOutlineDashboard, MdFlashAuto } from "react-icons/md";
import { AiOutlineUser, AiOutlineTransaction } from "react-icons/ai";
import { IoWalletOutline } from "react-icons/io5";
import { FaUsers, FaUserTie } from "react-icons/fa";
import { CiShop } from "react-icons/ci";
import { HiMenuAlt3, HiX } from "react-icons/hi"; // For sidebar toggle
import Link from "next/link";

const AdminLayout = ({ children }) => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menus = [
    { name: "Home Dashboard", link: "/Agent", icon: MdOutlineDashboard },
    {
      name: "Auto CASW Create",
      link: "/Agent/Auto-casw",
      icon: MdFlashAuto,
    },
    { name: "Users", link: "/Agent/users", icon: FaUsers },
   
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:w-64 flex flex-col`}
      >
        {/* Logo/Brand */}
        <div className="p-4 border-b border-slate-800">
          <h1 className="text-2xl font-bold text-orange-400">Agent Dashboard</h1>
        </div>

        {/* User Profile */}
        <div className="p-4 flex items-center gap-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-full bg-orange-400 flex items-center justify-center text-white font-semibold">
            {session?.user?.name?.[0] || "U"}
          </div>
          <div>
            <p className="text-sm font-medium">{session?.user?.name || "User"}</p>
            <p className="text-xs text-slate-400">{session?.user?.email || "user@example.com"}</p>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menus.map((menu, i) => (
            <Link
              key={i}
              href={menu.link}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                pathname === menu.link
                  ? "bg-orange-500 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-orange-400"
              }`}
              onClick={() => setIsSidebarOpen(false)} // Close sidebar on mobile click
            >
              {React.createElement(menu.icon, { size: "24" })}
              <span className="text-sm">{menu.name}</span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 p-3 rounded-lg text-red-400 hover:bg-slate-800 w-full text-sm"
          >
            <HiX size={24} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Menu Toggle */}
        <div className="md:hidden bg-slate-900 p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Agent Dashboard</h1>
          <button onClick={toggleSidebar} className="text-white">
            {isSidebarOpen ? <HiX size={24} /> : <HiMenuAlt3 size={24} />}
          </button>
        </div>

        {/* Content */}
        <main className="flex-1 p-6 bg-gray-100">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>

        {/* Footer */}
        <footer className="bg-slate-900 text-white p-4 text-center">
          <p className="text-sm">
            &copy; 2025 ATS Solutions. All rights reserved. |{" "}
            <a href="/privacy" className="hover:text-orange-400">Privacy Policy</a> |{" "}
            <a href="/terms" className="hover:text-orange-400">Terms of Service</a>
          </p>
        </footer>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
};

export default AdminLayout;
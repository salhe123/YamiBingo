"use client";
import "../../globals.css";
import React, { useState, useEffect } from "react";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import { FaHome, FaUsers, FaGamepad, FaCog } from "react-icons/fa";
import Link from "next/link";
import { signOut } from "next-auth/react";

const AdminLayout = ({ children, session }) => {
  const [open, setOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const menus = [
    { name: "Dashboard", link: "/Admin", icon: FaHome },
    { name: "Cashiers", link: "/Admin/Cashiers", icon: FaUsers },
    { name: "Shops", link: "/Admin/Shops", icon: FaGamepad },
    {
      name: "Wallet History",
      link: "/Admin/transactions",
      icon: FaCog,
      margin: true,
    },
  ];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setOpen(false);
      } else {
        setOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-[#181818] text-white p-1 flex justify-between items-center">
        <div className="text-xl font-bold"></div>
        <div className="text-2xl font-bold">
          <div className="text-center font-bold text-orange-400">
            <h1 className="">\|/</h1>
            <h1>Yami Bingo</h1>
          </div>
        </div>
        <div className="flex items-center">
          <div className="md:flex gap-4">
            <div className="text-center p-2 justify-center">
              <h1 className="text-white text-sm">{session?.user?.email}</h1>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="hover:underline bg-transparent hover:bg-red-500 text-slate-200 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar and Main Content */}
      <div className="flex flex-1 relative">
        {/* Toggle Button - Always visible on mobile, inside sidebar on desktop */}
        <div className="md:hidden fixed top-4 left-4 z-30">
          <button
            className="p-2 rounded-md bg-[#0e0e0e]"
            onClick={() => setOpen(!open)}
          >
            {open ? (
              <HiX size={26} className="cursor-pointer text-white" />
            ) : (
              <HiMenuAlt3 size={26} className="cursor-pointer text-white" />
            )}
          </button>
        </div>

        {/* Sidebar */}
        <div
          className={`bg-[#0e0e0e] min-h-full fixed md:static z-20 text-gray-100 px-4 transform transition-transform duration-300 md:transform-none ${
            open
              ? "translate-x-0 w-72"
              : "-translate-x-full w-0 md:w-0 overflow-hidden"
          }`}
        >
          {/* Toggle Button - Only for desktop, inside sidebar */}
          <div className="hidden md:block py-3 flex justify-end">
            <button
              className="p-2 rounded-md bg-transparent"
              onClick={() => setOpen(!open)}
            >
              {open ? (
                <HiX size={26} className="cursor-pointer text-gray-100" />
              ) : (
                <HiMenuAlt3
                  size={26}
                  className="cursor-pointer text-gray-100"
                />
              )}
            </button>
          </div>

          <div className="mt-16 md:mt-4 flex flex-col gap-4 relative">
            {open &&
              menus.map((menu, i) => (
                <Link
                  href={menu.link}
                  key={i}
                  className={`${
                    menu.margin && "mt-5"
                  } group flex items-center text-2xl gap-3.5 font-medium p-2 hover:bg-gray-800 rounded-md`}
                >
                  <div>{React.createElement(menu.icon, { size: "35" })}</div>
                  <h2 className="whitespace-pre">{menu.name}</h2>
                  <h2 className="absolute left-48 bg-white font-semibold whitespace-pre text-gray-900 rounded-md drop-shadow-lg px-0 py-0 w-0 overflow-hidden group-hover:px-2 group-hover:py-1 group-hover:left-14 group-hover:duration-300 group-hover:w-fit">
                    {menu.name}
                  </h2>
                </Link>
              ))}
          </div>
        </div>

        {/* Overlay for mobile when sidebar is open */}
        {open && isMobile && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 text-xl text-gray-900 font-semibold z-0 w-full">
          {children}
        </div>
      </div>

      <footer className="bg-[#181818] text-white p-4 flex justify-center items-center">
        <p>© 2024 ATS. All rights reserved.</p>
      </footer>
    </section>
  );
};

export default AdminLayout;

"use client";

import "../../globals.css";
import React, { useState, useEffect } from "react";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import { MdOutlineDashboard } from "react-icons/md";
import { SiAmazongames } from "react-icons/si";
import { CiDatabase } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";
import { FaWalking } from "react-icons/fa";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import axios from "axios";

const CashierLayout = ({ children }) => {
  const { data: session, status } = useSession();
  const [walletBalance, setWalletBalance] = useState(
    session?.user?.adminWalletBalance,
  );
  const [open, setOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const menus = [
    { name: "Home Dashboard", link: "/Cashier", icon: MdOutlineDashboard },
    { name: "Bingo Game", link: "/Game", icon: SiAmazongames },
    { name: "Floor Guys", link: "/Cashier/FloorGuys", icon: FaWalking },
    { name: "Game Datas", link: "/Cashier/GamesTable", icon: CiDatabase },
    { name: "Profile", link: "/Cashier/Profile", icon: CgProfile },
  ];

  const checkIfBlocked = async () => {
    try {
      const response = await axios.get(
        `/api/users/getUser?userId=${session.user.id}`,
      );
      if (response.data.isBlocked) {
        alert("You have been blocked.");
        await signOut({ callbackUrl: "/auth/login" });
      }
    } catch (error) {
      console.error("Error checking if cashier is blocked:", error);
    }
  };

  const fetchWalletBalance = async () => {
    if (!session?.user?.ownerId) return;

    try {
      const response = await axios.get(
        `/api/wallets/balance/${session.user.shopId}`,
      );
      if (response.data?.balance) {
        setWalletBalance(response.data.balance);
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  };

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

  useEffect(() => {
    if (status === "authenticated") {
      const intervalId = setInterval(checkIfBlocked, 30000);
      const balanceIntervalId = setInterval(fetchWalletBalance, 80000);

      return () => {
        clearInterval(intervalId);
        clearInterval(balanceIntervalId);
      };
    }
  }, [status, session]);

  // Same browser cannot stay logged in as Cashier + FloorGuy at once
  useEffect(() => {
    if (status !== "authenticated") return;
    if (session?.user?.role && session.user.role !== "Cashier") {
      alert(
        `This browser is now logged in as ${session.user.role}, not Cashier.\n\n` +
          "Use Incognito (or another browser) for FloorGuy.\n" +
          "Then login again here as Cashier.",
      );
      window.location.href = "/auth/login";
    }
  }, [status, session?.user?.role]);

  const goBingoGame = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      if (data?.user?.role !== "Cashier") {
        alert(
          "Bingo Game needs a Cashier login.\n\n" +
            "You opened FloorGuy in another tab of the SAME browser — that replaced the Cashier session.\n\n" +
            "Fix: open FloorGuy in Incognito (or Chrome + Edge), keep Cashier in this window.",
        );
        return;
      }
      window.location.href = "/Game";
    } catch {
      window.location.href = "/Game";
    }
  };

  if (status === "loading") return <p>Loading...</p>;
  if (status === "unauthenticated") return <p>Access Denied</p>;

  return (
    <section className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-[#181818] text-white p-1 flex justify-between items-center">
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
              <h1 className="text-white text-2xl font-bold">
                Balance ${walletBalance?.toFixed(2)}
              </h1>
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
                  onClick={
                    menu.name === "Bingo Game" ? goBingoGame : undefined
                  }
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

export default CashierLayout;

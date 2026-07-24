"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import { MdOutlineDashboard } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import { SiAmazongames } from "react-icons/si";

const menus = [
  { name: "Select Cards", link: "/FloorGuy", icon: SiAmazongames },
  { name: "Profile", link: "/FloorGuy/Profile", icon: CgProfile },
];

export default function FloorGuyLayout({ children }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setOpen(!mobile);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Loading…
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Access Denied
      </div>
    );
  }

  return (
    <section className="flex flex-col min-h-screen bg-slate-900 text-white">
      <header className="bg-[#181818] p-3 flex justify-between items-center border-b border-slate-700">
        <div className="font-bold text-orange-400">
          <div className="text-center leading-tight">
            <div>\|/</div>
            <div className="text-sm">Yami Bingo · Floor</div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="text-right hidden sm:block">
            <div className="text-slate-300">{session?.user?.email}</div>
            <div className="text-orange-400 font-semibold">
              {session?.user?.shopName || "No shop"}
            </div>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="px-3 py-1.5 border border-red-500 text-red-400 rounded hover:bg-red-500 hover:text-white"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1 relative">
        <div className="md:hidden fixed top-16 left-3 z-30">
          <button
            type="button"
            className="p-2 rounded-md bg-[#0e0e0e]"
            onClick={() => setOpen(!open)}
          >
            {open ? <HiX size={24} /> : <HiMenuAlt3 size={24} />}
          </button>
        </div>

        <aside
          className={`bg-[#0e0e0e] min-h-full fixed md:static z-20 px-3 py-4 transform transition-transform duration-300 ${
            open
              ? "translate-x-0 w-64"
              : "-translate-x-full w-0 md:w-0 overflow-hidden"
          }`}
        >
          <div className="hidden md:flex justify-end mb-2">
            <button type="button" onClick={() => setOpen(!open)} className="p-2">
              {open ? <HiX size={22} /> : <HiMenuAlt3 size={22} />}
            </button>
          </div>
          <nav className="mt-10 md:mt-2 flex flex-col gap-2">
            {open &&
              menus.map((menu) => {
                const active = pathname === menu.link;
                return (
                  <Link
                    key={menu.link}
                    href={menu.link}
                    onClick={() => isMobile && setOpen(false)}
                    className={`flex items-center gap-3 p-2 rounded-md text-base ${
                      active
                        ? "bg-orange-500/20 text-orange-400"
                        : "text-slate-200 hover:bg-slate-800"
                    }`}
                  >
                    {React.createElement(menu.icon, { size: 22 })}
                    <span>{menu.name}</span>
                  </Link>
                );
              })}
          </nav>
        </aside>

        {open && isMobile && (
          <div
            className="fixed inset-0 bg-black/50 z-10 md:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        <main className="flex-1 w-full min-w-0">{children}</main>
      </div>
    </section>
  );
}

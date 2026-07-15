import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const url = req.nextUrl.clone();
  const role = token?.role;

  // Redirect Agent role to /Agent
  if (role === "Agent" && !url.pathname.startsWith("/Agent")) {
    return NextResponse.redirect(new URL("/Agent", req.url));
  }

  // FloorGuy — select-only dashboard
  if (url.pathname.startsWith("/FloorGuy") && role !== "FloorGuy") {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (role === "FloorGuy" && !url.pathname.startsWith("/FloorGuy")) {
    return NextResponse.redirect(new URL("/FloorGuy", req.url));
  }

  if (url.pathname.startsWith("/Admin") && role !== "Admin") {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Restrict Cashier routes (including the /Game route)
  if (
    (url.pathname.startsWith("/Cashier") || url.pathname === "/Game") &&
    role !== "Cashier"
  ) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Modified SuperAdmin check to allow both SuperAdmin and Supervisor roles
  if (
    url.pathname.startsWith("/SuperAdmin") &&
    role !== "SuperAdmin" &&
    role !== "Supervisor"
  ) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

// Update matcher to include /Game and /FloorGuy routes
export const config = {
  matcher: [
    "/Admin/:path*",
    "/SuperAdmin/:path*",
    "/Cashier/:path*",
    "/FloorGuy/:path*",
    "/Game",
  ],
};

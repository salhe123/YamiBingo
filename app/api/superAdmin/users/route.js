import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";

export const GET = async () => {
  try {
    const users = await prisma.user.findMany();

    return NextResponse.json(users);
  } catch (err) {
    return NextResponse.json({ message: "Users GET Error" }, { status: 500 });
  }
};

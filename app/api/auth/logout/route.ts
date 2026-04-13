import { NextResponse } from "next/server";
import { buildLogoutCookie } from "@/lib/auth-server";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out" });

  const cookieConfig = buildLogoutCookie();
  response.cookies.set(cookieConfig.name, cookieConfig.value, cookieConfig.options);

  return response;
}

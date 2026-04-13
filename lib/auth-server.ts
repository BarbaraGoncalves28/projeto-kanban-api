import { cookies } from "next/headers";

const AUTH_COOKIE_NAME = "kanban_token";

export function getAuthTokenFromServerCookie() {
  const cookieStore = cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value;
}

export function buildAuthCookie(token: string) {
  return {
    name: AUTH_COOKIE_NAME,
    value: token,
    options: {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "strict" as const,
      secure: process.env.NODE_ENV === "production",
    },
  };
}

export function buildLogoutCookie() {
  return {
    name: AUTH_COOKIE_NAME,
    value: "",
    options: {
      httpOnly: true,
      path: "/",
      maxAge: 0,
      sameSite: "strict" as const,
      secure: process.env.NODE_ENV === "production",
    },
  };
}
const AUTH_COOKIE_NAME = "kanban_token";

export function getBrowserToken() {
  if (typeof document === "undefined") {
    return undefined;
  }

  try {
    const cookie = document.cookie
      .split("; ")
      .find((item) => item.startsWith(`${AUTH_COOKIE_NAME}=`));

    const token = cookie?.split("=")[1];
    
    if (token) {
      console.debug("[AUTH] Token found in cookie:", token.substring(0, 10) + "...");
    } else {
      console.debug("[AUTH] No token found in cookie");
    }
    
    return token;
  } catch (error) {
    console.error("[AUTH] Error reading token from cookie:", error);
    return undefined;
  }
}

export function setAuthToken(token: string | null) {
  if (typeof document === "undefined") {
    return;
  }

  try {
    if (token) {
      const maxAge = 60 * 60 * 24 * 30; // 30 days
      const secure = process.env.NODE_ENV === "production" ? "secure;" : "";
      document.cookie = `${AUTH_COOKIE_NAME}=${token}; path=/; max-age=${maxAge}; samesite=strict; ${secure}`;
      console.debug("[AUTH] Token set in cookie:", token.substring(0, 10) + "...");
    } else {
      document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; samesite=strict`;
      console.debug("[AUTH] Token cleared from cookie");
    }
  } catch (error) {
    console.error("[AUTH] Error setting token in cookie:", error);
  }
}

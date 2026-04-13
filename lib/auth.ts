const AUTH_COOKIE_NAME = "kanban_token";

export function getBrowserToken() {
  if (typeof document === "undefined") {
    return undefined;
  }

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${AUTH_COOKIE_NAME}=`));

  return cookie?.split("=")[1];
}

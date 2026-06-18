// Centralised config for talking to the nodeServer backend.
// Read once on the client; values come from NEXT_PUBLIC_* env vars so they're
// safe to bundle into client code.

const RAW_BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL?.trim() || "https://server.ilovedsa.com";

// Strip a single trailing slash so we can safely concatenate paths.
export const BACKEND_URL = RAW_BACKEND_URL.replace(/\/+$/, "");

// Socket.IO usually shares the same host as the REST API, but allow overriding
// in case the frontend talks to a separate WS gateway.
export const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL?.trim() || BACKEND_URL;

export const apiUrl = (path: string): string => {
  if (!path.startsWith("/")) path = "/" + path;
  return BACKEND_URL + path;
};

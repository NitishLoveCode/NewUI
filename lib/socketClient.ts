"use client";

// Single shared Socket.IO connection for the whole app.
// Multiple components/hooks can call getSocket() — they all share one TCP
// connection. Strict-mode safe: re-connects if disconnect was called.

import { io, type Socket } from "socket.io-client";
import { SOCKET_URL } from "./backendConfig";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (typeof window === "undefined") {
    // Should never be called on the server, but guard anyway.
    throw new Error("getSocket() must only be called in the browser");
  }
  if (socket && socket.connected) return socket;
  if (socket && !socket.disconnected) return socket;

  socket = io(SOCKET_URL, {
    autoConnect: true,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1_000,
    reconnectionDelayMax: 5_000,
    withCredentials: true,
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

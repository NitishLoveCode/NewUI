"use client";

// Lightweight hook around the shared Socket.IO singleton.
// Returns the live socket plus connection status. Most consumers should prefer
// `useCollabRoom` or `useWebRTC` for higher-level functionality.

import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import { getSocket } from "@/lib/socketClient";

export interface UseSocketResult {
  socket: Socket;
  isConnected: boolean;
  socketId: string | undefined;
}

export function useSocket(): UseSocketResult {
  const [socket] = useState<Socket>(() => getSocket());
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
  const [socketId, setSocketId] = useState<string | undefined>(socket.id);

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      setSocketId(socket.id);
    };
    const handleDisconnect = () => {
      setIsConnected(false);
      setSocketId(undefined);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    if (!socket.connected) socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [socket]);

  return { socket, isConnected, socketId };
}

'use client';

import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';

let socketInstance: Socket | null = null;

const getSocket = (): Socket => {
    if (socketInstance) return socketInstance;

    console.log('[useSocket] Initializing Socket.IO client ->', SOCKET_URL);

    socketInstance = io(SOCKET_URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling'],
    });
    socketInstance.on('connect', () => {
        console.log('[useSocket] ✓ Connected:', socketInstance?.id);
    });
    socketInstance.on('disconnect', (reason) => {
        console.log('[useSocket] ✗ Disconnected:', reason);
    });
    socketInstance.on('connect_error', (error) => {
        console.error('[useSocket] ✗ Connection error:', error.message);
    });

    return socketInstance;
};

export default function useSocket() {
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

        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);

        if (!socket.connected) socket.connect();

        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
        };
    }, [socket]);

    const disconnectSocket = () => {
        if (socketInstance) {
            console.log('[useSocket] Disconnecting...');
            socketInstance.disconnect();
            socketInstance = null;
        }
    };

    return {
        socket,
        isConnected,
        socketId,
        disconnectSocket,
    };
}

export type SocketEventMap = {
  'connected': { socketId: string };
  'user-joined': { roomId: string; socketId: string; userId?: string; username?: string; users: any[] };
  'user-left': { roomId: string; socketId: string; userId?: string; username?: string; users: any[] };
  'code-change': { roomId: string; socketId: string; userId?: string; code: string; language?: string; cursor?: any };
  'cursor-change': { roomId: string; socketId: string; userId?: string; cursor: any; selection?: any };
  'chat-message': { roomId: string; socketId: string; userId?: string; username?: string; message: string; timestamp: number };
  'offer': { target: string; roomId: string; sdp: string };
  'answer': { target: string; roomId: string; sdp: string };
  'ice-candidate': { target: string; roomId: string; candidate: any };
  'call-end': { target: string };
};










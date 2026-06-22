'use client';

import io, { Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';


const getSocket = (socket: Socket | null): Socket => {

    console.log('[useSocket] Initializing Socket.IO client...');
    console.log('[useSocket] Target URL:', SOCKET_URL);

    socket = io(SOCKET_URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling'],
        rejectUnauthorized: process.env.NODE_ENV === 'production' ? true : false,
    });
    socket.on('connect', () => {
        console.log('[useSocket] ✓ Connected successfully');
        console.log('[useSocket] Socket ID:', socket?.id);
    });
    socket.on('disconnect', (reason) => {
        console.log('[useSocket] ✗ Disconnected. Reason:', reason);
    });
    socket.on('connect_error', (error) => {
        console.error('[useSocket] ✗ Connection error:', error);
    });
    socket.on('error', (error) => {
        console.error('[useSocket] ✗ Socket error:', error);
    });

    return socket;
}



export default function useSocket() {
    let socket: Socket | null = null;
    if(!socket){
        socket = getSocket(socket);
    }

    const disconnectSocket = () => {
        if (socket) {
            console.log('[useSocket] Disconnecting...');
            socket.disconnect();
            socket = null;
        }
    }

    return {
        socket,
        disconnectSocket
    }
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










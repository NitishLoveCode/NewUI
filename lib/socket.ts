import io, { Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

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

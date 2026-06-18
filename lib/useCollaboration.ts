import { useEffect, useRef, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket, disconnectSocket } from './socket';
import { WebRTCHandler } from './webrtc';

export interface UseCollaborationOptions {
  roomId: string;
  userId?: string;
  username?: string;
  onCodeChange?: (data: any) => void;
  onCursorChange?: (data: any) => void;
  onChatMessage?: (data: any) => void;
  onUserJoined?: (data: any) => void;
  onUserLeft?: (data: any) => void;
  onRemoteStream?: (stream: MediaStream) => void;
  onConnectionError?: (error: string) => void;
}

export const useCollaboration = (options: UseCollaborationOptions) => {
  const socketRef = useRef<Socket | null>(null);
  const webrtcRef = useRef<WebRTCHandler | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [connected, setConnected] = useState(false);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    if (socket.connected) {
      handleSocketConnected();
    } else {
      socket.on('connect', handleSocketConnected);
    }

    return () => {
      // Keep socket alive for other instances
    };
  }, []);

  const handleSocketConnected = useCallback(() => {
    const socket = socketRef.current;
    if (!socket) return;

    console.log('[Collaboration] Socket connected, joining room:', options.roomId);

    // Emit join-room
    socket.emit('join-room', {
      roomId: options.roomId,
      userId: options.userId,
      username: options.username,
    }, (response: { ok: boolean; users: any[] }) => {
      console.log('[Collaboration] join-room response:', response);
      if (response.ok) {
        setConnected(true);
        setUsers(response.users || []);
        console.log('[Collaboration] ✓ Successfully joined room with', (response.users || []).length, 'users');
      } else {
        console.error('[Collaboration] ✗ Failed to join room');
      }
    });

    // Setup event listeners
    socket.on('connected', ({ socketId: sid }: { socketId: string }) => {
      console.log('[Collaboration] ✓ Connected event received, our socketId:', sid);
      setSocketId(sid);
    });

    socket.on('user-joined', (data: any) => {
      console.log('[Collaboration] user-joined:', data);
      setUsers(data.users || []);
      options.onUserJoined?.(data);
    });

    socket.on('user-left', (data: any) => {
      console.log('[Collaboration] user-left:', data);
      setUsers(data.users || []);
      options.onUserLeft?.(data);
    });

    socket.on('code-change', (data: any) => {
      console.log('[Collaboration] code-change received');
      options.onCodeChange?.(data);
    });

    socket.on('cursor-change', (data: any) => {
      console.log('[Collaboration] cursor-change received');
      options.onCursorChange?.(data);
    });

    socket.on('chat-message', (data: any) => {
      console.log('[Collaboration] chat-message received:', data.message);
      options.onChatMessage?.(data);
    });

    return () => {
      socket.off('connected');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('code-change');
      socket.off('cursor-change');
      socket.off('chat-message');
    };
  }, [options.roomId, options.userId, options.username]);

  // Get local media stream (optional - proceed without if not available)
  const getLocalStream = useCallback(async (): Promise<MediaStream | null> => {
    try {
      if (localStreamRef.current) {
        console.log('[Collaboration] Returning existing local stream with', localStreamRef.current.getTracks().length, 'tracks');
        return localStreamRef.current;
      }

      console.log('[Collaboration] Requesting user media (video + audio)...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      console.log('[Collaboration] ✓ Got local stream:', stream.getTracks().map(t => `${t.kind}:${t.label}`));
      localStreamRef.current = stream;
      return stream;
    } catch (err) {
      console.warn('[Collaboration] Video failed, trying audio only:', err);
      // If no device, try audio only
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('[Collaboration] ✓ Got audio-only stream');
        localStreamRef.current = audioStream;
        return audioStream;
      } catch {
        // No audio either - allow proceeding without media
        console.warn('[Collaboration] ✗ No media devices available, proceeding without audio/video');
        return null;
      }
    }
  }, []);

  // Initialize WebRTC
  const initializeWebRTC = useCallback(async (targetPeer?: string) => {
    try {
      console.log('[Collaboration] Initializing WebRTC, targetPeer:', targetPeer);
      const socket = socketRef.current;
      if (!socket) {
        throw new Error('Socket not available');
      }

      if (!webrtcRef.current) {
        console.log('[Collaboration] Creating WebRTCHandler...');
        const roomUserIds = users.map((u: any) => u.socketId);
        webrtcRef.current = new WebRTCHandler(
          socket,
          {
            onRemoteStream: (stream) => {
              console.log('[Collaboration] ✓ Received remote stream with', stream.getTracks().length, 'tracks');
              setRemoteStream(stream);
              options.onRemoteStream?.(stream);
            },
            onError: (err) => {
              console.error('[Collaboration] WebRTC error:', err);
              setError(err);
              options.onConnectionError?.(err);
            },
          },
          socketId || undefined,
          roomUserIds
        );

        if (localStreamRef.current) {
          console.log('[Collaboration] Initializing WebRTC with local stream');
          await webrtcRef.current.initialize(localStreamRef.current);
        } else {
          // Initialize without local stream
          console.warn('[Collaboration] No local stream, WebRTC will be audio-only or peer-broadcast only');
          await webrtcRef.current.initialize();
        }
      }

      if (targetPeer) {
        console.log('[Collaboration] Creating offer for peer:', targetPeer);
        await webrtcRef.current.createOffer(targetPeer, options.roomId);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initialize WebRTC';
      setError(message);
      console.error('[Collaboration] Error initializing WebRTC:', err);
    }
  }, [options.roomId, socketId, users]);

  // Send code changes
  const sendCodeChange = useCallback((code: string, language?: string, cursor?: any) => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.emit('code-change', {
      roomId: options.roomId,
      code,
      language,
      cursor,
    });
  }, [options.roomId]);

  // Send cursor position
  const sendCursorChange = useCallback((cursor: any, selection?: any) => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.emit('cursor-change', {
      roomId: options.roomId,
      cursor,
      selection,
    });
  }, [options.roomId]);

  // Send chat message
  const sendChatMessage = useCallback((message: string) => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.emit('chat-message', {
      roomId: options.roomId,
      message,
    });
  }, [options.roomId]);

  // End call
  const endCall = useCallback((targetPeer?: string) => {
    const socket = socketRef.current;
    if (!socket) return;

    if (targetPeer) {
      socket.emit('call-end', { target: targetPeer });
    }

    webrtcRef.current?.closeConnection();
    webrtcRef.current = null;
  }, []);

  // Cleanup
  const cleanup = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    webrtcRef.current?.closeConnection();

    const socket = socketRef.current;
    if (socket) {
      socket.emit('leave-room', { roomId: options.roomId });
    }
  }, [options.roomId]);

  // Leave room on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    connected,
    socketId,
    remoteStream,
    users,
    error,
    getLocalStream,
    initializeWebRTC,
    sendCodeChange,
    sendCursorChange,
    sendChatMessage,
    endCall,
    cleanup,
  };
};

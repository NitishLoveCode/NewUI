"use client";

// High-level hook for joining a collaborative coding room.
// Wraps the Socket.IO `join-room` / `code-change` / `chat-message` events
// that the nodeServer backend exposes.

import { useCallback, useEffect, useRef, useState } from "react";
import { useSocket } from "./useSocket";
import type {
  ChatMessageEvent,
  CodeChangeEvent,
  CursorChangeEvent,
  JoinRoomAck,
  RoomUser,
  UserJoinedEvent,
  UserLeftEvent,
} from "@/types/collab";

export interface UseCollabRoomOptions {
  roomId: string | null | undefined;
  userId?: string;
  username?: string;

  // Fired when a remote peer's code-change reaches us. Use this to update
  // your editor without echoing the change back.
  onRemoteCodeChange?: (event: CodeChangeEvent) => void;
  onRemoteCursorChange?: (event: CursorChangeEvent) => void;
  onChatMessage?: (event: ChatMessageEvent) => void;
  onUserJoined?: (event: UserJoinedEvent) => void;
  onUserLeft?: (event: UserLeftEvent) => void;
}

export interface UseCollabRoomResult {
  isConnected: boolean;
  isJoined: boolean;
  socketId: string | undefined;
  users: RoomUser[];

  // Broadcast the current editor contents to peers.
  sendCodeChange: (payload: {
    code: string;
    language?: string;
    cursor?: unknown;
    version?: number;
  }) => void;

  sendCursorChange: (payload: { cursor?: unknown; selection?: unknown }) => void;
  sendChatMessage: (message: string) => void;
  leaveRoom: () => void;
}

export function useCollabRoom(opts: UseCollabRoomOptions): UseCollabRoomResult {
  const {
    roomId,
    userId,
    username,
    onRemoteCodeChange,
    onRemoteCursorChange,
    onChatMessage,
    onUserJoined,
    onUserLeft,
  } = opts;

  const { socket, isConnected, socketId } = useSocket();
  const [users, setUsers] = useState<RoomUser[]>([]);
  const [isJoined, setIsJoined] = useState(false);

  // Hold latest callbacks in refs so we don't tear down listeners on every
  // parent render that recreates inline arrow functions.
  const cbRef = useRef({
    onRemoteCodeChange,
    onRemoteCursorChange,
    onChatMessage,
    onUserJoined,
    onUserLeft,
  });
  useEffect(() => {
    cbRef.current = {
      onRemoteCodeChange,
      onRemoteCursorChange,
      onChatMessage,
      onUserJoined,
      onUserLeft,
    };
  });

  // Join / leave lifecycle
  useEffect(() => {
    if (!roomId || !isConnected) return;

    socket.emit(
      "join-room",
      { roomId, userId, username },
      (ack: JoinRoomAck) => {
        if (ack && ack.ok) {
          setIsJoined(true);
          setUsers(ack.users ?? []);
        } else {
          setIsJoined(false);
        }
      }
    );

    return () => {
      socket.emit("leave-room", { roomId });
      setIsJoined(false);
      setUsers([]);
    };
  }, [roomId, userId, username, isConnected, socket]);

  // Wire up event listeners once per socket
  useEffect(() => {
    const handleUserJoined = (event: UserJoinedEvent) => {
      if (event.users) setUsers(event.users);
      cbRef.current.onUserJoined?.(event);
    };
    const handleUserLeft = (event: UserLeftEvent) => {
      if (event.users) setUsers(event.users);
      cbRef.current.onUserLeft?.(event);
    };
    const handleCodeChange = (event: CodeChangeEvent) => {
      cbRef.current.onRemoteCodeChange?.(event);
    };
    const handleCursorChange = (event: CursorChangeEvent) => {
      cbRef.current.onRemoteCursorChange?.(event);
    };
    const handleChat = (event: ChatMessageEvent) => {
      cbRef.current.onChatMessage?.(event);
    };

    socket.on("user-joined", handleUserJoined);
    socket.on("user-left", handleUserLeft);
    socket.on("code-change", handleCodeChange);
    socket.on("cursor-change", handleCursorChange);
    socket.on("chat-message", handleChat);

    return () => {
      socket.off("user-joined", handleUserJoined);
      socket.off("user-left", handleUserLeft);
      socket.off("code-change", handleCodeChange);
      socket.off("cursor-change", handleCursorChange);
      socket.off("chat-message", handleChat);
    };
  }, [socket]);

  const sendCodeChange = useCallback<UseCollabRoomResult["sendCodeChange"]>(
    (payload) => {
      if (!roomId || !isJoined) return;
      socket.emit("code-change", { roomId, ...payload });
    },
    [roomId, isJoined, socket]
  );

  const sendCursorChange = useCallback<UseCollabRoomResult["sendCursorChange"]>(
    (payload) => {
      if (!roomId || !isJoined) return;
      socket.emit("cursor-change", { roomId, ...payload });
    },
    [roomId, isJoined, socket]
  );

  const sendChatMessage = useCallback(
    (message: string) => {
      if (!roomId || !isJoined || !message) return;
      socket.emit("chat-message", { roomId, message });
    },
    [roomId, isJoined, socket]
  );

  const leaveRoom = useCallback(() => {
    if (!roomId) return;
    socket.emit("leave-room", { roomId });
    setIsJoined(false);
    setUsers([]);
  }, [roomId, socket]);

  return {
    isConnected,
    isJoined,
    socketId,
    users,
    sendCodeChange,
    sendCursorChange,
    sendChatMessage,
    leaveRoom,
  };
}

"use client";

// Lightweight 1:1 video call page. Joins a Socket.IO room (using the call id),
// then either auto-calls the first peer or waits to receive a call.
// Open in two browsers at /call/<same-id> to test.

import { use, useEffect, useRef, useState } from "react";
import { useCollabRoom } from "@/hooks/useCollabRoom";
import { useWebRTC } from "@/hooks/useWebRTC";

export default function CallPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: roomId } = use(params);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string>("");

  const { isConnected, isJoined, socketId, users } = useCollabRoom({
    roomId,
    username: "Caller",
  });

  const {
    callState,
    localStream,
    remoteStream,
    startLocalMedia,
    startCall,
    endCall,
  } = useWebRTC({ roomId });

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const peer = users.find((u) => u.socketId !== socketId);

  const handleStart = async () => {
    setError("");
    try {
      await startLocalMedia({ video: true, audio: true });
      if (peer) await startCall(peer.socketId);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="flex h-screen flex-col gap-3 bg-zinc-950 p-4 text-zinc-100">
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium">Call: {roomId}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${
            isConnected ? "bg-emerald-700" : "bg-red-700"
          }`}
        >
          {isConnected ? "ws connected" : "ws disconnected"}
        </span>
        <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs">
          room: {isJoined ? "joined" : "—"} · users: {users.length}
        </span>
        <span className="ml-auto text-xs text-zinc-400">state: {callState}</span>

        {callState === "idle" ? (
          <button
            onClick={handleStart}
            disabled={!peer}
            className="rounded bg-emerald-600 px-3 py-1 text-sm font-medium text-white disabled:opacity-50"
            title={peer ? `Call ${peer.username}` : "Waiting for peer to join…"}
          >
            Start call
          </button>
        ) : (
          <button
            onClick={endCall}
            className="rounded bg-red-600 px-3 py-1 text-sm font-medium text-white"
          >
            End
          </button>
        )}
      </div>

      {error && <div className="rounded bg-red-900/40 p-2 text-sm">{error}</div>}

      <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-md border border-zinc-800 bg-black">
          <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-contain" />
          <span className="absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5 text-xs">
            Remote
          </span>
        </div>
        <div className="relative overflow-hidden rounded-md border border-zinc-800 bg-black">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-contain"
          />
          <span className="absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5 text-xs">
            You
          </span>
        </div>
      </div>
    </div>
  );
}

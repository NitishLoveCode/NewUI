"use client";

// Reference example showing how to compose:
//   - useRunCodeMutation  (REST, RTK Query)
//   - useCollabRoom       (Socket.IO collaboration)
//   - useWebRTC           (peer-to-peer video)
//
// Drop this into any client page to verify the backend is wired correctly:
//   import CollabPlaygroundExample from "@/components/collab/CollabPlaygroundExample";
//   <CollabPlaygroundExample roomId="demo-room" />

import { useEffect, useRef, useState } from "react";
import { useRunCodeMutation } from "@/stores/api";
import { useCollabRoom } from "@/hooks/useCollabRoom";
import { useWebRTC } from "@/hooks/useWebRTC";

interface Props {
  roomId: string;
  username?: string;
}

type RunCodeResponse = {
  status: string;
  time: string;
  memory: string;
  error?: string;
  output?: string;
};

export default function CollabPlaygroundExample({ roomId, username = "Anon" }: Props) {
  const [code, setCode] = useState<string>('print("Hello from collab")');
  const [language, setLanguage] = useState<string>("python");
  const [chatInput, setChatInput] = useState("");
  const [chat, setChat] = useState<{ user: string; msg: string }[]>([]);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  // ----- 1. REST: run code through Piston -----
  const [runCode, { data: runResult, isLoading: isRunning, error: runError }] =
    useRunCodeMutation();

  // ----- 2. Socket.IO collaboration -----
  const { isConnected, isJoined, users, sendCodeChange, sendChatMessage } = useCollabRoom({
    roomId,
    username,
    onRemoteCodeChange: (event) => {
      // Apply remote edit without echoing
      setCode(event.code);
      if (event.language) setLanguage(event.language);
    },
    onChatMessage: (event) => {
      setChat((prev) => [...prev, { user: event.username ?? "?", msg: event.message }]);
    },
  });

  // ----- 3. WebRTC video call -----
  const { localStream, remoteStream, callState, startCall, endCall, startLocalMedia } =
    useWebRTC({ roomId });

  // Bind streams to <video> elements
  useEffect(() => {
    if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream;
  }, [localStream]);
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) remoteVideoRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  const handleEditorChange = (next: string) => {
    setCode(next);
    sendCodeChange({ code: next, language });
  };

  const handleRun = () => {
    runCode({ language, code });
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    sendChatMessage(chatInput);
    setChat((prev) => [...prev, { user: "me", msg: chatInput }]);
    setChatInput("");
  };

  // Pick another user in the room and call them
  const callablePeer = users.find((u) => u.socketId);
  const handleStartCall = async () => {
    await startLocalMedia();
    if (callablePeer) await startCall(callablePeer.socketId);
  };

  return (
    <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-3">
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded border px-2 py-1"
          >
            <option value="python">python</option>
            <option value="javascript">javascript</option>
            <option value="typescript">typescript</option>
            <option value="cpp">cpp</option>
            <option value="java">java</option>
            <option value="go">go</option>
            <option value="rust">rust</option>
          </select>
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="rounded bg-emerald-600 px-3 py-1 text-white disabled:opacity-50"
          >
            {isRunning ? "Running..." : "Run"}
          </button>
          <span className="text-xs text-zinc-500">
            ws: {isConnected ? "connected" : "disconnected"} · room:{" "}
            {isJoined ? "joined" : "—"} · users: {users.length}
          </span>

        </div>

        <textarea
          value={code}
          onChange={(e) => handleEditorChange(e.target.value)}
          rows={14}
          className="w-full rounded border bg-zinc-950 p-3 font-mono text-sm text-zinc-100"
          spellCheck={false}
        />

        <div className="rounded border bg-zinc-900 p-3 font-mono text-sm text-zinc-100">

          {Boolean(runError) && (
            <pre className="text-red-400">{typeof runError === 'string' ? runError : JSON.stringify(runError, null, 2)}</pre>
          )}
          {runResult && (
            <>
              <div className="mb-1 text-xs text-zinc-400">
                status: {runResult.status} · time: {runResult.time} · memory:{" "}
                {runResult.memory}
              </div>
              {runResult.error ? (
                <pre className="text-red-400">{runResult.error}</pre>
              ) : (
                <pre>{runResult.output}</pre>
              )}
            </>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded border p-2">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Video</span>
            {callState === "in-call" || callState === "calling" ? (
              <button
                onClick={endCall}
                className="rounded bg-red-600 px-2 py-1 text-xs text-white"
              >
                End
              </button>
            ) : (
              <button
                onClick={handleStartCall}
                disabled={!callablePeer}
                className="rounded bg-blue-600 px-2 py-1 text-xs text-white disabled:opacity-50"
              >
                Call peer
              </button>
            )}
          </div>
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full rounded bg-black" />
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="mt-2 w-32 rounded bg-black"
          />
        </div>

        <div className="rounded border p-2">
          <div className="mb-2 text-sm font-medium">Chat</div>
          <div className="h-40 overflow-y-auto text-sm">
            {chat.map((c, i) => (
              <div key={i}>
                <b>{c.user}:</b> {c.msg}
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-1">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
              className="flex-1 rounded border px-2 py-1 text-sm"
              placeholder="Say something..."
            />
            <button
              onClick={handleSendChat}
              className="rounded bg-zinc-700 px-2 py-1 text-xs text-white"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

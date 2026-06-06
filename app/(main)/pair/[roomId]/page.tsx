"use client";

// Real-time pair-programming room.
// Wires together useCollabRoom (Socket.IO), useRunCodeMutation (REST), and
// useWebRTC (peer-to-peer video) against the EC2 nodeServer backend.
//
// Open this page in two browsers/incognito tabs at the same /pair/<roomId>
// URL — both should see each other in the user list, code edits sync live,
// and either side can start the video call.

import { use, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useCollabRoom } from "@/hooks/useCollabRoom";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useRunCodeMutation } from "@/stores/api";
import type { ChatMessageEvent } from "@/types/collab";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const LANGUAGES = [
  { id: "python", monaco: "python", sample: 'print("Hello from collab")' },
  { id: "javascript", monaco: "javascript", sample: 'console.log("Hello from collab")' },
  { id: "java", monaco: "java", sample: "class Main { public static void main(String[] a){ System.out.println(\"Hi\"); } }" },
  { id: "cpp", monaco: "cpp", sample: '#include <iostream>\nint main(){ std::cout << "Hi"; }' },
] as const;

type LangId = (typeof LANGUAGES)[number]["id"];

interface ChatBubble {
  id: string;
  user: string;
  msg: string;
  me: boolean;
  ts: number;
}

export default function PairRoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  // Next 16: params is a Promise; unwrap with React.use in client components.
  const { roomId } = use(params);

  const [language, setLanguage] = useState<LangId>("python");
  const [code, setCode] = useState<string>(LANGUAGES[0].sample);
  const [chatInput, setChatInput] = useState("");
  const [chat, setChat] = useState<ChatBubble[]>([]);
  const [output, setOutput] = useState<string>("");
  const [outputMeta, setOutputMeta] = useState<string>("");

  // Persist a stable username per browser tab (so the second tab is "obvious").
  const username = useMemo(() => {
    if (typeof window === "undefined") return "Anon";
    const k = "pair-username";
    let v = window.sessionStorage.getItem(k);
    if (!v) {
      v = "User-" + Math.random().toString(36).slice(2, 6);
      window.sessionStorage.setItem(k, v);
    }
    return v;
  }, []);

  // ─── REST: run code ─────────────────────────────────────────────
  const [runCodeRequest, { isLoading: isRunning }] = useRunCodeMutation();

  // ─── Socket.IO: room collab ─────────────────────────────────────
  // Suppress echoes from our own outgoing edits.
  const lastSentCodeRef = useRef<string>("");
  const {
    isConnected,
    isJoined,
    socketId,
    users,
    sendCodeChange,
    sendChatMessage,
  } = useCollabRoom({
    roomId,
    username,
    onRemoteCodeChange: (event) => {
      // Only update if the remote diverged from what we last sent.
      if (event.code !== lastSentCodeRef.current) {
        setCode(event.code);
      }
      if (event.language && event.language !== language) {
        setLanguage(event.language as LangId);
      }
    },
    onChatMessage: (event: ChatMessageEvent) => {
      setChat((prev) => [
        ...prev,
        {
          id: `${event.timestamp}-${event.socketId}`,
          user: event.username ?? event.socketId.slice(0, 4),
          msg: event.message,
          me: event.socketId === socketId,
          ts: event.timestamp,
        },
      ]);
    },
  });

  // ─── WebRTC: 1:1 video ──────────────────────────────────────────
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
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

  // ─── Editor handlers ────────────────────────────────────────────
  const handleEditorChange = (next: string | undefined) => {
    const v = next ?? "";
    setCode(v);
    lastSentCodeRef.current = v;
    sendCodeChange({ code: v, language });
  };

  const handleLanguageChange = (next: LangId) => {
    setLanguage(next);
    const sample = LANGUAGES.find((l) => l.id === next)!.sample;
    setCode(sample);
    lastSentCodeRef.current = sample;
    sendCodeChange({ code: sample, language: next });
  };

  const handleRun = async () => {
    setOutput("Running...");
    setOutputMeta("");
    try {
      const data = await runCodeRequest({ language, code }).unwrap();
      setOutputMeta(
        `status: ${data.status} · time: ${data.time} · memory: ${data.memory}`
      );
      setOutput(data.error ? data.error : data.output || "(no output)");
    } catch (err) {
      const msg =
        (err as { data?: { error?: string } })?.data?.error ??
        (err instanceof Error ? err.message : "Network error");
      setOutput(`Error: ${msg}`);
      setOutputMeta("");
    }
  };

  const handleSendChat = () => {
    const msg = chatInput.trim();
    if (!msg) return;
    sendChatMessage(msg);
    setChatInput("");
  };

  // Pick the first peer that isn't us.
  const callablePeer = users.find((u) => u.socketId !== socketId);
  const handleStartCall = async () => {
    try {
      await startLocalMedia({ video: true, audio: true });
      if (callablePeer) await startCall(callablePeer.socketId);
    } catch (err) {
      console.error("Failed to start call", err);
      setOutput(
        `Camera/mic error: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  };

  // ─── UI ─────────────────────────────────────────────────────────
  return (
    <div className="grid h-screen grid-cols-1 gap-3 bg-zinc-950 p-3 text-zinc-100 lg:grid-cols-[1fr_360px]">
      <div className="flex flex-col gap-3 overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2">
          <span className="text-sm font-medium">Room: {roomId}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs ${
              isConnected ? "bg-emerald-700" : "bg-red-700"
            }`}
          >
            ws: {isConnected ? "connected" : "disconnected"}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs ${
              isJoined ? "bg-emerald-700" : "bg-zinc-700"
            }`}
          >
            room: {isJoined ? "joined" : "—"}
          </span>
          <span className="text-xs text-zinc-400">
            users: {users.length} · me: {username}
          </span>

          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as LangId)}
            className="ml-auto rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm"
          >
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.id}
              </option>
            ))}
          </select>
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="rounded bg-emerald-600 px-3 py-1 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {isRunning ? "Running…" : "Run"}
          </button>
        </div>

        {/* Editor + Output */}
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <div className="flex-1 overflow-hidden rounded-md border border-zinc-800">
            <Editor
              language={LANGUAGES.find((l) => l.id === language)!.monaco}
              value={code}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                tabSize: 2,
                automaticLayout: true,
              }}
            />
          </div>

          <div className="h-40 overflow-auto rounded-md border border-zinc-800 bg-black p-3 font-mono text-sm">
            {outputMeta && (
              <div className="mb-1 text-xs text-zinc-500">{outputMeta}</div>
            )}
            <pre className="whitespace-pre-wrap text-zinc-200">
              {output || "Click Run to execute…"}
            </pre>
          </div>
        </div>
      </div>

      {/* Right column: video + chat */}
      <div className="flex flex-col gap-3 overflow-hidden">
        <div className="rounded-md border border-zinc-800 bg-zinc-900 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Video</span>
            {callState === "in-call" || callState === "calling" ? (
              <button
                onClick={endCall}
                className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white"
              >
                End ({callState})
              </button>
            ) : (
              <button
                onClick={handleStartCall}
                disabled={!callablePeer}
                className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white disabled:opacity-50"
                title={callablePeer ? `Call ${callablePeer.username}` : "No peer in room"}
              >
                Call peer
              </button>
            )}
          </div>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="aspect-video w-full rounded bg-black"
          />
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="mt-2 h-24 w-full rounded bg-black object-cover"
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col rounded-md border border-zinc-800 bg-zinc-900">
          <div className="border-b border-zinc-800 px-3 py-2 text-sm font-medium">
            Chat
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto px-3 py-2 text-sm">
            {chat.length === 0 && (
              <div className="text-xs text-zinc-500">No messages yet.</div>
            )}
            {chat.map((c) => (
              <div
                key={c.id}
                className={`rounded px-2 py-1 ${
                  c.me ? "ml-6 bg-emerald-700/30" : "mr-6 bg-zinc-800"
                }`}
              >
                <div className="text-[10px] uppercase tracking-wide text-zinc-400">
                  {c.user}
                </div>
                <div className="text-zinc-100">{c.msg}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-1 border-t border-zinc-800 p-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
              placeholder="Say something..."
              className="flex-1 rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm"
            />
            <button
              onClick={handleSendChat}
              className="rounded bg-emerald-600 px-3 py-1 text-sm font-medium text-white"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Types shared between the Next.js frontend and the nodeServer backend.
// Mirror of the shape returned by `POST /api/run-code`.

export type RunCodeStatus = "success" | "error" | "compile_error";

export interface RunCodeRequest {
  language: string;
  code: string;
  stdin?: string;
  version?: string;
  args?: string[];
}

export interface RunCodeResponse {
  output: string;
  time: string;        // e.g. "0.12s" or "N/A"
  memory: string;      // e.g. "20MB"  or "N/A"
  cpu_usage: string;   // currently always "N/A"
  status: RunCodeStatus;
  error: string | null;
}

export interface PistonRuntime {
  language: string;
  version: string;
  aliases: string[];
  runtime?: string;
}

export interface RuntimesResponse {
  status: "success";
  runtimes: PistonRuntime[];
}

// ---------- Socket.IO event payloads ----------

export interface RoomUser {
  socketId: string;
  userId: string;
  username: string;
}

export interface JoinRoomPayload {
  roomId: string;
  userId?: string;
  username?: string;
}

export interface JoinRoomAck {
  ok?: boolean;
  error?: string;
  roomId?: string;
  socketId?: string;
  users?: RoomUser[];
}

export interface UserJoinedEvent {
  roomId: string;
  socketId: string;
  userId: string;
  username: string;
  users: RoomUser[];
}

export interface UserLeftEvent extends UserJoinedEvent {}

export interface CodeChangeEvent {
  roomId: string;
  socketId: string;
  userId?: string;
  code: string;
  language?: string;
  cursor?: unknown;
  version?: number;
  timestamp: number;
}

export interface CursorChangeEvent {
  roomId: string;
  socketId: string;
  userId?: string;
  cursor?: unknown;
  selection?: unknown;
}

export interface ChatMessageEvent {
  roomId: string;
  socketId: string;
  userId?: string;
  username?: string;
  message: string;
  timestamp: number;
}

// ---------- WebRTC signaling payloads ----------

export interface RTCOfferEvent {
  from: string;
  roomId?: string;
  sdp: RTCSessionDescriptionInit;
}

export interface RTCAnswerEvent {
  from: string;
  roomId?: string;
  sdp: RTCSessionDescriptionInit;
}

export interface RTCIceCandidateEvent {
  from: string;
  roomId?: string;
  candidate: RTCIceCandidateInit;
}

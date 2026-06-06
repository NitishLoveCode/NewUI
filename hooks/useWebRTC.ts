"use client";

// 1-to-1 video calling helper. The backend acts purely as a signaling relay
// (offer / answer / ice-candidate). The peer connection itself runs in the
// browser.
//
// Typical flow (Caller A, Callee B both joined the same room):
//   1. A calls `startCall(B.socketId)` — creates offer, sends via socket.
//   2. B receives `offer`, this hook auto-creates an answer, sends it back.
//   3. ICE candidates trickle in both directions.
//   4. Either side calls `endCall()`.

import { useCallback, useEffect, useRef, useState } from "react";
import { useSocket } from "./useSocket";
import type {
  RTCAnswerEvent,
  RTCIceCandidateEvent,
  RTCOfferEvent,
} from "@/types/collab";

const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

export interface UseWebRTCOptions {
  roomId?: string | null;
  iceServers?: RTCIceServer[];
  // Called whenever the remote peer's MediaStream changes.
  onRemoteStream?: (stream: MediaStream | null) => void;
  // Called when the call ends (either side).
  onCallEnded?: () => void;
}

export type CallState = "idle" | "calling" | "in-call";

export interface UseWebRTCResult {
  callState: CallState;
  remoteStream: MediaStream | null;
  localStream: MediaStream | null;
  remotePeerId: string | null;

  startLocalMedia: (constraints?: MediaStreamConstraints) => Promise<MediaStream>;
  stopLocalMedia: () => void;
  startCall: (targetSocketId: string) => Promise<void>;
  endCall: () => void;
}

export function useWebRTC(opts: UseWebRTCOptions = {}): UseWebRTCResult {
  const { roomId, iceServers = DEFAULT_ICE_SERVERS, onRemoteStream, onCallEnded } = opts;
  const { socket } = useSocket();

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  const [callState, setCallState] = useState<CallState>("idle");
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remotePeerId, setRemotePeerId] = useState<string | null>(null);

  // Hold latest callback refs (same reasoning as useCollabRoom)
  const cbRef = useRef({ onRemoteStream, onCallEnded });
  useEffect(() => {
    cbRef.current = { onRemoteStream, onCallEnded };
  });

  const cleanupPeer = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.onicecandidate = null;
      pcRef.current.ontrack = null;
      pcRef.current.onconnectionstatechange = null;
      try {
        pcRef.current.close();
      } catch {
        /* noop */
      }
      pcRef.current = null;
    }
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    remoteStreamRef.current = null;
    setRemoteStream(null);
    setRemotePeerId(null);
    setCallState("idle");
    pendingCandidatesRef.current = [];
    cbRef.current.onRemoteStream?.(null);
  }, []);

  const startLocalMedia = useCallback<UseWebRTCResult["startLocalMedia"]>(
    async (constraints = { video: true, audio: true }) => {
      if (localStreamRef.current) return localStreamRef.current;
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    },
    []
  );

  const stopLocalMedia = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }
  }, []);

  // Build a fresh peer connection wired up with track + ICE handlers
  const buildPeer = useCallback(
    (peerId: string): RTCPeerConnection => {
      const pc = new RTCPeerConnection({ iceServers });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            target: peerId,
            roomId: roomId ?? undefined,
            candidate: event.candidate.toJSON(),
          });
        }
      };

      pc.ontrack = (event) => {
        let stream = remoteStreamRef.current;
        if (!stream) {
          stream = new MediaStream();
          remoteStreamRef.current = stream;
        }
        event.streams[0]?.getTracks().forEach((t) => stream!.addTrack(t));
        if (event.streams[0]) {
          remoteStreamRef.current = event.streams[0];
        }
        setRemoteStream(remoteStreamRef.current);
        cbRef.current.onRemoteStream?.(remoteStreamRef.current);
      };

      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        if (state === "connected") setCallState("in-call");
        if (state === "failed" || state === "closed" || state === "disconnected") {
          cleanupPeer();
          cbRef.current.onCallEnded?.();
        }
      };

      // Add local tracks if we already have a stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current!);
        });
      }
      return pc;
    },
    [iceServers, roomId, socket, cleanupPeer]
  );

  const drainPendingCandidates = useCallback(async () => {
    if (!pcRef.current) return;
    for (const c of pendingCandidatesRef.current) {
      try {
        await pcRef.current.addIceCandidate(c);
      } catch {
        /* ignore — peer may have closed */
      }
    }
    pendingCandidatesRef.current = [];
  }, []);

  const startCall = useCallback<UseWebRTCResult["startCall"]>(
    async (targetSocketId) => {
      if (!targetSocketId) return;
      await startLocalMedia();
      cleanupPeer();
      const pc = buildPeer(targetSocketId);
      pcRef.current = pc;
      setRemotePeerId(targetSocketId);
      setCallState("calling");

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("offer", {
        target: targetSocketId,
        roomId: roomId ?? undefined,
        sdp: offer,
      });
    },
    [buildPeer, cleanupPeer, roomId, socket, startLocalMedia]
  );

  const endCall = useCallback(() => {
    if (remotePeerId) {
      socket.emit("call-end", { target: remotePeerId });
    }
    cleanupPeer();
    cbRef.current.onCallEnded?.();
  }, [remotePeerId, socket, cleanupPeer]);

  // Wire up incoming signaling events
  useEffect(() => {
    const handleOffer = async (event: RTCOfferEvent) => {
      try {
        await startLocalMedia();
        cleanupPeer();
        const pc = buildPeer(event.from);
        pcRef.current = pc;
        setRemotePeerId(event.from);
        setCallState("calling");

        await pc.setRemoteDescription(event.sdp);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await drainPendingCandidates();

        socket.emit("answer", {
          target: event.from,
          roomId: roomId ?? undefined,
          sdp: answer,
        });
      } catch (err) {
        console.error("WebRTC: failed to handle offer", err);
        cleanupPeer();
      }
    };

    const handleAnswer = async (event: RTCAnswerEvent) => {
      if (!pcRef.current) return;
      try {
        await pcRef.current.setRemoteDescription(event.sdp);
        await drainPendingCandidates();
      } catch (err) {
        console.error("WebRTC: failed to handle answer", err);
      }
    };

    const handleIce = async (event: RTCIceCandidateEvent) => {
      if (!pcRef.current || !pcRef.current.remoteDescription) {
        pendingCandidatesRef.current.push(event.candidate);
        return;
      }
      try {
        await pcRef.current.addIceCandidate(event.candidate);
      } catch (err) {
        console.warn("WebRTC: failed to add ICE candidate", err);
      }
    };

    const handleCallEnd = () => {
      cleanupPeer();
      cbRef.current.onCallEnded?.();
    };

    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIce);
    socket.on("call-end", handleCallEnd);

    return () => {
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIce);
      socket.off("call-end", handleCallEnd);
    };
  }, [socket, roomId, buildPeer, cleanupPeer, drainPendingCandidates, startLocalMedia]);

  // Tear everything down on unmount
  useEffect(() => {
    return () => {
      cleanupPeer();
      stopLocalMedia();
    };
  }, [cleanupPeer, stopLocalMedia]);

  return {
    callState,
    remoteStream,
    localStream,
    remotePeerId,
    startLocalMedia,
    stopLocalMedia,
    startCall,
    endCall,
  };
}

'use client';

/**
 * useWebRTC — Omegle-style 1-to-1 anonymous matching client hook.
 *
 * Mirrors the server in `nodeServer/src/sockets/matchHandler.js`:
 *   client → server : join_queue | skip | leave_queue
 *                     webrtc_offer | webrtc_answer | webrtc_ice_candidate
 *   server → client : queued | matched | partner_disconnected
 *                     webrtc_offer | webrtc_answer | webrtc_ice_candidate
 *
 * Responsibilities:
 *   - Acquire local camera/mic
 *   - Build / tear down RTCPeerConnection on each match
 *   - Relay SDP + ICE through the socket
 *   - Expose simple controls: joinQueue, skip, leave, toggleMic, toggleCamera
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import useSocket from './useSocket';

const ICE_SERVERS: RTCConfiguration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        // Add a TURN server here for production / strict-NAT clients.
    ],
};

export type MatchStatus =
    | 'idle'           // not in queue, not paired
    | 'queued'         // waiting for a partner
    | 'matched'        // paired, negotiating / streaming
    | 'partner_left';  // partner just disconnected or skipped

export type PartnerLeftReason = 'left' | 'skipped';

type MatchedPayload = { roomId: string; partnerId: string; isInitiator: boolean };
type OfferPayload = { roomId: string; from: string; sdp: RTCSessionDescriptionInit };
type AnswerPayload = { roomId: string; from: string; sdp: RTCSessionDescriptionInit };
type IcePayload = { roomId: string; from: string; candidate: RTCIceCandidateInit };
type PartnerDisconnectedPayload = { roomId: string; reason: PartnerLeftReason };
type ChatMessagePayload = { roomId: string; from: string; message: string; timestamp: number };

export type ChatMessage = {
    id: string;
    from: 'me' | 'partner';
    text: string;
    timestamp: number;
};

/**
 * Any JSON-serialisable payload sent over the WebRTC data channel for
 * live collaboration (code sync, cursors, language, etc). The shape is owned
 * by the consumer — the hook only relays it.
 */
export type CollabMessage = Record<string, unknown>;

export default function useWebRTC() {
    const { socket, isConnected, socketId } = useSocket();

    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

    const pcRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    // Dedupes concurrent startLocalStream() calls (handleMatched + handleOffer
    // can both request media at once) so we never open getUserMedia twice.
    const startPromiseRef = useRef<Promise<MediaStream | null> | null>(null);
    const roomIdRef = useRef<string | null>(null);
    // ICE candidates can arrive before setRemoteDescription resolves — buffer them.
    const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

    // ---- Live collaboration data channel ----
    // A single ordered RTCDataChannel carries code edits + cursor updates
    // directly peer-to-peer (no socket round-trip). Consumers subscribe via
    // `onCollab` and publish via `sendCollab`.
    const dataChannelRef = useRef<RTCDataChannel | null>(null);
    const collabHandlersRef = useRef<Set<(msg: CollabMessage) => void>>(new Set());
    const [collabReady, setCollabReady] = useState(false);

    const [status, setStatus] = useState<MatchStatus>('idle');
    const [roomId, setRoomId] = useState<string | null>(null);
    const [partnerId, setPartnerId] = useState<string | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    // The actual MediaStream objects — exposed so multiple <video> elements
    // can attach independently (e.g. an inline preview + a drawer). Refs are
    // also exposed for the simple single-consumer case.
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    // Tracks what local devices we actually managed to acquire. Either may be
    // false if the user denied permission, has no hardware, or the device is
    // already in use by another tab. Negotiation still proceeds either way.
    const [hasAudio, setHasAudio] = useState(false);
    const [hasVideo, setHasVideo] = useState(false);
    const [mediaError, setMediaError] = useState<string | null>(null);

    // ------------------------------------------------------------------
    // Local media (BEST EFFORT)
    //
    // Strategy: try audio+video, then audio-only, then video-only, then
    // proceed with nothing. We NEVER throw — a failure here must not block
    // matchmaking. The peer connection will still be created with recv-only
    // transceivers so we can at least hear/see the other side.
    // ------------------------------------------------------------------

    const startLocalStream = useCallback(async (): Promise<MediaStream | null> => {
        if (localStreamRef.current) return localStreamRef.current;
        // If a request is already in flight, reuse it instead of opening a
        // second getUserMedia (which can fail with "device in use").
        if (startPromiseRef.current) return startPromiseRef.current;
        if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
            setMediaError('Media devices unavailable in this browser/context.');
            return null;
        }

        const run = async (): Promise<MediaStream | null> => {
            const tryGet = async (constraints: MediaStreamConstraints) => {
                try {
                    return await navigator.mediaDevices.getUserMedia(constraints);
                } catch {
                    return null;
                }
            };

            // 1) try full A/V, 2) audio only, 3) video only
            const stream =
                (await tryGet({ audio: true, video: true })) ||
                (await tryGet({ audio: true, video: false })) ||
                (await tryGet({ audio: false, video: true }));

            if (!stream) {
                setHasAudio(false);
                setHasVideo(false);
                setMediaError('No camera or microphone available — joining in receive-only mode.');
                return null;
            }

            localStreamRef.current = stream;
            setLocalStream(stream);
            const audioOk = stream.getAudioTracks().length > 0;
            const videoOk = stream.getVideoTracks().length > 0;
            setHasAudio(audioOk);
            setHasVideo(videoOk);
            setMediaError(audioOk && videoOk ? null : 'Some devices were unavailable — continuing with what we got.');

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            return stream;
        };

        const promise = run();
        startPromiseRef.current = promise;
        try {
            return await promise;
        } finally {
            startPromiseRef.current = null;
        }
    }, []);

    const stopLocalStream = useCallback(() => {
        localStreamRef.current?.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
        startPromiseRef.current = null;
        setLocalStream(null);
        setHasAudio(false);
        setHasVideo(false);
        if (localVideoRef.current) localVideoRef.current.srcObject = null;
    }, []);

    // ------------------------------------------------------------------
    // Peer connection lifecycle
    // ------------------------------------------------------------------

    // Wire an RTCDataChannel into the collab pub/sub. Used by both the
    // initiator (who calls createDataChannel) and the answerer (who receives
    // it via ondatachannel).
    const attachDataChannel = useCallback((dc: RTCDataChannel) => {
        dataChannelRef.current = dc;
        dc.onopen = () => setCollabReady(true);
        dc.onclose = () => setCollabReady(false);
        dc.onerror = () => { /* swallow — channel errors shouldn't crash the app */ };
        dc.onmessage = (event) => {
            let msg: CollabMessage;
            try { msg = JSON.parse(event.data as string); } catch { return; }
            collabHandlersRef.current.forEach((h) => {
                try { h(msg); } catch { /* a bad subscriber must not break the loop */ }
            });
        };
    }, []);

    const closePeer = useCallback(() => {
        const dc = dataChannelRef.current;
        if (dc) {
            dc.onopen = null;
            dc.onclose = null;
            dc.onerror = null;
            dc.onmessage = null;
            try { dc.close(); } catch { /* noop */ }
        }
        dataChannelRef.current = null;
        setCollabReady(false);

        const pc = pcRef.current;
        if (pc) {
            pc.onicecandidate = null;
            pc.ontrack = null;
            pc.onconnectionstatechange = null;
            pc.ondatachannel = null;
            try { pc.close(); } catch { /* noop */ }
        }
        pcRef.current = null;
        pendingCandidatesRef.current = [];
        setRemoteStream(null);
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    }, []);

    const createPeer = useCallback(
        (s: Socket, currentRoomId: string, isInitiator: boolean): RTCPeerConnection => {
            const pc = new RTCPeerConnection(ICE_SERVERS);

            // Collaboration data channel. The initiator creates it; the
            // answerer picks it up through ondatachannel.
            if (isInitiator) {
                const dc = pc.createDataChannel('collab', { ordered: true });
                attachDataChannel(dc);
            } else {
                pc.ondatachannel = (event) => {
                    if (event.channel.label === 'collab') attachDataChannel(event.channel);
                };
            }

            // Push any local tracks we DO have to the peer.
            const stream = localStreamRef.current;
            const localAudio = stream?.getAudioTracks()[0];
            const localVideo = stream?.getVideoTracks()[0];

            // Add audio transceiver: send+recv if we have a mic, recv-only otherwise.
            if (localAudio && stream) {
                pc.addTrack(localAudio, stream);
            } else {
                pc.addTransceiver('audio', { direction: 'recvonly' });
            }

            // Same for video.
            if (localVideo && stream) {
                pc.addTrack(localVideo, stream);
            } else {
                pc.addTransceiver('video', { direction: 'recvonly' });
            }

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    s.emit('webrtc_ice_candidate', {
                        roomId: currentRoomId,
                        candidate: event.candidate.toJSON(),
                    });
                }
            };

            pc.ontrack = (event) => {
                const [stream] = event.streams;
                if (stream) {
                    setRemoteStream(stream);
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = stream;
                    }
                }
            };

            pcRef.current = pc;
            return pc;
        },
        [attachDataChannel]
    );

    const flushPendingCandidates = useCallback(async () => {
        const pc = pcRef.current;
        if (!pc) return;
        const queued = pendingCandidatesRef.current;
        pendingCandidatesRef.current = [];
        for (const c of queued) {
            try { await pc.addIceCandidate(c); } catch (e) { console.warn('[useWebRTC] addIceCandidate failed', e); }
        }
    }, []);

    // ------------------------------------------------------------------
    // Public controls
    // ------------------------------------------------------------------

    const joinQueue = useCallback(async () => {
        if (!isConnected) return;
        // Best-effort: if media fails, we still join the queue and connect in
        // receive-only mode. Negotiation does not depend on local tracks.
        await startLocalStream();
        setStatus('queued');
        socket.emit('join_queue');
    }, [socket, isConnected, startLocalStream]);

    const skip = useCallback(() => {
        closePeer();
        roomIdRef.current = null;
        setRoomId(null);
        setPartnerId(null);
        setMessages([]);
        setStatus('queued');
        socket.emit('skip');
    }, [socket, closePeer]);

    const leave = useCallback(() => {
        closePeer();
        roomIdRef.current = null;
        setRoomId(null);
        setPartnerId(null);
        setMessages([]);
        setStatus('idle');
        socket.emit('leave_queue');
    }, [socket, closePeer]);

    const toggleMic = useCallback(() => {
        const track = localStreamRef.current?.getAudioTracks()[0];
        if (!track) return;
        track.enabled = !track.enabled;
        setIsMuted(!track.enabled);
    }, []);

    const toggleCamera = useCallback(() => {
        const track = localStreamRef.current?.getVideoTracks()[0];
        if (!track) return;
        track.enabled = !track.enabled;
        setIsCameraOff(!track.enabled);
    }, []);

    /**
     * Sends a chat message to the current partner over the data channel
     * (Socket.IO relay). Optimistically appends it to local `messages`.
     */
    const sendChat = useCallback(
        (text: string) => {
            const trimmed = text.trim();
            if (!trimmed) return false;
            const rid = roomIdRef.current;
            if (!rid) return false;
            socket.emit('chat_message', { roomId: rid, message: trimmed });
            setMessages((prev) => [
                ...prev,
                {
                    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                    from: 'me',
                    text: trimmed,
                    timestamp: Date.now(),
                },
            ]);
            return true;
        },
        [socket]
    );

    // ------------------------------------------------------------------
    // Live collaboration channel (peer-to-peer, no socket)
    // ------------------------------------------------------------------

    /**
     * Publish a collaboration message (code edit, cursor move, …) to the
     * partner over the WebRTC data channel. Returns false if the channel
     * isn't open yet.
     */
    const sendCollab = useCallback((msg: CollabMessage): boolean => {
        const dc = dataChannelRef.current;
        if (!dc || dc.readyState !== 'open') return false;
        try {
            dc.send(JSON.stringify(msg));
            return true;
        } catch {
            return false;
        }
    }, []);

    /**
     * Subscribe to incoming collaboration messages. Returns an unsubscribe
     * function. Handlers fire imperatively (no re-render) so high-frequency
     * edits stay cheap.
     */
    const onCollab = useCallback((handler: (msg: CollabMessage) => void) => {
        collabHandlersRef.current.add(handler);
        return () => {
            collabHandlersRef.current.delete(handler);
        };
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleQueued = () => setStatus('queued');

        const handleMatched = async ({ roomId: rid, partnerId: pid, isInitiator }: MatchedPayload) => {
            roomIdRef.current = rid;
            setRoomId(rid);
            setPartnerId(pid);
            setStatus('matched');

            // Drop any stale peer SYNCHRONOUSLY, before any await — otherwise an
            // offer that arrives while we're awaiting media could create a peer
            // that this handler then tears down.
            closePeer();

            // Make sure we have media before negotiation.
            await startLocalStream();

            // IMPORTANT: only the initiator builds the peer + offer here.
            // The answerer waits and creates its peer when the offer arrives
            // (handleOffer). Creating it on both sides caused a race where the
            // answerer's peer — carrying the data channel + remote description —
            // could be torn down and rebuilt empty, breaking one media
            // direction and the data channel entirely.
            if (isInitiator) {
                const pc = createPeer(socket, rid, true);
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socket.emit('webrtc_offer', { roomId: rid, sdp: offer });
            }
        };

        const handleOffer = async ({ roomId: rid, sdp }: OfferPayload) => {
            if (rid !== roomIdRef.current) return;
            let pc = pcRef.current;
            if (!pc) {
                await startLocalStream();
                pc = createPeer(socket, rid, false);
            }
            await pc.setRemoteDescription(sdp);
            await flushPendingCandidates();
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('webrtc_answer', { roomId: rid, sdp: answer });
        };

        const handleAnswer = async ({ roomId: rid, sdp }: AnswerPayload) => {
            if (rid !== roomIdRef.current) return;
            const pc = pcRef.current;
            if (!pc) return;
            await pc.setRemoteDescription(sdp);
            await flushPendingCandidates();
        };

        const handleIce = async ({ roomId: rid, candidate }: IcePayload) => {
            if (rid !== roomIdRef.current) return;
            const pc = pcRef.current;
            // If the remote description isn't set yet, buffer the candidate.
            if (!pc || !pc.remoteDescription || !pc.remoteDescription.type) {
                pendingCandidatesRef.current.push(candidate);
                return;
            }
            try { await pc.addIceCandidate(candidate); } catch (e) {
                console.warn('[useWebRTC] addIceCandidate failed', e);
            }
        };

        const handlePartnerDisconnected = (_payload: PartnerDisconnectedPayload) => {
            closePeer();
            roomIdRef.current = null;
            setRoomId(null);
            setPartnerId(null);
            setMessages([]);
            // Server has already requeued us, surface the transition to the UI.
            setStatus('partner_left');
        };

        const handleChatMessage = ({ roomId: rid, message, timestamp }: ChatMessagePayload) => {
            if (rid !== roomIdRef.current) return;
            setMessages((prev) => [
                ...prev,
                {
                    id: `${timestamp}-${Math.random().toString(36).slice(2, 8)}`,
                    from: 'partner',
                    text: message,
                    timestamp,
                },
            ]);
        };

        socket.on('queued', handleQueued);
        socket.on('matched', handleMatched);
        socket.on('webrtc_offer', handleOffer);
        socket.on('webrtc_answer', handleAnswer);
        socket.on('webrtc_ice_candidate', handleIce);
        socket.on('partner_disconnected', handlePartnerDisconnected);
        socket.on('chat_message', handleChatMessage);

        return () => {
            socket.off('queued', handleQueued);
            socket.off('matched', handleMatched);
            socket.off('webrtc_offer', handleOffer);
            socket.off('webrtc_answer', handleAnswer);
            socket.off('webrtc_ice_candidate', handleIce);
            socket.off('partner_disconnected', handlePartnerDisconnected);
            socket.off('chat_message', handleChatMessage);
        };
    }, [socket, createPeer, closePeer, flushPendingCandidates, startLocalStream]);

    // Cleanup on unmount: drop peer + media, notify server we're gone.
    useEffect(() => {
        return () => {
            try { socket?.emit('leave_queue'); } catch { /* noop */ }
            closePeer();
            stopLocalStream();
        };
    }, [socket, closePeer, stopLocalStream]);

    return {
        // refs to bind to <video> tags (single-consumer convenience)
        localVideoRef,
        remoteVideoRef,

        // raw streams — use these when you need to attach to multiple <video>
        // elements (e.g. inline preview + chat drawer).
        localStream,
        remoteStream,

        // connection / match state
        isConnected,
        socketId,
        status,
        roomId,
        partnerId,

        // media state
        isMuted,
        isCameraOff,
        hasAudio,
        hasVideo,
        mediaError,

        // chat
        messages,
        sendChat,

        // live collaboration (peer-to-peer data channel)
        collabReady,
        sendCollab,
        onCollab,

        // controls
        joinQueue,
        skip,
        leave,
        toggleMic,
        toggleCamera,
    };
}

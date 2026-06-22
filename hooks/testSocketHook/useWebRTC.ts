'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import useSocket from './useSocket';

const ICE_SERVERS: RTCConfiguration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        // For production behind strict NAT add a TURN server here:
        // { urls: 'turn:your-turn-server.com', username: 'user', credential: 'pass' }
    ],
};

export type RoomUser = {
    socketId: string;
    userId?: string;
    username?: string;
};

export default function useWebRTC(roomId: string, userId: string) {
    const { socket, isConnected, socketId } = useSocket();

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    // ICE candidates may arrive before setRemoteDescription completes.
    const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

    const [isCallActive, setIsCallActive] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [remoteUserId, setRemoteUserId] = useState<string | null>(null);
    const [users, setUsers] = useState<RoomUser[]>([]);

    // 1. Get local camera/mic and attach to <video>
    const startLocalStream = useCallback(async () => {
        if (localStreamRef.current) return localStreamRef.current;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            localStreamRef.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            return stream;
        } catch (err) {
            console.error('[webRTC] Error accessing media devices:', err);
            throw err;
        }
    }, []);

    // 2. Close everything down (used by hangup + by failed/closed states)
    const endCall = useCallback(() => {
        console.log('[webRTC] Ending call');
        if (peerConnectionRef.current) {
            peerConnectionRef.current.onicecandidate = null;
            peerConnectionRef.current.ontrack = null;
            peerConnectionRef.current.onconnectionstatechange = null;
            try {
                peerConnectionRef.current.close();
            } catch {
                /* noop */
            }
            peerConnectionRef.current = null;
        }
        localStreamRef.current?.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
        pendingCandidatesRef.current = [];

        if (localVideoRef.current) localVideoRef.current.srcObject = null;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

        setIsCallActive(false);
        setRemoteUserId(null);
    }, []);

    // 3. Build a fresh RTCPeerConnection wired to the current socket/room
    const createPeerConnection = useCallback(
        (targetId: string): RTCPeerConnection => {
            const pc = new RTCPeerConnection(ICE_SERVERS);

            pc.onicecandidate = ({ candidate }) => {
                if (candidate) {
                    socket.emit('ice-candidate', {
                        target: targetId,
                        roomId,
                        candidate: candidate.toJSON(),
                    });
                }
            };

            pc.ontrack = (event) => {
                console.log('[webRTC] Remote track received:', event.track.kind);
                if (remoteVideoRef.current && event.streams[0]) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
            };

            pc.onconnectionstatechange = () => {
                console.log('[webRTC] Connection state:', pc.connectionState);
                if (
                    pc.connectionState === 'disconnected' ||
                    pc.connectionState === 'failed' ||
                    pc.connectionState === 'closed'
                ) {
                    endCall();
                }
            };

            // Attach local tracks (startLocalStream must have run already)
            localStreamRef.current?.getTracks().forEach((track) => {
                pc.addTrack(track, localStreamRef.current!);
            });

            return pc;
        },
        [socket, roomId, endCall]
    );

    // 4. Caller: build offer and send it
    const startCall = useCallback(
        async (targetSocketId: string) => {
            if (!targetSocketId) {
                console.warn('[webRTC] startCall called with empty targetSocketId');
                return;
            }
            await startLocalStream();
            // If there's a stale connection, drop it first.
            if (peerConnectionRef.current) endCall();

            const pc = createPeerConnection(targetSocketId);
            peerConnectionRef.current = pc; // <-- crucial: keep the ref

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            socket.emit('offer', {
                target: targetSocketId,
                roomId,
                sdp: offer, // send the whole RTCSessionDescriptionInit
            });

            setRemoteUserId(targetSocketId);
            setIsCallActive(true);
        },
        [socket, roomId, createPeerConnection, startLocalStream, endCall]
    );

    // 5. Join the signaling room as soon as the socket is connected
    useEffect(() => {
        if (!isConnected || !roomId) return;

        socket.emit(
            'join-room',
            { roomId, userId },
            (ack: { ok?: boolean; users?: RoomUser[]; error?: string }) => {
                if (ack?.ok) {
                    console.log('[webRTC] Joined room', roomId, 'users:', ack.users);
                    setUsers(ack.users ?? []);
                } else {
                    console.error('[webRTC] join-room failed:', ack?.error);
                }
            }
        );

        return () => {
            socket.emit('leave-room', { roomId });
            setUsers([]);
        };
    }, [socket, isConnected, roomId, userId]);

    // 6. Signaling listeners
    useEffect(() => {
        const handleUserJoined = (event: { users?: RoomUser[] }) => {
            if (event.users) setUsers(event.users);
        };
        const handleUserLeft = (event: { users?: RoomUser[]; socketId?: string }) => {
            if (event.users) setUsers(event.users);
            if (event.socketId && event.socketId === remoteUserId) endCall();
        };

        const handleOffer = async ({
            sdp,
            from,
        }: {
            sdp: RTCSessionDescriptionInit;
            from: string;
            roomId?: string;
        }) => {
            console.log('[webRTC] Received offer from', from);
            try {
                await startLocalStream();
                if (peerConnectionRef.current) endCall();

                const pc = createPeerConnection(from);
                peerConnectionRef.current = pc;

                await pc.setRemoteDescription(sdp);
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                // Flush any ICE candidates that arrived before setRemoteDescription
                for (const c of pendingCandidatesRef.current) {
                    try {
                        await pc.addIceCandidate(c);
                    } catch (err) {
                        console.warn('[webRTC] failed to add buffered candidate', err);
                    }
                }
                pendingCandidatesRef.current = [];

                socket.emit('answer', {
                    target: from,
                    roomId,
                    sdp: answer,
                });

                setRemoteUserId(from);
                setIsCallActive(true);
            } catch (err) {
                console.error('[webRTC] Error handling offer:', err);
                endCall();
            }
        };

        const handleAnswer = async ({
            sdp,
            from,
        }: {
            sdp: RTCSessionDescriptionInit;
            from: string;
        }) => {
            console.log('[webRTC] Received answer from', from);
            const pc = peerConnectionRef.current;
            if (!pc) return;
            try {
                await pc.setRemoteDescription(sdp);
                for (const c of pendingCandidatesRef.current) {
                    try {
                        await pc.addIceCandidate(c);
                    } catch (err) {
                        console.warn('[webRTC] failed to add buffered candidate', err);
                    }
                }
                pendingCandidatesRef.current = [];
            } catch (err) {
                console.error('[webRTC] Error setting remote answer:', err);
            }
        };

        const handleIceCandidate = async ({
            candidate,
            from,
        }: {
            candidate: RTCIceCandidateInit;
            from: string;
        }) => {
            const pc = peerConnectionRef.current;
            if (!pc || !pc.remoteDescription) {
                // Queue until remote description is set
                pendingCandidatesRef.current.push(candidate);
                return;
            }
            try {
                await pc.addIceCandidate(candidate);
            } catch (err) {
                console.warn('[webRTC] Error adding ICE candidate from', from, err);
            }
        };

        const handleCallEnd = () => {
            console.log('[webRTC] Remote ended the call');
            endCall();
        };

        socket.on('user-joined', handleUserJoined);
        socket.on('user-left', handleUserLeft);
        socket.on('offer', handleOffer);
        socket.on('answer', handleAnswer);
        socket.on('ice-candidate', handleIceCandidate);
        socket.on('call-end', handleCallEnd);

        return () => {
            socket.off('user-joined', handleUserJoined);
            socket.off('user-left', handleUserLeft);
            socket.off('offer', handleOffer);
            socket.off('answer', handleAnswer);
            socket.off('ice-candidate', handleIceCandidate);
            socket.off('call-end', handleCallEnd);
        };
    }, [socket, roomId, createPeerConnection, startLocalStream, endCall, remoteUserId]);

    // 7. Tear everything down on unmount
    useEffect(() => {
        return () => {
            endCall();
        };
    }, [endCall]);

    // 8. Public controls
    const hangupCall = useCallback(() => {
        if (remoteUserId) socket.emit('call-end', { target: remoteUserId });
        endCall();
    }, [socket, remoteUserId, endCall]);

    const toggleMute = useCallback(() => {
        const audioTrack = localStreamRef.current?.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            setIsMuted(!audioTrack.enabled);
        }
    }, []);

    const toggleCamera = useCallback(() => {
        const videoTrack = localStreamRef.current?.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            setIsCameraOff(!videoTrack.enabled);
        }
    }, []);

    return {
        localVideoRef,
        remoteVideoRef,
        isCallActive,
        isMuted,
        isCameraOff,
        socketId,
        users,
        remoteUserId,
        startLocalStream,
        startCall,
        hangupCall,
        toggleMute,
        toggleCamera,
    };
}











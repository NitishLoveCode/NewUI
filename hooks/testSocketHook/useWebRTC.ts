'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import useSocket from "./useSocket";
import { Socket } from "socket.io-client";





const ICE_SERVERS = {
    iceServers: [
        {urls: 'stun:stun.l.google.com:19302'},
        {urls: 'stun:stun1.l.google.com:19302'}

        // Add TURN server for production use to handle clients behind strict NATs or firewalls
        // { urls: 'turn:your-turn-server.com', username: 'user', credential: 'pass' }
    ]
}

export default function useWebRTC(roomId: string, userId: string){
    
    const {socket} = useSocket();

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);


    const [isCallActive, setIsCallActive] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [remoteUserId, setRemoteUserId] = useState<string | null>(null);


    // ___1. Create RTCPeerConnection _______________
    const createPeerConnection = useCallback((targetId: string): RTCPeerConnection =>{
        const pc = new RTCPeerConnection(ICE_SERVERS);


        // Send ICE candidates to the other peer
        pc.onicecandidate = ({candidate}) =>{
            if(candidate){
                socket.emit('ice-candidate', {
                    target: targetId,
                    roomId,
                    candidate
                })
            }
        }


        // when remote stream arrives, show it in the remote video element.
        pc.ontrack = (event) =>{
            if(remoteVideoRef.current){
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        }

        // On connection state change, handle cleanup if connection is closed
        pc.onconnectionstatechange = () =>{
            console.log('[webRTC] Connection state', pc.connectionState);
            if(pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed'){
                endCall();
            }
        }

        // Attach local stream tracks to the peer connection
        localStreamRef.current?.getTracks().forEach(track => {
            pc.addTrack(track, localStreamRef.current!);
        });

        return pc;

    },[])


    // 2_______ Get local camera/microphone stream and attach to local video element
    const startLocalStream = useCallback(async () =>{
        try{
            const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
            localStreamRef.current = stream;
            if(localVideoRef.current){
                localVideoRef.current.srcObject = stream;
            }
        }catch(err){
            console.error('[webRTC] Error accessing media devices:', err);
        }
    },[])

    // 3____ Start call__________
    const startCall = useCallback(async(targetSocketId: string) =>{
        await startLocalStream();
        const pc = createPeerConnection(targetSocketId);

        // Create and send offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit('offer', {
            target: targetSocketId,
            roomId,
            sdp: offer.sdp
        });

        setRemoteUserId(targetSocketId);
        setIsCallActive(true);
    },[socket, roomId, createPeerConnection, startLocalStream])



    // 4. Socket event listeners ________________

    useEffect(() =>{

        // Reveive: got an offer -> send back answer
        socket.on('offer', async({sdp, from, roomId}) =>{
            console.log('[webRTC] Received offer from', from);
            await startLocalStream();
            const pc = createPeerConnection(from);

            await pc.setRemoteDescription(JSON.parse(sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            socket.emit('answer', {
                target: from,
                roomId,
                sdp: answer.sdp
            });

            setRemoteUserId(from);
            setIsCallActive(true);
        });

        // Caller: got answer -> set remote handshake
        socket.on('answer', async({sdp, from, roomId}) =>{
            console.log('[webRTC] Received answer from', from);
            await peerConnectionRef.current?.setRemoteDescription(JSON.parse(sdp));
        });

        // Both: exchange ICE candidates
        socket.on('ice-candidate', async({candidate, from, roomId}) =>{
            console.log('[webRTC] Received ICE candidate from', from);
            try{
                await peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
            }catch(err){
                console.error('[webRTC] Error adding received ICE candidate', err);
            }
        });

        // Remote peer ended call
        socket.on('call-end', () =>{
            endCall();
        })

        return () =>{
            socket.off('offer');
            socket.off('answer');
            socket.off('ice-candidate');
            socket.off('call-end');
        }

    }, [socket, createPeerConnection, startLocalStream, roomId]);



    // 5. End call
    const endCall = useCallback(() =>{
        console.log('[webRTC] Ending call');
        peerConnectionRef.current?.close();
        peerConnectionRef.current = null;
    
        localStreamRef.current?.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
    
        if(localVideoRef.current){
            localVideoRef.current.srcObject = null;
        }
        if(remoteVideoRef.current){
            remoteVideoRef.current.srcObject = null;
        }
    
        setIsCallActive(false);
        setRemoteUserId(null);
    },[])

    // hangup call
    const hangupCall = useCallback(() =>{
        if(remoteUserId){
            socket.emit('call-end', {target: remoteUserId});
        }
        endCall();
    }, [socket, remoteUserId, endCall])

    // Toggle mute/unmute microphone
    const toggleMute = useCallback(() =>{
        const audioTracks = localStreamRef.current?.getAudioTracks()[0];
        if(audioTracks){
            audioTracks.enabled = !audioTracks.enabled;
            setIsMuted(!audioTracks.enabled);
        }
    },[])

    // Toggle camera on/off
    const toggleCamera = useCallback(() =>{
        const videoTracks = localStreamRef.current?.getVideoTracks()[0];
        if(videoTracks){
            videoTracks.enabled = !videoTracks.enabled;
            setIsCameraOff(!videoTracks.enabled);
        }
    },[]);

    return {
        localVideoRef,
        remoteVideoRef,
        isCallActive,
        isMuted,
        isCameraOff,
        startCall,
        hangupCall,
        toggleMute,
        toggleCamera
    }


}










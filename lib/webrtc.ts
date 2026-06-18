import { Socket } from 'socket.io-client';

export interface WebRTCConfig {
  iceServers?: RTCIceServer[];
  onRemoteStream?: (stream: MediaStream) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  onError?: (error: string) => void;
}

export class WebRTCHandler {
  peerConnection: RTCPeerConnection | null = null;
  dataChannel: RTCDataChannel | null = null;
  socket: Socket;
  localStream: MediaStream | null = null;
  remoteStream: MediaStream | null = null;
  config: WebRTCConfig;
  targetPeer: string | null = null;
  roomId: string = 'default-room';
  ourSocketId: string | null = null;
  roomUsers: string[] = [];

  constructor(socket: Socket, config: WebRTCConfig = {}, ourSocketId?: string, roomUsers?: string[]) {
    this.socket = socket;
    this.ourSocketId = ourSocketId || null;
    this.roomUsers = roomUsers || [];
    this.config = {
      iceServers: [
        { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
      ],
      ...config,
    };
  }

  async initialize(localStream?: MediaStream) {
    this.localStream = localStream || null;

    const peerConfig: RTCConfiguration = {
      iceServers: this.config.iceServers,
    };

    this.peerConnection = new RTCPeerConnection(peerConfig);

    // Add local stream tracks if available
    if (localStream) {
      console.log('[WebRTC] Adding local tracks to peer connection:', localStream.getTracks().length);
      localStream.getTracks().forEach(track => {
        console.log('[WebRTC] Adding track:', track.kind, track.label);
        this.peerConnection!.addTrack(track, localStream);
      });
    }

    // Setup remote stream
    this.peerConnection.ontrack = (event) => {
      console.log('[WebRTC] ontrack event received, track kind:', event.track.kind, 'streams:', event.streams.length);
      if (event.streams[0]) {
        this.remoteStream = event.streams[0];
        console.log('[WebRTC] ✓ Setting remote stream with', event.streams[0].getTracks().length, 'tracks');
        this.config.onRemoteStream?.(event.streams[0]);
      }
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('[WebRTC] Sending ICE candidate to', this.targetPeer, 'in room', this.roomId);
        this.socket.emit('ice-candidate', {
          target: this.targetPeer,
          roomId: this.roomId,
          candidate: event.candidate,
        });
      } else {
        console.log('[WebRTC] ICE gathering complete');
      }
    };

    // Connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection state:', this.peerConnection!.connectionState);
      this.config.onConnectionStateChange?.(this.peerConnection!.connectionState);
    };

    // Setup data channel for additional communication
    this.peerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.setupDataChannel();
    };

    // Listen for WebRTC signals from socket
    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    console.log('[WebRTC] Setting up socket listeners for offer/answer/ice-candidate events');
    this.socket.on('offer', async (data: { from?: string; target?: string; roomId: string; sdp: string }) => {
      try {
        // The sender is in 'from' field (sent by server) or we use 'target' as fallback
        let fromPeer = data.from || data.target;
        
        // If still undefined, try to determine from room users (should be the other user in a 2-person room)
        if (!fromPeer && this.ourSocketId && this.roomUsers.length === 2) {
          fromPeer = this.roomUsers.find(id => id !== this.ourSocketId) || null;
          console.log('[WebRTC] Determined peer from room users:', fromPeer);
        }
        
        console.log('[WebRTC] Received offer from', fromPeer, 'in room', data.roomId);
        this.targetPeer = fromPeer;
        this.roomId = data.roomId;
        await this.peerConnection!.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: data.sdp }));
        const answer = await this.peerConnection!.createAnswer();
        await this.peerConnection!.setLocalDescription(answer);
        console.log('[WebRTC] Sending answer to', fromPeer);
        this.socket.emit('answer', {
          target: fromPeer,
          roomId: data.roomId,
          sdp: answer.sdp,
        });
      } catch (error) {
        this.config.onError?.(`Error handling offer: ${error}`);
      }
    });

    this.socket.on('answer', async (data: { from?: string; target?: string; roomId: string; sdp: string }) => {
      try {
        const fromPeer = data.from || data.target;
        console.log('[WebRTC] Received answer from', fromPeer);
        await this.peerConnection!.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: data.sdp }));
      } catch (error) {
        this.config.onError?.(`Error handling answer: ${error}`);
      }
    });

    this.socket.on('ice-candidate', async (data: { from?: string; target?: string; roomId: string; candidate: any }) => {
      try {
        if (data.candidate) {
          const fromPeer = data.from || data.target;
          console.log('[WebRTC] Received ICE candidate from', fromPeer);
          await this.peerConnection!.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      } catch (error) {
        this.config.onError?.(`Error adding ICE candidate: ${error}`);
      }
    });
  }

  private setupDataChannel() {
    if (!this.dataChannel) return;

    this.dataChannel.onopen = () => console.log('Data channel opened');
    this.dataChannel.onclose = () => console.log('Data channel closed');
    this.dataChannel.onerror = (error) => this.config.onError?.(`Data channel error: ${error}`);
  }

  async createOffer(targetPeer: string, roomId: string) {
    try {
      console.log('[WebRTC] Creating offer for peer:', targetPeer, 'in room:', roomId);
      this.targetPeer = targetPeer;
      this.roomId = roomId;

      // Create data channel
      this.dataChannel = this.peerConnection!.createDataChannel('collaboration', {
        ordered: true,
      });
      this.setupDataChannel();

      const offer = await this.peerConnection!.createOffer();
      await this.peerConnection!.setLocalDescription(offer);

      console.log('[WebRTC] Sending offer to', targetPeer);
      this.socket.emit('offer', {
        target: targetPeer,
        roomId,
        sdp: offer.sdp,
      });
    } catch (error) {
      this.config.onError?.(`Error creating offer: ${error}`);
    }
  }

  sendData(data: any) {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(JSON.stringify(data));
    }
  }

  closeConnection() {
    if (this.dataChannel) {
      this.dataChannel.close();
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.remoteStream = null;
    this.localStream = null;
    this.targetPeer = null;
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }


}

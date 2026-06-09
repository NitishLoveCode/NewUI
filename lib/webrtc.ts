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

  constructor(socket: Socket, config: WebRTCConfig = {}) {
    this.socket = socket;
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
      localStream.getTracks().forEach(track => {
        this.peerConnection!.addTrack(track, localStream);
      });
    }

    // Setup remote stream
    this.peerConnection.ontrack = (event) => {
      if (event.streams[0]) {
        this.remoteStream = event.streams[0];
        this.config.onRemoteStream?.(event.streams[0]);
      }
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('ice-candidate', {
          target: this.targetPeer,
          roomId: this.getRoomId(),
          candidate: event.candidate,
        });
      }
    };

    // Connection state changes
    this.peerConnection.onconnectionstatechange = () => {
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
    this.socket.on('offer', async (data: { target: string; roomId: string; sdp: string }) => {
      try {
        this.targetPeer = data.target;
        await this.peerConnection!.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: data.sdp }));
        const answer = await this.peerConnection!.createAnswer();
        await this.peerConnection!.setLocalDescription(answer);
        this.socket.emit('answer', {
          target: data.target,
          roomId: data.roomId,
          sdp: answer.sdp,
        });
      } catch (error) {
        this.config.onError?.(`Error handling offer: ${error}`);
      }
    });

    this.socket.on('answer', async (data: { target: string; roomId: string; sdp: string }) => {
      try {
        await this.peerConnection!.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: data.sdp }));
      } catch (error) {
        this.config.onError?.(`Error handling answer: ${error}`);
      }
    });

    this.socket.on('ice-candidate', async (data: { target: string; roomId: string; candidate: any }) => {
      try {
        if (data.candidate) {
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
      this.targetPeer = targetPeer;

      // Create data channel
      this.dataChannel = this.peerConnection!.createDataChannel('collaboration', {
        ordered: true,
      });
      this.setupDataChannel();

      const offer = await this.peerConnection!.createOffer();
      await this.peerConnection!.setLocalDescription(offer);

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

  private getRoomId(): string {
    // This should be injected or stored in the component
    return 'default-room';
  }
}

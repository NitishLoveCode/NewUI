



'use client';

import { useEffect, useMemo, useState } from 'react';
import { Send, Video, VideoOff, Mic, MicOff, PhoneOff, SkipForward } from 'lucide-react';
import useWebRTC from '@/hooks/testSocketHook/useWebRTC';

const ROOM_ID = 'test';

export default function VideoCallPage() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<
    Array<{ id: number; text: string; sender: 'me' | 'partner'; time: string }>
  >([
    { id: 1, text: 'Hey! How are you?', sender: 'partner', time: '10:30 AM' },
    { id: 2, text: "Hi! I'm doing great, thanks!", sender: 'me', time: '10:31 AM' },
    { id: 3, text: 'What are you working on?', sender: 'partner', time: '10:32 AM' },
  ]);

  // Stable userId per browser tab so the server can distinguish peers
  const userId = useMemo(() => {
    if (typeof window === 'undefined') return 'anon';
    const existing = sessionStorage.getItem('testUserId');
    if (existing) return existing;
    const fresh = `user-${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem('testUserId', fresh);
    return fresh;
  }, []);

  const {
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
  } = useWebRTC(ROOM_ID, userId);

  // Always show our own camera as soon as we land on the page
  useEffect(() => {
    startLocalStream().catch(() => undefined);
  }, [startLocalStream]);

  // The other participants in the room (excluding ourselves)
  const partner = users.find((u) => u.socketId !== socketId);

  // Auto-call: the peer with the lexicographically smaller socketId initiates,
  // so only one offer is sent when two browsers meet in the same room.
  useEffect(() => {
    if (!partner || !socketId || isCallActive) return;
    if (socketId < partner.socketId) {
      console.log('[test page] Auto-calling partner', partner.socketId);
      startCall(partner.socketId);
    }
  }, [partner, socketId, isCallActive, startCall]);

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: message,
        sender: 'me' as const,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Left Side - Video Section */}
      <div className="flex-1 flex flex-col p-6">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Video Call
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Room <span className="font-mono">{ROOM_ID}</span> · you are{' '}
            <span className="font-mono">{socketId ?? 'connecting...'}</span> · partner{' '}
            <span className="font-mono">{partner?.socketId ?? 'waiting...'}</span>
          </p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => partner && startCall(partner.socketId)}
              disabled={!partner || isCallActive}
              className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-md text-sm"
            >
              {isCallActive ? 'In call' : partner ? 'Call partner' : 'Waiting for partner...'}
            </button>
          </div>
        </div>

        {/* Video Containers */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Partner Video - Larger */}
          <div className="flex-1 relative bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
            <div className="absolute inset-0 flex items-center justify-center">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
            {/* Connection Status Badge */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div
                className={`flex items-center gap-2 backdrop-blur-sm px-3 py-1.5 rounded-full ${
                  isCallActive
                    ? 'bg-green-500/20 border border-green-500/30'
                    : 'bg-yellow-500/20 border border-yellow-500/30'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full animate-pulse ${
                    isCallActive ? 'bg-green-400' : 'bg-yellow-400'
                  }`}
                ></div>
                <span
                  className={`text-sm font-medium ${
                    isCallActive ? 'text-green-400' : 'text-yellow-400'
                  }`}
                >
                  {isCallActive ? 'Connected' : 'Waiting'}
                </span>
              </div>
            </div>
          </div>

          {/* My Video - Smaller */}
          <div className="h-48 relative bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
            <div className="absolute inset-0 flex items-center justify-center">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
            {/* Video Off Overlay */}
            {isCameraOff && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                <VideoOff className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full transition-all transform hover:scale-110 ${
              isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          <button
            onClick={toggleCamera}
            className={`p-4 rounded-full transition-all transform hover:scale-110 ${
              isCameraOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title={isCameraOff ? 'Turn on video' : 'Turn off video'}
          >
            {isCameraOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </button>

          <button
            onClick={hangupCall}
            disabled={!isCallActive}
            className="p-4 bg-red-500 hover:bg-red-600 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-full transition-all transform hover:scale-110"
            title="End Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>

          <button
            className="p-4 bg-blue-500 hover:bg-blue-600 rounded-full transition-all transform hover:scale-110"
            title="Next Person"
          >
            <SkipForward className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Right Side - Chat Section */}
      <div className="w-96 bg-gray-900/50 backdrop-blur-lg border-l border-gray-700 flex flex-col">
        {/* Chat Header */}
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold">Chat</h2>
          <p className="text-sm text-gray-400 mt-1">
            {remoteUserId ? `Talking to ${remoteUserId}` : 'No partner yet'}
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] ${
                  msg.sender === 'me' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-100'
                } rounded-2xl px-4 py-2.5 shadow-lg`}
              >
                <p className="text-sm break-words">{msg.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.sender === 'me' ? 'text-blue-100' : 'text-gray-400'
                  }`}
                >
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-6 border-t border-gray-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
            />
            <button
              onClick={sendMessage}
              className="bg-blue-500 hover:bg-blue-600 p-3 rounded-xl transition-all transform hover:scale-105 active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            Press Enter to send • Be respectful and kind
          </p>
        </div>
      </div>
    </div>
  );
}

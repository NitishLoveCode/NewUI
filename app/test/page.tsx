



'use client';

import { useState } from 'react';
import { Send, Video, VideoOff, Mic, MicOff, PhoneOff, SkipForward } from 'lucide-react';
import useWebRTC from '@/hooks/testSocketHook/useWebRTC';

export default function VideoCallPage() {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ id: number; text: string; sender: 'me' | 'partner'; time: string }>>([
    { id: 1, text: 'Hey! How are you?', sender: 'partner', time: '10:30 AM' },
    { id: 2, text: 'Hi! I\'m doing great, thanks!', sender: 'me', time: '10:31 AM' },
    { id: 3, text: 'What are you working on?', sender: 'partner', time: '10:32 AM' },
  ]);


  const {
    localVideoRef,
    remoteVideoRef,
    isCallActive,
    isMuted:isMutedFun,
    isCameraOff,
    startCall,
    hangupCall,
    toggleMute,
    toggleCamera
  } = useWebRTC("test", "userId");









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
          <p className="text-gray-400 text-sm mt-1">Connect with random people around the world</p>
        </div>

        {/* Video Containers */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Partner Video - Larger */}
          <div className="flex-1 relative bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl font-bold">S</span>
                </div>
                <p className="text-gray-400">Stranger's Video</p>
                <p className="text-sm text-gray-500 mt-1">Waiting for connection...</p>
              </div>
            </div>
            {/* Connection Status Badge */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div className="flex items-center gap-2 bg-green-500/20 backdrop-blur-sm border border-green-500/30 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-400">Connected</span>
              </div>
            </div>
          </div>

          {/* My Video - Smaller */}
          <div className="h-48 relative bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl font-bold">Y</span>
                </div>
                <p className="text-gray-400 text-sm">Your Video</p>
              </div>
            </div>
            {/* Video Off Overlay */}
            {isVideoOff && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                <VideoOff className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-full transition-all transform hover:scale-110 ${
              isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`p-4 rounded-full transition-all transform hover:scale-110 ${
              isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title={isVideoOff ? 'Turn on video' : 'Turn off video'}
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </button>

          <button
            className="p-4 bg-red-500 hover:bg-red-600 rounded-full transition-all transform hover:scale-110"
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
          <p className="text-sm text-gray-400 mt-1">Send messages to your partner</p>
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
                  msg.sender === 'me'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 text-gray-100'
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
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
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
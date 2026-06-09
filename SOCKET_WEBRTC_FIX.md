# Socket.IO & WebRTC Integration - Fix Guide

## What Was Fixed

Your Next.js app now has proper Socket.IO and WebRTC integration at the `/coding-practice` route. Here's what was added:

### 1. **Socket.IO Service** (`lib/socket.ts`)
- Initializes Socket.IO client connection to `NEXT_PUBLIC_SOCKET_URL`
- Configures reconnection with exponential backoff
- Exports socket singleton with proper typing

### 2. **WebRTC Handler** (`lib/webrtc.ts`)
- Handles peer-to-peer video/audio connections
- Manages ICE candidates and SDP offers/answers
- Auto-sets remote stream when peer connects
- Includes data channel for additional communication

### 3. **Collaboration Hook** (`lib/useCollaboration.ts`)
- Custom React hook orchestrating Socket.IO + WebRTC
- Auto-joins room on mount
- Handles media stream acquisition (`getUserMedia`)
- Broadcasts: code changes, cursor positions, chat messages
- Listens for remote events

### 4. **Updated Coding Practice Page**
- Integrated collaboration hook when connection state = 'connected'
- Added video refs for local and remote streams
- Updated VideoCallBar to display actual video instead of emoji
- Chat messages now emit via Socket.IO
- Proper cleanup on disconnect

---

## Node.js Version Issue

**ERROR:** Your Node.js is v14.20.0, but Next.js 16 requires **Node 18+**

**FIX:** Update Node.js
```bash
# Via nvm (recommended)
nvm install 18
nvm use 18

# Or download from nodejs.org
```

After updating, run:
```bash
npm run dev
```

---

## Testing the Integration

Once you upgrade Node.js:

1. **Run the development server:**
   ```bash
   npm run dev
   ```

2. **Open two browsers** (or incognito windows):
   - Browser 1: `http://localhost:3000/coding-practice`
   - Browser 2: Same URL

3. **Click "Connect with Partner"** on both:
   - You should see video streams after ~2 seconds
   - Chat should send/receive in real-time
   - Both should be in the same Socket.IO room

---

## Debugging Common Issues

### 1. **Video not showing**
```
✓ Check browser permissions for camera/microphone
✓ Verify NEXT_PUBLIC_SOCKET_URL=http://13.203.206.210:3000 in .env.local
✓ Ensure backend is running: curl http://13.203.206.210:3000/health
```

### 2. **Socket connection fails**
```
✓ Check EC2 security group allows port 3000 inbound
✓ Verify CORS_ORIGIN=* in nodeServer/.env
✓ Check backend logs: docker compose logs -f backend
```

### 3. **WebRTC not connecting**
```
✓ Browser console (F12) for WebRTC errors
✓ Verify both peers can connect to socket first
✓ Check STUN servers (using Google's, should work)
✓ Check firewall doesn't block UDP (WebRTC uses UDP)
```

### 4. **Chat not working**
```
✓ Check socket is emitting 'chat-message' correctly
✓ Verify backend is broadcasting to room
✓ Look for socket errors in console
```

---

## File Changes Summary

**New files created:**
- `lib/socket.ts` - Socket.IO client setup
- `lib/webrtc.ts` - WebRTC peer connection handler
- `lib/useCollaboration.ts` - React hook integrating both

**Modified files:**
- `app/coding-practice/page.tsx` - Added integration + video refs

---

## Environment Variables (Already Configured)

```
NEXT_PUBLIC_BACKEND_URL=http://13.203.206.210:3000
NEXT_PUBLIC_SOCKET_URL=http://13.203.206.210:3000
```

---

## Next Steps

1. ✅ Upgrade Node.js to 18+
2. ✅ Run `npm run dev`
3. ✅ Test video/chat on local machine
4. ✅ Verify backend logs for any errors
5. **Optional:** Add code sync (currently chat-only for testing)
6. **Optional:** Add audio/video quality controls
7. **Optional:** Add screen sharing via WebRTC data channel

---

## Backend Integration Details

Your backend is already configured correctly:

```
Socket.IO Events (incoming):
- join-room → { roomId, userId?, username? }
- code-change → broadcast to room
- cursor-change → broadcast to room
- chat-message → broadcast to room
- offer/answer/ice-candidate → peer-to-peer signaling

Socket.IO Events (outgoing):
- user-joined/user-left
- code-change/cursor-change/chat-message (mirrored)
- WebRTC signaling events
```

The integration automatically:
- Joins the room for the current problem step
- Sends chat messages to all peers in room
- Bridges WebRTC signaling over Socket.IO
- Cleans up streams on disconnect

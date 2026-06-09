# Socket.io & WebRTC - Debugging Guide

## Step 1: Verify Backend is Running & Accessible

**From your laptop, test if backend is reachable:**

```bash
# Check if backend is running
curl http://13.203.206.210:3000/health

# Should return something like: {"status":"ok"}
```

**If not working, SSH into your EC2 and check:**

```bash
docker compose ps
docker compose logs backend | tail -50
```

---

## Step 2: Check Browser Console (Most Important!)

1. Open deployed app on any device
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Look for logs starting with `[Socket]` and `[Collaboration]`

**What to look for:**

```
✓ SUCCESS - You should see:
[Socket] Initializing Socket.IO client...
[Socket] Target URL: http://13.203.206.210:3000
[Socket] ✓ Connected successfully
[Socket] Socket ID: abc123...
[Collaboration] Socket connected, joining room: problem-1
[Collaboration] join-room response: {ok: true, users: [...]}

✗ FAILURE - You might see:
[Socket] ✗ Connection error: ...
[Socket] ✗ Socket error: ...
```

---

## Step 3: Verify Environment Variables

**Check `.env.local` has correct values:**

```
NEXT_PUBLIC_SOCKET_URL=http://13.203.206.210:3000
```

**If deployed to Vercel/similar:**
- Set same env vars in deployment settings
- Rebuild & redeploy after setting env vars

---

## Step 4: Check Backend Configuration

**SSH into EC2 and verify `.env` in nodeServer:**

```bash
ssh -i your-key.pem ubuntu@13.203.206.210
cat ~/casino-dashboard-ui/nodeServer/.env
```

**Must have:**
```
CORS_ORIGIN=*
PORT=3000
```

**Restart backend after any changes:**
```bash
cd ~/casino-dashboard-ui/nodeServer
docker compose down
docker compose up -d --build
```

---

## Step 5: Test Backend Directly

**From your laptop, test the backend API:**

```bash
# Test health endpoint
curl http://13.203.206.210:3000/health

# Test code execution
curl -X POST http://13.203.206.210:3000/api/run-code \
  -H "Content-Type: application/json" \
  -d '{"language":"python","code":"print(\"hello\")"}'

# Expected: {"status":"success","output":"hello\n",...}
```

---

## Step 6: Test Socket.io Connection Directly

**Create a test file to verify Socket.io works:**

```javascript
// Test in browser console
import io from 'https://cdn.socket.io/4.5.4/socket.io.js';

const socket = io('http://13.203.206.210:3000', {
  transports: ['websocket', 'polling'],
});

socket.on('connect', () => {
  console.log('✓ Connected!', socket.id);
  
  // Try joining a room
  socket.emit('join-room', {
    roomId: 'test-room',
    userId: 'test-user',
    username: 'Test User'
  }, (res) => {
    console.log('join-room response:', res);
  });
});

socket.on('connect_error', (err) => {
  console.error('✗ Connection error:', err);
});

socket.on('error', (err) => {
  console.error('✗ Socket error:', err);
});
```

---

## Step 7: Check Network Tab

1. Open DevTools → **Network** tab
2. Filter for "websocket" or "polling"
3. Look for connections to `13.203.206.210:3000`

**Expected:**
- WebSocket connection to `ws://13.203.206.210:3000/socket.io/?...`
- Status should be **101 Switching Protocols** (for WebSocket)
- Or multiple HTTP polling requests

**If missing:**
- Socket.io isn't connecting at all
- Check CORS_ORIGIN in backend
- Check firewall/security groups

---

## Step 8: Check EC2 Security Group

**SSH to EC2 and verify port 3000 is open:**

```bash
sudo iptables -L -n | grep 3000
```

**Or check AWS Console:**
- Go to your EC2 instance
- Security tab → Security groups
- Inbound rules should have:
  - Port 3000, Protocol TCP, Source 0.0.0.0/0

---

## Common Issues & Fixes

### Issue: "Failed to connect to 13.203.206.210:3000"
**Solution:**
- Backend not running: `docker compose up -d`
- Firewall blocking port 3000
- EC2 security group doesn't allow inbound on 3000

### Issue: CORS errors in console
**Solution:**
- Backend `.env` should have: `CORS_ORIGIN=*`
- Restart backend after change

### Issue: "Connection timeout"
**Solution:**
- Check if backend is actually running: `curl http://13.203.206.210:3000/health`
- Check network connectivity from your location to EC2

### Issue: WebSocket connects but no events received
**Solution:**
- Check room name is correct
- Verify both clients emit to same roomId
- Check backend logs: `docker compose logs -f backend`

---

## Debugging Checklist

- [ ] Backend is running: `curl http://13.203.206.210:3000/health`
- [ ] Browser console shows `[Socket] ✓ Connected successfully`
- [ ] `NEXT_PUBLIC_SOCKET_URL` is set in `.env.local`
- [ ] Backend `CORS_ORIGIN=*` is set
- [ ] Port 3000 is open in EC2 security group
- [ ] Both laptops can see each other's user-joined events
- [ ] Chat message sends and appears on other laptop

---

## Next Steps

1. **Share browser console logs** when you run it (the [Socket] and [Collaboration] messages)
2. **Test backend health**: `curl http://13.203.206.210:3000/health`
3. **Check EC2 logs**: `docker compose logs -f backend`
4. Send these outputs so I can identify the exact issue

# Socket.IO SSL/TLS Setup - Complete Solution

## Architecture

```
Vercel (HTTPS)
    ↓
Nginx Reverse Proxy (443 - WSS/HTTPS)
    ↓
Node.js Socket.IO (3000)
```

---

## Step 1: SSH into EC2

```bash
ssh -i your-key.pem ubuntu@13.203.206.210
sudo su -
```

---

## Step 2: Update Security Group

Allow ports 80 and 443:

**Via AWS Console:**
- EC2 → Security Groups → Inbound Rules
- Add: Port 80, TCP, 0.0.0.0/0
- Add: Port 443, TCP, 0.0.0.0/0
- Keep: Port 3000, TCP (internal only, not needed public)

**Or via CLI:**
```bash
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxx \
  --protocol tcp --port 80 --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxx \
  --protocol tcp --port 443 --cidr 0.0.0.0/0
```

---

## Step 3: Get a Domain (REQUIRED for SSL)

You need a domain for Let's Encrypt. Options:

**Option A: Use Route53 (AWS)**
```bash
# Already have domain? Just add A record pointing to EC2 public IP
# Point: api.yourdomain.com → 13.203.206.210
```

**Option B: Use cheap domain service**
- GoDaddy, Namecheap, etc.
- Create A record: `api.yourdomain.com` → `13.203.206.210`

**For testing, you can use a temporary domain or EC2's public IP with a self-signed cert.**

---

## Step 4: Install Nginx & Certbot

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## Step 5: Get SSL Certificate (Let's Encrypt)

**If using a domain:**

```bash
sudo certbot certonly --nginx -d api.yourdomain.com
# Follow prompts, cert goes to /etc/letsencrypt/live/api.yourdomain.com/
```

**For testing without domain (self-signed):**

```bash
sudo mkdir -p /etc/letsencrypt/live/socket.local
sudo openssl req -x509 -newkey rsa:2048 -keyout /etc/letsencrypt/live/socket.local/privkey.pem \
  -out /etc/letsencrypt/live/socket.local/fullchain.pem -days 365 -nodes \
  -subj "/CN=13.203.206.210"
```

---

## Step 6: Configure Nginx as Reverse Proxy

Create `/etc/nginx/sites-available/socket`:

```bash
sudo tee /etc/nginx/sites-available/socket > /dev/null << 'EOF'
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name _;
    return 301 https://$host$request_uri;
}

# Main HTTPS server
server {
    listen 443 ssl http2;
    server_name _;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to backend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
        proxy_buffering off;
    }
}
EOF
```

**Enable the config:**

```bash
sudo ln -s /etc/nginx/sites-available/socket /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default 2>/dev/null || true
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 7: Update Backend CORS

Edit `nodeServer/.env`:

```bash
cd ~/casino-dashboard-ui/nodeServer
nano .env
```

Update:

```
CORS_ORIGIN=https://new-ui-jade.vercel.app
```

(Change to your actual Vercel domain)

Restart:

```bash
docker compose down
docker compose up -d --build
docker compose logs -f backend
```

---

## Step 8: Update Frontend Environment

In your Vercel project settings or `.env.production`:

```
NEXT_PUBLIC_SOCKET_URL=https://api.yourdomain.com
# OR if using IP with self-signed cert:
# NEXT_PUBLIC_SOCKET_URL=https://13.203.206.210
```

**Redeploy to Vercel:**

```bash
git add .env.production
git commit -m "fix: update socket URL to use wss"
git push
```

---

## Step 9: Fix Frontend Socket Configuration

Update `lib/socket.ts` to handle HTTPS:

```typescript
import io, { Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    console.log('[Socket] Initializing Socket.IO client...');
    console.log('[Socket] Target URL:', SOCKET_URL);

    socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
      rejectUnauthorized: false, // For self-signed certs only - remove in production
    });

    socket.on('connect', () => {
      console.log('[Socket] ✓ Connected successfully');
      console.log('[Socket] Socket ID:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] ✗ Disconnected. Reason:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('[Socket] ✗ Connection error:', error);
    });

    socket.on('error', (error) => {
      console.error('[Socket] ✗ Socket error:', error);
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    console.log('[Socket] Disconnecting...');
    socket.disconnect();
    socket = null;
  }
};

export type SocketEventMap = {
  'connected': { socketId: string };
  'user-joined': { roomId: string; socketId: string; userId?: string; username?: string; users: any[] };
  'user-left': { roomId: string; socketId: string; userId?: string; username?: string; users: any[] };
  'code-change': { roomId: string; socketId: string; userId?: string; code: string; language?: string; cursor?: any };
  'cursor-change': { roomId: string; socketId: string; userId?: string; cursor: any; selection?: any };
  'chat-message': { roomId: string; socketId: string; userId?: string; username?: string; message: string; timestamp: number };
  'offer': { target: string; roomId: string; sdp: string };
  'answer': { target: string; roomId: string; sdp: string };
  'ice-candidate': { target: string; roomId: string; candidate: any };
  'call-end': { target: string };
};
```

---

## Step 10: Verify Everything

**Test Nginx:**

```bash
sudo nginx -t
# Should output: syntax is ok
```

**Test backend is reachable through Nginx:**

```bash
curl https://api.yourdomain.com/health
# Or for self-signed:
curl -k https://13.203.206.210/health
# Should return: {"status":"ok"}
```

**Check Nginx logs:**

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

**Check backend logs:**

```bash
docker compose logs -f backend
```

---

## Step 11: Test in Browser

1. Open https://new-ui-jade.vercel.app/coding-practice
2. Press **F12** → Console
3. Click "Connect with Partner"
4. You should see:

```
[Socket] Initializing Socket.IO client...
[Socket] Target URL: https://api.yourdomain.com
[Socket] ✓ Connected successfully
[Socket] Socket ID: xxx...
[Collaboration] Socket connected, joining room: problem-1
[Collaboration] join-room response: {ok: true, users: [...]}
```

**NO MORE Mixed Content errors!**

---

## Auto-Renew SSL Certificate

Let's Encrypt certs expire in 90 days. Auto-renew:

```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
sudo systemctl list-timers --all | grep certbot
```

Or manual renewal:

```bash
sudo certbot renew --quiet
```

---

## Summary of Changes

| Component | Change | Why |
|-----------|--------|-----|
| Nginx | Reverse proxy with SSL | Encrypts traffic HTTPS→WSS |
| SSL Cert | Let's Encrypt | Trusted by browsers |
| `CORS_ORIGIN` | `https://vercel-domain` | Backend allows Vercel frontend |
| `NEXT_PUBLIC_SOCKET_URL` | `https://api.domain` | Frontend connects via WSS |
| Security Group | Open 80, 443 | Allow HTTP/HTTPS traffic |

---

## Troubleshooting

**Still getting Mixed Content error?**
- Check `NEXT_PUBLIC_SOCKET_URL` is https (not http or ws)
- Redeploy Vercel after env change
- Hard refresh browser (Ctrl+Shift+R)

**Connection timeout?**
- Verify Nginx is running: `sudo systemctl status nginx`
- Check backend: `docker compose logs backend`
- Verify ports 80/443 open: `sudo netstat -tlnp | grep nginx`

**SSL certificate errors?**
- For self-signed: add `rejectUnauthorized: false` in lib/socket.ts (dev only!)
- For Let's Encrypt: run `sudo certbot renew --force-renewal`

**CORS errors?**
- Verify `CORS_ORIGIN` in backend `.env` matches your Vercel domain
- Restart backend: `docker compose restart backend`

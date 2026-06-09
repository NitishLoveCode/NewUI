# SSL/TLS Setup - Quick Start Guide

## Root Cause
**Mixed Content Error**: Your Vercel frontend (HTTPS) tried connecting to Socket.IO via `ws://` (unencrypted). Browsers block this for security.

**Solution**: Nginx reverse proxy + SSL/TLS = secure `wss://` connection

---

## Your Action Items

### 1. Get a Domain (Required)
You NEED a domain for Let's Encrypt SSL. Options:

- **Use Route53** (AWS) - if you have one
- **Buy cheap domain**: GoDaddy/Namecheap (~$3-5/year)
- **Create subdomain**: `api.yourdomain.com` → `13.203.206.210` (A record)

Let's assume you use: `api.yourdomain.com`

---

### 2. SSH to EC2
```bash
ssh -i your-key.pem ubuntu@13.203.206.210
sudo su -
```

---

### 3. Update Security Group
Add inbound rules for ports **80** and **443**:
- Port 80 (HTTP) → 0.0.0.0/0
- Port 443 (HTTPS) → 0.0.0.0/0

---

### 4. Install Nginx & SSL
```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

### 5. Get SSL Certificate (Let's Encrypt)
```bash
sudo certbot certonly --nginx -d api.yourdomain.com
# Follow the prompts, certificate will be installed automatically
```

---

### 6. Configure Nginx
**Copy and paste this entire block:**

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

    # SSL certificates (Let's Encrypt)
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

### 7. Update Backend CORS
```bash
cd ~/casino-dashboard-ui/nodeServer
nano .env
```

Change `CORS_ORIGIN`:
```
CORS_ORIGIN=https://new-ui-jade.vercel.app
```

Save (Ctrl+X, Y, Enter)

Restart backend:
```bash
docker compose down
docker compose up -d --build
```

---

### 8. Update Vercel Environment Variables

**Go to Vercel Dashboard:**
1. Select your project
2. Settings → Environment Variables
3. Add/Update:
   ```
   NEXT_PUBLIC_SOCKET_URL = https://api.yourdomain.com
   NEXT_PUBLIC_BACKEND_URL = https://api.yourdomain.com
   ```
4. Click "Save"
5. Redeploy from Git (or manually trigger)

---

### 9. Test Everything

**Test backend health:**
```bash
curl https://api.yourdomain.com/health
# Should return: {"status":"ok"}
```

**Test in browser:**
1. Open https://new-ui-jade.vercel.app/coding-practice
2. Press F12 → Console
3. Click "Connect with Partner"
4. You should see:
   ```
   [Socket] Initializing Socket.IO client...
   [Socket] Target URL: https://api.yourdomain.com
   [Socket] ✓ Connected successfully
   [Socket] Socket ID: ...
   ```

**NO MORE Mixed Content errors!**

---

## Nginx Logs (Debugging)
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Backend Logs (Debugging)
```bash
cd ~/casino-dashboard-ui/nodeServer
docker compose logs -f backend
```

---

## Summary

| Step | What | Status |
|------|------|--------|
| Domain | Get api.yourdomain.com | ⏳ You do this |
| Nginx | Install & configure | ⏳ You do this |
| SSL | Let's Encrypt cert | ⏳ You do this |
| CORS | Update backend .env | ⏳ You do this |
| Vercel | Set env vars | ⏳ You do this |
| Test | Verify connection | ⏳ You do this |

Once done, Socket.IO will work perfectly over secure WSS! 🔒

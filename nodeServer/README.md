# Collab Code Server

Production-ready Node.js backend for a real-time collaborative coding platform. Provides:

- **Code execution** via [Piston](https://github.com/engineer-man/piston) sandboxed in Docker
- **Real-time collaboration** via Socket.IO (rooms, code-change broadcast, chat, cursors)
- **WebRTC signaling** for 1-to-1 video calls (offer / answer / ice-candidate)

## Project structure

```
nodeServer/
├── src/
│   ├── controllers/
│   │   └── codeController.js
│   ├── routes/
│   │   ├── codeRoutes.js
│   │   └── healthRoutes.js
│   ├── sockets/
│   │   ├── index.js
│   │   ├── roomHandler.js
│   │   └── webrtcHandler.js
│   ├── services/
│   │   └── pistonService.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   └── validator.js
│   ├── utils/
│   │   ├── logger.js
│   │   └── sanitizer.js
│   ├── app.js
│   └── server.js
├── scripts/
│   └── install-piston-packages.sh
├── docker-compose.yml
├── Dockerfile
├── package.json
└── .env.example
```

## REST endpoints

### `POST /api/run-code`

```json
{
  "language": "python",
  "code": "print('Hello World')"
}
```

Response:

```json
{
  "output": "Hello World",
  "time": "0.12s",
  "memory": "20MB",
  "cpu_usage": "N/A",
  "status": "success",
  "error": null
}
```

`status` will be one of `success`, `error`, `compile_error`. On error, `error` contains stderr or compile output.

Optional fields: `stdin` (string), `version` (e.g. `"3.10.0"`), `args` (string[]).

### `GET /api/runtimes`
List all installed Piston language runtimes.

### `GET /health`
Liveness + Piston connectivity check.

## Socket.IO events

Client → Server:

| Event           | Payload                                                       |
|-----------------|---------------------------------------------------------------|
| `join-room`     | `{ roomId, userId?, username? }` (ack with `{ ok, users }`)   |
| `leave-room`    | `{ roomId }`                                                  |
| `code-change`   | `{ roomId, code, language?, cursor?, version? }`              |
| `cursor-change` | `{ roomId, cursor, selection? }`                              |
| `chat-message`  | `{ roomId, message }`                                         |
| `offer`         | `{ target, roomId, sdp }` — WebRTC                            |
| `answer`        | `{ target, roomId, sdp }` — WebRTC                            |
| `ice-candidate` | `{ target, roomId, candidate }` — WebRTC                      |
| `call-end`      | `{ target }`                                                  |

Server → Client:

| Event           | Payload                                                       |
|-----------------|---------------------------------------------------------------|
| `connected`     | `{ socketId }`                                                |
| `user-joined`   | `{ roomId, socketId, userId, username, users[] }`             |
| `user-left`     | `{ roomId, socketId, userId, username, users[] }`             |
| `code-change`   | `{ roomId, socketId, userId, code, language?, cursor?, ... }` |
| `cursor-change` | `{ roomId, socketId, userId, cursor, selection? }`            |
| `chat-message`  | `{ roomId, socketId, userId, username, message, timestamp }`  |
| `offer` / `answer` / `ice-candidate` / `call-end` | mirrored to `target`            |

## Local development

```bash
cd nodeServer
cp .env.example .env
docker compose up -d --build
# install language packs (one-time, cached in piston_packages volume)
./scripts/install-piston-packages.sh http://localhost:2000
curl http://localhost:3000/health
```

Test code execution:

```bash
curl -X POST http://localhost:3000/api/run-code \
  -H "Content-Type: application/json" \
  -d '{"language":"python","code":"print(\"Hello World\")"}'
```

## Security

- Piston runs in a sandboxed container with `PISTON_DISABLE_NETWORKING=true`
- Per-execution CPU + memory limits (`PISTON_MAX_MEMORY_BYTES`, run/compile timeouts)
- Input validation via Joi; stricter rate limit on `/api/run-code`
- Helmet security headers, strict CORS, `express.json` body size cap
- Code length capped at 100 KB per request

## Configuration (.env)

| Variable                     | Default               | Notes                                  |
|------------------------------|-----------------------|----------------------------------------|
| `PORT`                       | `3000`                | Backend HTTP port                      |
| `PISTON_URL`                 | `http://piston:2000`  | Internal compose hostname              |
| `PISTON_RUN_TIMEOUT_MS`      | `5000`                | Per-execution wall-time cap            |
| `PISTON_COMPILE_TIMEOUT_MS`  | `10000`               | Compile-step cap                       |
| `PISTON_MAX_MEMORY_BYTES`    | `104857600` (100 MB)  | Per-process memory cap                 |
| `CORS_ORIGIN`                | `*`                   | Comma-separated origins or `*`         |
| `RATE_LIMIT_MAX`             | `60`                  | Global requests / window               |
| `RUN_CODE_RATE_LIMIT_MAX`    | `20`                  | `/api/run-code` requests / window      |
| `LOG_LEVEL`                  | `info`                | winston level                          |

---

## AWS EC2 deployment guide (Ubuntu 22.04)

### 1. Launch EC2 instance

- AMI: **Ubuntu Server 22.04 LTS**
- Type: `t3.medium` minimum (Piston compiles language toolchains; needs RAM)
- Storage: ≥ 20 GB (Piston packages can be large)
- Security group inbound rules:

  | Port  | Protocol | Source        | Purpose                  |
  |-------|----------|---------------|--------------------------|
  | 22    | TCP      | Your IP       | SSH                      |
  | 3000  | TCP      | 0.0.0.0/0     | Backend API + Socket.IO  |
  | 80    | TCP      | 0.0.0.0/0     | (optional) Nginx HTTP    |
  | 443   | TCP      | 0.0.0.0/0     | (optional) Nginx HTTPS   |

  Do **not** expose port `2000` (Piston) publicly — it's only accessed by the backend over the internal Docker network. Open it temporarily only if you need to install language packages from outside.

### 2. SSH in and install Docker

```bash
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>

sudo apt update && sudo apt upgrade -y
sudo apt install -y ca-certificates curl gnupg git ufw

# Docker official repo
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release; echo $VERSION_CODENAME) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

sudo usermod -aG docker $USER
newgrp docker

docker --version
docker compose version
```

### 3. Clone the project

```bash
git clone <your-repo-url> casino-dashboard-ui
cd casino-dashboard-ui/nodeServer
cp .env.example .env
# Edit CORS_ORIGIN, rate limits, etc. as needed:
nano .env
```

### 4. Start the stack

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f backend
```

Wait for both `backend` and `piston` to be healthy.

### 5. Install language packages (one-time)

Piston ships empty by default. Install the languages you need:

```bash
chmod +x scripts/install-piston-packages.sh
./scripts/install-piston-packages.sh http://localhost:2000
```

Edit the `PACKAGES` list in that script to add/remove languages. They are cached in the `piston_packages` Docker volume and persist across restarts.

### 6. Smoke-test

```bash
curl http://localhost:3000/health
curl -X POST http://localhost:3000/api/run-code \
  -H "Content-Type: application/json" \
  -d '{"language":"python","code":"print(\"hi from EC2\")"}'
```

From your laptop:

```bash
curl http://<EC2_PUBLIC_IP>:3000/health
```

### 7. (Optional) Reverse-proxy with Nginx + HTTPS

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
sudo tee /etc/nginx/sites-available/collab <<'EOF'
server {
  listen 80;
  server_name api.example.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 60s;
  }
}
EOF
sudo ln -s /etc/nginx/sites-available/collab /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d api.example.com
```

The `Upgrade` / `Connection` headers above are required for Socket.IO WebSockets.

After Nginx is in place you can close port `3000` in the security group and serve everything on `443`.

### 8. Updates

```bash
cd ~/casino-dashboard-ui
git pull
cd nodeServer
docker compose build backend
docker compose up -d
```

### 9. Logs and ops

```bash
docker compose logs -f backend
docker compose logs -f piston
docker stats
docker compose restart backend
docker compose down
```

### Troubleshooting

- **`Unsupported language` on every request** — you haven't installed any Piston packages yet. Run `scripts/install-piston-packages.sh`.
- **`Cannot reach code execution engine`** — Piston container isn't healthy yet (first boot can take 30–60s). Check `docker compose logs piston`.
- **Out-of-memory on small instances** — drop `PISTON_MAX_MEMORY_BYTES` or use a larger instance type.
- **CORS errors from frontend** — set `CORS_ORIGIN=https://your-frontend.com` in `.env` and restart the backend.

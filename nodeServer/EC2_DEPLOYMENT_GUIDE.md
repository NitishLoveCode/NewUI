# EC2 Deployment Guide - NodeServer Backend

Complete end-to-end setup guide for deploying the collaborative coding backend to AWS EC2.

---

## 📋 Prerequisites

- AWS account with EC2 access
- EC2 instance (Ubuntu 22.04 LTS recommended)
- SSH key pair (.pem file)
- Domain name (optional, for HTTPS)

---

## 🚀 Part 1: EC2 Instance Setup

### 1.1 Launch EC2 Instance

**Instance Configuration:**
- **AMI**: Ubuntu Server 22.04 LTS (64-bit x86)
- **Instance Type**: `t3.medium` or larger (Piston needs 2GB+ RAM)
- **Storage**: 20 GB minimum (30 GB recommended for language packages)
- **Key Pair**: Create or use existing `.pem` file

**Security Group Rules:**

| Type  | Protocol | Port Range | Source      | Description            |
|-------|----------|------------|-------------|------------------------|
| SSH   | TCP      | 22         | Your IP     | SSH access             |
| HTTP  | TCP      | 80         | 0.0.0.0/0   | HTTP (optional Nginx)  |
| HTTPS | TCP      | 443        | 0.0.0.0/0   | HTTPS (optional Nginx) |
| Custom| TCP      | 3000       | 0.0.0.0/0   | Backend API/Socket.IO  |

> ⚠️ **Security Note**: Do NOT expose port 2000 (Piston) publicly. It's internal-only within Docker network.

### 1.2 Connect to EC2 Instance

```bash
# Set correct permissions for your key file
chmod 400 your-key.pem

# Connect via SSH
ssh -i your-key.pem ubuntu@<YOUR_EC2_PUBLIC_IP>
```

Replace `<YOUR_EC2_PUBLIC_IP>` with your EC2 instance's public IP address.

---

## 🔧 Part 2: Install Required Software

### 2.1 Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
```

### 2.2 Install Essential Tools

```bash
sudo apt install -y ca-certificates curl gnupg git ufw
```

### 2.3 Install Docker

```bash
# Create directory for Docker GPG key
sudo install -m 0755 -d /etc/apt/keyrings

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set correct permissions
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package index
sudo apt update

# Install Docker Engine, CLI, containerd, and Docker Compose plugin
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### 2.4 Configure Docker Permissions

```bash
# Add current user to docker group
sudo usermod -aG docker $USER

# Apply group changes without logout
newgrp docker

# Verify Docker installation
docker --version
docker compose version
```

Expected output:
```
Docker version 24.x.x, build xxxxxxx
Docker Compose version v2.x.x
```

---

## 📦 Part 3: Deploy the Application

### 3.1 Clone Repository

```bash
# Clone your repository
git clone https://github.com/NitishLoveCode/NewUI.git
cd NewUI/nodeServer
```

### 3.2 Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit environment variables
nano .env
```

**Recommended Production Configuration:**

```bash
# Server
PORT=3000
NODE_ENV=production

# Piston (code execution engine)
PISTON_URL=http://piston:2000
PISTON_TIMEOUT_MS=10000
PISTON_MAX_MEMORY_BYTES=104857600
PISTON_RUN_TIMEOUT_MS=5000
PISTON_COMPILE_TIMEOUT_MS=10000

# CORS - Set to your frontend URL
3CORS_ORIGIN=https://your-frontend-domain.com
# Or allow all (not recommended for production)
 CORS_ORIGIN=*

# Rate limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=60
RUN_CODE_RATE_LIMIT_MAX=20

# Logging
LOG_LEVEL=info
```

**Important Settings:**
- `CORS_ORIGIN`: Set to your frontend domain (e.g., `https://yourdomain.com`) or comma-separated list
- `NODE_ENV`: Set to `production` for production deployment
- Keep `PISTON_URL=http://piston:2000` (internal Docker network)

Save and exit (Ctrl+X, then Y, then Enter)

### 3.3 Build and Start Docker Containers

```bash
# Build and start all containers in detached mode
docker compose up -d --build
```

This will:
1. Pull the Piston Docker image
2. Build your backend container
3. Start both containers
4. Create necessary Docker networks and volumes

### 3.4 Verify Containers are Running

```bash
# Check container status
docker compose ps
```

Expected output:
```
NAME              IMAGE                             STATUS
collab-backend    collab-code-backend:latest       Up (healthy)
piston            ghcr.io/engineer-man/piston      Up (healthy)
```

```bash
# View logs (press Ctrl+C to exit)
docker compose logs -f backend

# View Piston logs
docker compose logs -f piston
```

---

## 🎯 Part 4: Install Language Packages

Piston ships with no language runtimes installed. You must install them separately.

### 4.1 Make Install Script Executable

```bash
chmod +x scripts/install-piston-packages.sh
```

### 4.2 Install Language Packages

```bash
# Install default packages (Python, JavaScript, Java)
./scripts/install-piston-packages.sh http://localhost:2000
```

**To customize installed languages**, edit `scripts/install-piston-packages.sh`:

```bash
nano scripts/install-piston-packages.sh
```

Modify the `PACKAGES` section:
```bash
PACKAGES="
python=3.10.0
javascript=18.15.0
java=15.0.2
cpp=10.2.0
c=10.2.0
go=1.16.2
rust=1.68.2
typescript=5.0.3
"
```

Then re-run the install script.

### 4.3 Verify Installed Runtimes

```bash
curl http://localhost:3000/api/runtimes
```

---

## ✅ Part 5: Testing the Deployment

### 5.1 Health Check

```bash
# Test health endpoint
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-06-08T...",
  "uptime": 123.45,
  "piston": "connected"
}
```

### 5.2 Test Code Execution

```bash
# Test Python execution
curl -X POST http://localhost:3000/api/run-code \
  -H "Content-Type: application/json" \
  -d '{"language":"python","code":"print(\"Hello from EC2!\")"}'
```

Expected response:
```json
{
  "output": "Hello from EC2!",
  "time": "0.05s",
  "memory": "8MB",
  "cpu_usage": "N/A",
  "status": "success",
  "error": null
}
```

```bash
# Test JavaScript execution
curl -X POST http://localhost:3000/api/run-code \
  -H "Content-Type: application/json" \
  -d '{"language":"javascript","code":"console.log(\"Node.js works!\")"}'
```

### 5.3 Test from External Machine

From your local machine:

```bash
# Replace with your EC2 public IP
curl http://<YOUR_EC2_PUBLIC_IP>:3000/health

# Test code execution
curl -X POST http://<YOUR_EC2_PUBLIC_IP>:3000/api/run-code \
  -H "Content-Type: application/json" \
  -d '{"language":"python","code":"print(\"Remote test successful!\")"}'
```

---

## 🔒 Part 6: Optional - Setup Nginx Reverse Proxy with HTTPS

### 6.1 Install Nginx and Certbot

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 6.2 Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/collab
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;  # Replace with your domain

    # Increase body size limit for code submissions
    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        
        # Required for Socket.IO WebSocket upgrade
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Standard proxy headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/collab /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 6.3 Setup SSL Certificate with Let's Encrypt

```bash
# Obtain and install SSL certificate
sudo certbot --nginx -d api.yourdomain.com
```

Follow the prompts:
- Enter your email address
- Agree to terms of service
- Choose whether to redirect HTTP to HTTPS (recommended: Yes)

### 6.4 Update Security Group

After Nginx setup, you can:
1. Remove port 3000 from Security Group (only allow 80 and 443)
2. Access your API via: `https://api.yourdomain.com`

### 6.5 Update Frontend CORS Configuration

Update `.env` file:
```bash
CORS_ORIGIN=https://your-frontend-domain.com
```

Restart containers:
```bash
docker compose restart backend
```

---

## 🔄 Part 7: Updates and Maintenance

### 7.1 Update Application Code

```bash
cd ~/NewUI
git pull origin main
cd nodeServer
docker compose build backend
docker compose up -d
```

### 7.2 View Logs

```bash
# Follow backend logs
docker compose logs -f backend

# View last 100 lines
docker compose logs --tail=100 backend

# View Piston logs
docker compose logs -f piston
```

### 7.3 Restart Services

```bash
# Restart backend only
docker compose restart backend

# Restart all services
docker compose restart

# Stop all services
docker compose down

# Start all services
docker compose up -d
```

### 7.4 Monitor Resources

```bash
# View container resource usage
docker stats

# View disk usage
docker system df

# Clean up unused images/containers
docker system prune -a
```

---

## 🔥 Part 8: Configure Firewall (Optional but Recommended)

```bash
# Enable UFW
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw allow 3000/tcp    # Backend (if not using Nginx)

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## 🐛 Part 9: Troubleshooting

### Issue: Piston container shows "unhealthy" status or "dependency failed to start"

**Cause**: Piston health check failing (usually because `wget` or `nc` not available in container)

**Symptoms**:
```
✘ Container piston  Error dependency piston failed to start
dependency failed to start: container piston is unhealthy
```

**Solution**:

**Option 1: Verify Piston is actually working despite "unhealthy" status**
```bash
# Check if Piston is responding (often it works fine despite health check failure)
curl http://localhost:2000/api/v2/runtimes

# If you get JSON response, Piston is working! Just start backend manually:
docker compose up -d backend

# Verify both are running
docker compose ps
```

**Option 2: Fix the health check (recommended)**

The docker-compose.yml has been updated to use a simpler health check and relaxed dependency. Pull latest changes:

```bash
cd ~/NewUI
git pull origin main
cd nodeServer
docker compose down
docker compose up -d --build
```

**Option 3: Remove health check entirely**

Edit `docker-compose.yml` and comment out the entire `healthcheck` section under piston service, then change backend dependency:

```yaml
depends_on:
  piston:
    condition: service_started  # Changed from service_healthy
```

Then restart:
```bash
docker compose down
docker compose up -d --build
```

### Issue: "Unsupported language" error

**Cause**: Language packages not installed in Piston

**Solution**:
```bash
cd ~/NewUI/nodeServer
./scripts/install-piston-packages.sh http://localhost:2000
```

### Issue: "Cannot reach code execution engine"

**Cause**: Piston container not healthy or not started

**Solution**:
```bash
# Check container status
docker compose ps

# View Piston logs
docker compose logs piston

# Restart Piston
docker compose restart piston

# Wait 30-60 seconds for startup
sleep 30
curl http://localhost:3000/health
```

### Issue: CORS errors from frontend

**Cause**: CORS_ORIGIN not configured correctly

**Solution**:
```bash
nano .env
# Set: CORS_ORIGIN=https://your-frontend-domain.com
docker compose restart backend
```

### Issue: Out of memory errors

**Cause**: Instance too small or memory limits too high

**Solution**:
```bash
# Reduce memory limit in .env
nano .env
# Set: PISTON_MAX_MEMORY_BYTES=52428800  # 50MB instead of 100MB

docker compose restart backend
```

Or upgrade to larger instance (t3.large or t3.xlarge)

### Issue: Port 3000 already in use

**Solution**:
```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill the process
sudo kill -9 <PID>

# Or change port in .env
nano .env
# Set: PORT=3001
# Also update docker-compose.yml ports mapping
```

### Issue: Docker permission denied

**Solution**:
```bash
sudo usermod -aG docker $USER
newgrp docker
# Or logout and login again
```

---

## 📊 Part 10: Monitoring and Logs

### Check Application Health

```bash
# Health endpoint
curl http://localhost:3000/health

# Get installed runtimes
curl http://localhost:3000/api/runtimes

# Test code execution
curl -X POST http://localhost:3000/api/run-code \
  -H "Content-Type: application/json" \
  -d '{"language":"python","code":"print(\"test\")"}'
```

### View Logs

```bash
# All logs
docker compose logs

# Backend logs only
docker compose logs backend

# Follow logs in real-time
docker compose logs -f backend

# Last 50 lines
docker compose logs --tail=50 backend
```

### Monitor System Resources

```bash
# Container stats
docker stats

# Disk usage
df -h
docker system df

# Memory usage
free -h

# CPU usage
top
```

---

## 🎉 Part 11: Verification Checklist

Before going live, verify:

- [ ] EC2 instance running and accessible via SSH
- [ ] Docker and Docker Compose installed
- [ ] Repository cloned successfully
- [ ] `.env` file configured with correct values
- [ ] Docker containers running (`docker compose ps`)
- [ ] Language packages installed in Piston
- [ ] Health endpoint returns success: `curl http://localhost:3000/health`
- [ ] Code execution works: Test Python, JavaScript, Java
- [ ] External access works: `curl http://<EC2_IP>:3000/health`
- [ ] Security group configured correctly
- [ ] CORS configured for your frontend domain
- [ ] (Optional) Nginx reverse proxy configured
- [ ] (Optional) SSL certificate installed and working
- [ ] Logs show no errors: `docker compose logs backend`

---

## 📚 Additional Resources

- **GitHub Repository**: https://github.com/NitishLoveCode/NewUI.git
- **Piston Documentation**: https://github.com/engineer-man/piston
- **Socket.IO Documentation**: https://socket.io/docs/v4/
- **Docker Compose Documentation**: https://docs.docker.com/compose/

---

## 🆘 Support

For issues or questions:
1. Check logs: `docker compose logs backend`
2. Review troubleshooting section above
3. Check GitHub repository issues
4. Verify all environment variables are set correctly

---

## 📝 Quick Command Reference

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f backend

# Restart backend
docker compose restart backend

# Rebuild and restart
docker compose up -d --build

# Check status
docker compose ps

# Update code
git pull && docker compose up -d --build

# View health
curl http://localhost:3000/health

# Test code execution
curl -X POST http://localhost:3000/api/run-code \
  -H "Content-Type: application/json" \
  -d '{"language":"python","code":"print(\"test\")"}'
```

---

**Deployment Complete! 🚀**

Your collaborative coding backend is now live on EC2 and ready to handle code execution requests and real-time Socket.IO connections.

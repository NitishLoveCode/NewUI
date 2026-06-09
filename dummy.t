I need you to fix my Socket.IO deployment issue.

## Current Setup

* Frontend: Next.js deployed on Vercel
* Backend: Node.js + Socket.IO running on an AWS EC2 instance
* Frontend URL is served over **HTTPS**
* Socket.IO server is currently being accessed using:

```text
ws://13.203.206.210:3000
```

## Current Error

The browser console shows:

```text
Mixed Content: The page at 'https://new-ui-jade.vercel.app/...'
was loaded over HTTPS,
but attempted to connect to the insecure WebSocket endpoint
'ws://13.203.206.210:3000/socket.io/?EIO=4&transport=websocket'.

This request has been blocked;
this endpoint must be available over WSS.
```

There are also repeated retries because the socket connection cannot be established.

## Required Fix

Please configure the deployment so that Socket.IO works securely over HTTPS.

Requirements:

1. Do NOT use `ws://`.
2. Configure SSL/TLS and use `wss://` (or `https://` with Socket.IO so it upgrades automatically).
3. If necessary:

   * Configure Nginx as a reverse proxy.
   * Forward WebSocket upgrade headers correctly.
   * Proxy `/socket.io/` to the Node.js application running on port `3000`.
4. If a domain is required, configure one (for example `socket.example.com`) and install a Let's Encrypt certificate.
5. Update the frontend environment variables or configuration so the client connects to the secure endpoint instead of `ws://13.203.206.210:3000`.
6. Ensure CORS is configured correctly for the Vercel frontend origin.
7. Verify that WebSocket connections succeed and no Mixed Content errors remain.
8. Preserve all existing Socket.IO functionality.

## Also check

* Any hardcoded `ws://` URLs in the frontend.
* Any hardcoded `http://` URLs in environment variables.
* Socket.IO server configuration.
* Nginx reverse proxy configuration.
* Security group and firewall rules for ports 80 and 443.
* PM2 or Docker configuration if applicable.

After fixing, provide:

* The updated frontend configuration.
* The updated backend/Socket.IO configuration.
* The Nginx configuration.
* Any environment variable changes made.
* A brief explanation of what caused the issue and how it was resolved.

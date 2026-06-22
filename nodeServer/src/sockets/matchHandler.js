'use strict';

/**
 * matchHandler.js
 * ----------------------------------------------------------------------------
 * Omegle-style 1-to-1 anonymous matchmaking over Socket.IO.
 *
 * Responsibilities (strictly separated):
 *   1. Queue management   — global FIFO waiting list, dedup, removal
 *   2. Room creation      — pair the two oldest waiters into a private room
 *   3. Signaling relay    — proxy WebRTC + chat between exactly two peers
 *   4. Disconnect/skip    — tear down room, notify partner, requeue partner
 *
 * Design notes:
 *   - Node.js executes JS on a single event-loop thread, so "thread-safety" is
 *     achieved by keeping every queue/room mutation purely synchronous (no
 *     awaits inside the critical section).  A boolean lock guards re-entrant
 *     calls into `tryMatch` while it is iterating.
 *   - All matching is FIFO and automatic.  Clients cannot pick a partner or
 *     join an arbitrary room.
 *   - The server NEVER sees media; it only relays SDP + ICE.
 * ----------------------------------------------------------------------------
 */

const crypto = require('crypto');
const logger = require('../utils/logger');

// ---------------------------------------------------------------------------
// State (module-level singletons — one matchmaker per Node process)
// ---------------------------------------------------------------------------

/** @type {string[]} FIFO queue of socket ids waiting for a partner. */
const waitingQueue = [];

/** @type {Set<string>} Mirrors `waitingQueue` for O(1) dedup checks. */
const queuedSet = new Set();

/**
 * Active pairings.
 * @type {Map<string, { roomId: string, partnerId: string }>}
 *   key   = socket.id
 *   value = the room it lives in + its partner's socket.id
 */
const activePairs = new Map();

/** Re-entrancy guard for `tryMatch`. */
let matching = false;

// ---------------------------------------------------------------------------
// Queue management
// ---------------------------------------------------------------------------

/**
 * Adds a socket to the back of the waiting queue.
 * No-op if the socket is already queued or already paired.
 * Returns true if newly enqueued.
 */
function enqueue(socketId) {
  if (queuedSet.has(socketId)) return false;
  if (activePairs.has(socketId)) return false;
  waitingQueue.push(socketId);
  queuedSet.add(socketId);
  return true;
}

/** Removes a socket from the queue (anywhere in it). */
function removeFromQueue(socketId) {
  if (!queuedSet.has(socketId)) return false;
  const idx = waitingQueue.indexOf(socketId);
  if (idx !== -1) waitingQueue.splice(idx, 1);
  queuedSet.delete(socketId);
  return true;
}

// ---------------------------------------------------------------------------
// Room lifecycle
// ---------------------------------------------------------------------------

function newRoomId() {
  // 16 hex chars is plenty of entropy for an ephemeral room.
  return `m_${crypto.randomBytes(8).toString('hex')}`;
}

/**
 * Pairs two sockets into a fresh private room and notifies both.
 * Caller must have already verified both sockets are connected and free.
 *
 * One peer is flagged `isInitiator: true` — that side is expected to create
 * the WebRTC offer.  This avoids glare without any extra round-trip.
 */
function createPair(io, aId, bId) {
  const a = io.sockets.sockets.get(aId);
  const b = io.sockets.sockets.get(bId);
  if (!a || !b) return false;

  const roomId = newRoomId();

  a.join(roomId);
  b.join(roomId);

  activePairs.set(aId, { roomId, partnerId: bId });
  activePairs.set(bId, { roomId, partnerId: aId });

  // Deterministic initiator: the socket that has been waiting longer (a) starts.
  a.emit('matched', { roomId, partnerId: bId, isInitiator: true });
  b.emit('matched', { roomId, partnerId: aId, isInitiator: false });

  logger.info('Matchmaker paired sockets', { roomId, a: aId, b: bId });
  return true;
}

/**
 * Dissolves a room (if any) that `socketId` belongs to.
 *
 * @param  io               Socket.IO server instance
 * @param  socketId         The socket whose room we're tearing down
 * @param  reason           'left' | 'skipped' (sent to the partner)
 * @param  requeuePartner   If true, the still-connected partner is pushed back
 *                          onto the FIFO queue and `tryMatch` is invoked.
 * @returns the partner's socket id, or null if there was no active pair.
 */
function dissolveRoom(io, socketId, reason, requeuePartner) {
  const pair = activePairs.get(socketId);
  if (!pair) return null;

  const { roomId, partnerId } = pair;

  // Remove both sides from the pair map BEFORE emitting / requeueing so that
  // any reentrant calls (e.g. partner also disconnecting in the same tick)
  // see a consistent state.
  activePairs.delete(socketId);
  activePairs.delete(partnerId);

  const self = io.sockets.sockets.get(socketId);
  const partner = io.sockets.sockets.get(partnerId);

  if (self) self.leave(roomId);
  if (partner) partner.leave(roomId);

  if (partner) {
    partner.emit('partner_disconnected', { roomId, reason });
    if (requeuePartner) {
      enqueue(partnerId);
    }
  }

  logger.info('Matchmaker dissolved room', { roomId, by: socketId, reason });
  return partnerId;
}

// ---------------------------------------------------------------------------
// Matching loop
// ---------------------------------------------------------------------------

/**
 * Greedy FIFO matcher.  Pulls pairs off the head of the queue as long as at
 * least two valid sockets are available.  A simple boolean guard prevents
 * re-entrant invocations from interleaving (e.g. when `createPair` triggers
 * a listener that calls back into the matcher).
 */
function tryMatch(io) {
  if (matching) return;
  matching = true;
  try {
    while (waitingQueue.length >= 2) {
      const aId = waitingQueue.shift();
      queuedSet.delete(aId);

      // Validate `a` is still connected and unpaired.
      if (!io.sockets.sockets.get(aId) || activePairs.has(aId)) continue;

      const bId = waitingQueue.shift();
      queuedSet.delete(bId);

      if (!io.sockets.sockets.get(bId) || activePairs.has(bId)) {
        // `b` is gone — put `a` back at the front so it keeps its place.
        waitingQueue.unshift(aId);
        queuedSet.add(aId);
        continue;
      }

      const ok = createPair(io, aId, bId);
      if (!ok) {
        // Pairing failed mid-flight (rare). Requeue whichever side is alive.
        if (io.sockets.sockets.get(aId)) {
          waitingQueue.unshift(aId);
          queuedSet.add(aId);
        }
        if (io.sockets.sockets.get(bId)) {
          waitingQueue.push(bId);
          queuedSet.add(bId);
        }
      }
    }
  } finally {
    matching = false;
  }
}

// ---------------------------------------------------------------------------
// Signaling relay helpers
// ---------------------------------------------------------------------------

/**
 * Returns the partner socket for `socket` if and only if `roomId` matches the
 * active pair.  This single guard prevents:
 *   - signaling to strangers
 *   - signaling into a stale room after a disconnect
 *   - any group-broadcast attack via spoofed roomIds
 */
function getPartner(socket, roomId) {
  const pair = activePairs.get(socket.id);
  if (!pair) return null;
  if (roomId && pair.roomId !== roomId) return null;
  return pair;
}

// ---------------------------------------------------------------------------
// Public: handler registration
// ---------------------------------------------------------------------------

function registerMatchHandlers(io, socket) {
  // -- join_queue ----------------------------------------------------------
  socket.on('join_queue', (_payload = {}, ack) => {
    // If the socket is already paired, ignore — they must `skip` first.
    if (activePairs.has(socket.id)) {
      if (typeof ack === 'function') ack({ ok: false, error: 'already_paired' });
      return;
    }

    const added = enqueue(socket.id);
    if (typeof ack === 'function') {
      ack({ ok: true, queued: added, position: waitingQueue.indexOf(socket.id) + 1 });
    }
    socket.emit('queued', { position: waitingQueue.indexOf(socket.id) + 1 });

    tryMatch(io);
  });

  // -- leave_queue ---------------------------------------------------------
  socket.on('leave_queue', (_payload, ack) => {
    const removed = removeFromQueue(socket.id);
    if (typeof ack === 'function') ack({ ok: true, removed });
  });

  // -- skip ----------------------------------------------------------------
  // Tear down the current room and immediately requeue BOTH sides so each
  // gets matched with someone new in FIFO order.
  socket.on('skip', (_payload, ack) => {
    const pair = activePairs.get(socket.id);
    if (!pair) {
      // Not in a room — treat as a fresh join_queue.
      enqueue(socket.id);
      tryMatch(io);
      if (typeof ack === 'function') ack({ ok: true, requeued: true });
      return;
    }

    // dissolveRoom puts the partner back on the queue; we requeue ourselves
    // afterwards so the partner sits ahead of us (they didn't initiate skip).
    dissolveRoom(io, socket.id, 'skipped', /* requeuePartner */ true);
    enqueue(socket.id);

    if (typeof ack === 'function') ack({ ok: true });
    tryMatch(io);
  });

  // -- WebRTC signaling relay ---------------------------------------------
  socket.on('webrtc_offer', (payload = {}) => {
    const pair = getPartner(socket, payload.roomId);
    if (!pair || !payload.sdp) return;
    io.to(pair.partnerId).emit('webrtc_offer', {
      from: socket.id,
      roomId: pair.roomId,
      sdp: payload.sdp,
    });
  });

  socket.on('webrtc_answer', (payload = {}) => {
    const pair = getPartner(socket, payload.roomId);
    if (!pair || !payload.sdp) return;
    io.to(pair.partnerId).emit('webrtc_answer', {
      from: socket.id,
      roomId: pair.roomId,
      sdp: payload.sdp,
    });
  });

  socket.on('webrtc_ice_candidate', (payload = {}) => {
    const pair = getPartner(socket, payload.roomId);
    if (!pair || !payload.candidate) return;
    io.to(pair.partnerId).emit('webrtc_ice_candidate', {
      from: socket.id,
      roomId: pair.roomId,
      candidate: payload.candidate,
    });
  });

  // -- Text chat relay -----------------------------------------------------
  socket.on('chat_message', (payload = {}) => {
    const pair = getPartner(socket, payload.roomId);
    if (!pair) return;
    const text = typeof payload.message === 'string' ? payload.message.slice(0, 2000) : '';
    if (!text) return;
    io.to(pair.partnerId).emit('chat_message', {
      from: socket.id,
      roomId: pair.roomId,
      message: text,
      timestamp: Date.now(),
    });
  });
}

// ---------------------------------------------------------------------------
// Public: disconnect cleanup
// ---------------------------------------------------------------------------

/**
 * Must be invoked from the top-level `disconnect` handler.  Handles every
 * possible state the socket could have been in:
 *   - sitting in the waiting queue   → just remove
 *   - paired in a room               → notify partner + requeue partner + match
 */
function handleMatchDisconnect(io, socket) {
  removeFromQueue(socket.id);

  if (activePairs.has(socket.id)) {
    dissolveRoom(io, socket.id, 'left', /* requeuePartner */ true);
    tryMatch(io);
  }
}

// ---------------------------------------------------------------------------
// Debug / introspection (handy for /health endpoints, tests)
// ---------------------------------------------------------------------------

function getMatchmakerStats() {
  return {
    waiting: waitingQueue.length,
    activeRooms: activePairs.size / 2,
  };
}

module.exports = {
  registerMatchHandlers,
  handleMatchDisconnect,
  getMatchmakerStats,
};

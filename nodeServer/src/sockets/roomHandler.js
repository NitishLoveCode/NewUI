'use strict';

const logger = require('../utils/logger');
const { sanitizeRoomId, sanitizeUserId } = require('../utils/sanitizer');

const rooms = new Map();

function getRoomState(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, { users: new Map() });
  }
  return rooms.get(roomId);
}

function listRoomUsers(roomId) {
  const room = rooms.get(roomId);
  if (!room) return [];
  return Array.from(room.users.values()).map((u) => ({
    socketId: u.socketId,
    userId: u.userId,
    username: u.username,
  }));
}

function registerRoomHandlers(io, socket) {
  socket.data.rooms = new Set();

  socket.on('join-room', (payload = {}, ack) => {
    const roomId = sanitizeRoomId(payload.roomId);
    const userId = sanitizeUserId(payload.userId) || socket.id;
    const username =
      typeof payload.username === 'string' ? payload.username.trim().slice(0, 64) : 'Anonymous';

    if (!roomId) {
      const err = { error: 'Invalid roomId' };
      if (typeof ack === 'function') ack(err);
      return;
    }

    socket.join(roomId);
    socket.data.rooms.add(roomId);
    socket.data.userId = userId;
    socket.data.username = username;

    const room = getRoomState(roomId);
    room.users.set(socket.id, { socketId: socket.id, userId, username });

    const users = listRoomUsers(roomId);
    socket.to(roomId).emit('user-joined', {
      roomId,
      socketId: socket.id,
      userId,
      username,
      users,
    });

    logger.info('Socket joined room', { socketId: socket.id, roomId, userId });

    if (typeof ack === 'function') {
      ack({ ok: true, roomId, socketId: socket.id, users });
    }
  });

  socket.on('leave-room', (payload = {}, ack) => {
    const roomId = sanitizeRoomId(payload.roomId);
    if (!roomId) {
      if (typeof ack === 'function') ack({ error: 'Invalid roomId' });
      return;
    }
    leaveRoom(io, socket, roomId);
    if (typeof ack === 'function') ack({ ok: true });
  });

  socket.on('code-change', (payload = {}) => {
    const roomId = sanitizeRoomId(payload.roomId);
    if (!roomId || !socket.data.rooms.has(roomId)) return;

    const message = {
      roomId,
      socketId: socket.id,
      userId: socket.data.userId,
      code: typeof payload.code === 'string' ? payload.code : '',
      language: typeof payload.language === 'string' ? payload.language : undefined,
      cursor: payload.cursor,
      version: payload.version,
      timestamp: Date.now(),
    };

    socket.to(roomId).emit('code-change', message);
  });

  socket.on('cursor-change', (payload = {}) => {
    const roomId = sanitizeRoomId(payload.roomId);
    if (!roomId || !socket.data.rooms.has(roomId)) return;
    socket.to(roomId).emit('cursor-change', {
      roomId,
      socketId: socket.id,
      userId: socket.data.userId,
      cursor: payload.cursor,
      selection: payload.selection,
    });
  });

  socket.on('chat-message', (payload = {}) => {
    const roomId = sanitizeRoomId(payload.roomId);
    if (!roomId || !socket.data.rooms.has(roomId)) return;
    const message = typeof payload.message === 'string' ? payload.message.slice(0, 2000) : '';
    if (!message) return;
    // Broadcast to others only, not back to sender
    socket.to(roomId).emit('chat-message', {
      roomId,
      socketId: socket.id,
      userId: socket.data.userId,
      username: socket.data.username,
      message,
      timestamp: Date.now(),
    });
  });
}

function leaveRoom(io, socket, roomId) {
  const room = rooms.get(roomId);
  if (!room) return;

  const user = room.users.get(socket.id);
  room.users.delete(socket.id);
  socket.leave(roomId);
  socket.data.rooms.delete(roomId);

  if (room.users.size === 0) {
    rooms.delete(roomId);
  }

  if (user) {
    io.to(roomId).emit('user-left', {
      roomId,
      socketId: socket.id,
      userId: user.userId,
      username: user.username,
      users: listRoomUsers(roomId),
    });
  }

  logger.info('Socket left room', { socketId: socket.id, roomId });
}

function handleDisconnect(io, socket) {
  if (!socket.data.rooms) return;
  for (const roomId of Array.from(socket.data.rooms)) {
    leaveRoom(io, socket, roomId);
  }
}

module.exports = { registerRoomHandlers, handleDisconnect };

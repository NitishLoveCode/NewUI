'use strict';

const logger = require('../utils/logger');
const { sanitizeRoomId } = require('../utils/sanitizer');

function isValidTarget(target) {
  return typeof target === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(target);
}

function registerWebRTCHandlers(io, socket) {
  socket.on('offer', (payload = {}) => {
    const target = payload.target;
    const roomId = sanitizeRoomId(payload.roomId);
    if (!isValidTarget(target) || !payload.sdp) return;

    io.to(target).emit('offer', {
      from: socket.id,
      roomId,
      sdp: payload.sdp,
    });
    logger.debug('WebRTC offer', { from: socket.id, to: target, roomId });
  });

  socket.on('answer', (payload = {}) => {
    const target = payload.target;
    const roomId = sanitizeRoomId(payload.roomId);
    if (!isValidTarget(target) || !payload.sdp) return;

    io.to(target).emit('answer', {
      from: socket.id,
      roomId,
      sdp: payload.sdp,
    });
    logger.debug('WebRTC answer', { from: socket.id, to: target, roomId });
  });

  socket.on('ice-candidate', (payload = {}) => {
    const target = payload.target;
    const roomId = sanitizeRoomId(payload.roomId);
    if (!isValidTarget(target) || !payload.candidate) return;

    io.to(target).emit('ice-candidate', {
      from: socket.id,
      roomId,
      candidate: payload.candidate,
    });
  });

  socket.on('call-end', (payload = {}) => {
    const target = payload.target;
    if (!isValidTarget(target)) return;
    io.to(target).emit('call-end', { from: socket.id });
  });
}

module.exports = { registerWebRTCHandlers };

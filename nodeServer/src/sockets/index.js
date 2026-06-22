'use strict';

const { Server } = require('socket.io');
const logger = require('../utils/logger');
const { registerRoomHandlers, handleDisconnect } = require('./roomHandler');
const { registerWebRTCHandlers } = require('./webrtcHandler');
const { registerMatchHandlers, handleMatchDisconnect } = require('./matchHandler');

function buildCorsOrigin() {
  const raw = process.env.CORS_ORIGIN || '*';
  if (raw === '*') return '*';
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: buildCorsOrigin(),
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 30_000,
    pingInterval: 25_000,
    maxHttpBufferSize: 1e6,
  });

  io.on('connection', (socket) => {
    logger.info('Socket connected', { socketId: socket.id });

    socket.emit('connected', { socketId: socket.id });

    registerRoomHandlers(io, socket);

    // Don't use this its deprecated.
    registerWebRTCHandlers(io, socket);


    // new webrtc handle auto connect and like omigle.
    //  auto connect to random user and start webrtc. also can be used 
    // for match making. like 1v1 or group chat.
    registerMatchHandlers(io, socket); 

    socket.on('disconnect', (reason) => {
      logger.info('Socket disconnected', { socketId: socket.id, reason });
      handleDisconnect(io, socket);
      handleMatchDisconnect(io, socket);
    });

    socket.on('error', (err) => {
      logger.error('Socket error', { socketId: socket.id, message: err.message });
    });
  });

  return io;
}

module.exports = { initSocket };

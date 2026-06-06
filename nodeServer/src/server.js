'use strict';

require('dotenv').config();

const http = require('http');
const createApp = require('./app');
const { initSocket } = require('./sockets');
const logger = require('./utils/logger');

const PORT = parseInt(process.env.PORT, 10) || 3000;

const app = createApp();
const httpServer = http.createServer(app);
const io = initSocket(httpServer);

httpServer.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server listening on port ${PORT}`, {
    env: process.env.NODE_ENV || 'development',
    pistonUrl: process.env.PISTON_URL,
  });
});

function shutdown(signal) {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  io.close(() => logger.info('Socket.IO closed'));
  httpServer.close((err) => {
    if (err) {
      logger.error('Error during shutdown', { message: err.message });
      process.exit(1);
    }
    logger.info('HTTP server closed');
    process.exit(0);
  });
  setTimeout(() => {
    logger.warn('Forced shutdown after 10s');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason: reason && reason.message ? reason.message : String(reason) });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { message: err.message, stack: err.stack });
  shutdown('uncaughtException');
});

module.exports = { app, httpServer, io };

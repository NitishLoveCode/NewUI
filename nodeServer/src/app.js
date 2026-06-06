'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const logger = require('./utils/logger');
const { globalLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const codeRoutes = require('./routes/codeRoutes');
const healthRoutes = require('./routes/healthRoutes');

function buildCorsOptions() {
  const raw = process.env.CORS_ORIGIN || '*';
  if (raw === '*') {
    return { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] };
  }
  const origins = raw.split(',').map((s) => s.trim()).filter(Boolean);
  return {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (origins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  };
}

function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cors(buildCorsOptions()));
  app.use(express.json({ limit: '512kb' }));
  app.use(express.urlencoded({ extended: true, limit: '512kb' }));

  app.use(
    morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
      stream: { write: (msg) => logger.info(msg.trim()) },
    })
  );

  app.use(globalLimiter);

  app.get('/', (_req, res) => {
    res.json({
      name: 'collab-code-server',
      version: '1.0.0',
      status: 'ok',
      endpoints: {
        runCode: 'POST /api/run-code',
        runtimes: 'GET /api/runtimes',
        health: 'GET /health',
        socketio: 'ws://<host>/socket.io',
      },
    });
  });

  app.use('/health', healthRoutes);
  app.use('/api', codeRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;

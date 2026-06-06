'use strict';

const rateLimit = require('express-rate-limit');

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60_000;
const globalMax = parseInt(process.env.RATE_LIMIT_MAX, 10) || 60;
const runCodeMax = parseInt(process.env.RUN_CODE_RATE_LIMIT_MAX, 10) || 20;

const globalLimiter = rateLimit({
  windowMs,
  max: globalMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    error: 'Too many requests, please try again later.',
  },
});

const runCodeLimiter = rateLimit({
  windowMs,
  max: runCodeMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    error: 'Too many code execution requests. Please slow down.',
  },
});

module.exports = { globalLimiter, runCodeLimiter };

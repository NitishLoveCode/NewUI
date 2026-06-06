'use strict';

const logger = require('../utils/logger');

function notFoundHandler(req, res, _next) {
  res.status(404).json({
    status: 'error',
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || err.status || 500;
  const isProd = process.env.NODE_ENV === 'production';

  logger.error('Request error', {
    method: req.method,
    url: req.originalUrl,
    statusCode,
    message: err.message,
    stack: isProd ? undefined : err.stack,
  });

  res.status(statusCode).json({
    status: 'error',
    error: err.message || 'Internal Server Error',
    ...(isProd ? {} : { stack: err.stack }),
  });
}

module.exports = { errorHandler, notFoundHandler };

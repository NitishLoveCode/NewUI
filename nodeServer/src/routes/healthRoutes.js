'use strict';

const express = require('express');
const pistonService = require('../services/pistonService');

const router = express.Router();

router.get('/', async (_req, res) => {
  const piston = await pistonService.ping();
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: { piston },
  });
});

module.exports = router;

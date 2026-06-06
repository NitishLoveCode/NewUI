'use strict';

const pistonService = require('../services/pistonService');
const { sanitizeCode, sanitizeLanguage } = require('../utils/sanitizer');
const logger = require('../utils/logger');

async function runCode(req, res, next) {
  try {
    const language = sanitizeLanguage(req.body.language);
    const code = sanitizeCode(req.body.code);
    const stdin = typeof req.body.stdin === 'string' ? req.body.stdin : '';
    const version = req.body.version;
    const args = Array.isArray(req.body.args) ? req.body.args : [];

    if (!language) {
      return res.status(400).json({
        status: 'error',
        error: 'Invalid language',
        output: '',
        time: 'N/A',
        memory: 'N/A',
        cpu_usage: 'N/A',
      });
    }

    const start = Date.now();
    const result = await pistonService.executeCode({ language, code, stdin, version, args });
    logger.info('Code executed', {
      language,
      status: result.status,
      durationMs: Date.now() - start,
    });

    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

async function listRuntimes(_req, res, next) {
  try {
    const runtimes = await pistonService.getRuntimes(true);
    return res.json({ status: 'success', runtimes });
  } catch (err) {
    return next(err);
  }
}

module.exports = { runCode, listRuntimes };

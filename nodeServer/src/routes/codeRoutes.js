'use strict';

const express = require('express');
const codeController = require('../controllers/codeController');
const { runCodeLimiter } = require('../middleware/rateLimiter');
const { validate, runCodeSchema } = require('../middleware/validator');

const router = express.Router();

router.post('/run-code', runCodeLimiter, validate(runCodeSchema), codeController.runCode);
router.get('/runtimes', codeController.listRuntimes);

module.exports = router;

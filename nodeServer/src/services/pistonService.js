'use strict';

const axios = require('axios');
const logger = require('../utils/logger');

const PISTON_URL = process.env.PISTON_URL || 'http://piston:2000';
const PISTON_TIMEOUT_MS = parseInt(process.env.PISTON_TIMEOUT_MS, 10) || 10_000;
const RUN_TIMEOUT_MS = parseInt(process.env.PISTON_RUN_TIMEOUT_MS, 10) || 5_000;
const COMPILE_TIMEOUT_MS = parseInt(process.env.PISTON_COMPILE_TIMEOUT_MS, 10) || 10_000;
const MAX_MEMORY_BYTES = parseInt(process.env.PISTON_MAX_MEMORY_BYTES, 10) || 104_857_600;

const pistonClient = axios.create({
  baseURL: PISTON_URL,
  timeout: PISTON_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

let runtimeCache = null;
let runtimeCacheAt = 0;
const RUNTIME_CACHE_TTL_MS = 5 * 60 * 1000;

async function getRuntimes(force = false) {
  const now = Date.now();
  if (!force && runtimeCache && now - runtimeCacheAt < RUNTIME_CACHE_TTL_MS) {
    return runtimeCache;
  }
  const { data } = await pistonClient.get('/api/v2/runtimes');
  runtimeCache = Array.isArray(data) ? data : [];
  runtimeCacheAt = now;
  return runtimeCache;
}

async function resolveLanguageVersion(language, requestedVersion) {
  const runtimes = await getRuntimes();
  const lang = language.toLowerCase();

  const candidates = runtimes.filter(
    (r) =>
      r.language.toLowerCase() === lang ||
      (Array.isArray(r.aliases) && r.aliases.map((a) => a.toLowerCase()).includes(lang))
  );

  if (candidates.length === 0) {
    const err = new Error(`Unsupported language: ${language}`);
    err.statusCode = 400;
    throw err;
  }

  if (requestedVersion) {
    const exact = candidates.find((r) => r.version === requestedVersion);
    if (exact) return { language: exact.language, version: exact.version };
  }

  candidates.sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true }));
  return { language: candidates[0].language, version: candidates[0].version };
}

function formatTime(seconds) {
  if (typeof seconds !== 'number' || Number.isNaN(seconds)) return 'N/A';
  return `${seconds.toFixed(2)}s`;
}

function formatMemory(bytes) {
  if (typeof bytes !== 'number' || Number.isNaN(bytes) || bytes <= 0) return 'N/A';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(2)}MB`;
  const kb = bytes / 1024;
  return `${kb.toFixed(2)}KB`;
}

function buildResponse(pistonResult) {
  const run = pistonResult.run || {};
  const compile = pistonResult.compile || null;

  const stdout = (run.stdout || '').replace(/\r\n/g, '\n');
  const stderr = (run.stderr || '').replace(/\r\n/g, '\n');
  const compileStderr = compile ? (compile.stderr || '').replace(/\r\n/g, '\n') : '';

  const hadCompileError = compile && compile.code !== 0;
  const hadRuntimeError = run.code !== 0 || run.signal;

  let status = 'success';
  let error = null;

  if (hadCompileError) {
    status = 'compile_error';
    error = compileStderr || 'Compilation failed';
  } else if (hadRuntimeError) {
    status = 'error';
    error = stderr || `Process exited with code ${run.code}` + (run.signal ? ` (signal: ${run.signal})` : '');
  }

  const wallTimeSec =
    typeof run.wall_time === 'number'
      ? run.wall_time / 1000
      : typeof run.cpu_time === 'number'
        ? run.cpu_time / 1000
        : NaN;

  const memoryBytes = typeof run.memory === 'number' ? run.memory : NaN;

  return {
    output: stdout.trimEnd(),
    time: formatTime(wallTimeSec),
    memory: formatMemory(memoryBytes),
    cpu_usage: 'N/A',
    status,
    error,
  };
}

async function executeCode({ language, code, stdin = '', version, args = [] }) {
  let resolved;
  try {
    resolved = await resolveLanguageVersion(language, version);
  } catch (err) {
    if (err.response) {
      logger.error('Piston runtimes lookup failed', {
        status: err.response.status,
        data: err.response.data,
      });
    }
    throw err;
  }

  const payload = {
    language: resolved.language,
    version: resolved.version,
    files: [{ name: 'main', content: code }],
    stdin,
    args,
    compile_timeout: COMPILE_TIMEOUT_MS,
    run_timeout: RUN_TIMEOUT_MS,
    compile_memory_limit: MAX_MEMORY_BYTES,
    run_memory_limit: MAX_MEMORY_BYTES,
  };

  try {
    const { data } = await pistonClient.post('/api/v2/execute', payload);
    return buildResponse(data);
  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      const timeoutErr = new Error('Code execution timed out');
      timeoutErr.statusCode = 408;
      throw timeoutErr;
    }
    if (err.response) {
      logger.error('Piston execute error', {
        status: err.response.status,
        data: err.response.data,
      });
      const apiErr = new Error(
        (err.response.data && err.response.data.message) || 'Piston execution failed'
      );
      apiErr.statusCode = err.response.status >= 400 && err.response.status < 500 ? 400 : 502;
      throw apiErr;
    }
    logger.error('Piston connection error', { message: err.message });
    const connErr = new Error('Cannot reach code execution engine');
    connErr.statusCode = 503;
    throw connErr;
  }
}

async function ping() {
  try {
    const { data } = await pistonClient.get('/api/v2/runtimes');
    return { ok: true, runtimes: Array.isArray(data) ? data.length : 0 };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

module.exports = {
  executeCode,
  getRuntimes,
  ping,
};

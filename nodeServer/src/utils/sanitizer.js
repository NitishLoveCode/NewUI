'use strict';

const MAX_CODE_LENGTH = 100_000;

function sanitizeCode(code) {
  if (typeof code !== 'string') return '';
  if (code.length > MAX_CODE_LENGTH) {
    const err = new Error(`Code exceeds maximum length of ${MAX_CODE_LENGTH} characters`);
    err.statusCode = 400;
    throw err;
  }
  return code.replace(/\u0000/g, '');
}

function sanitizeLanguage(language) {
  if (typeof language !== 'string') return '';
  return language.trim().toLowerCase().replace(/[^a-z0-9+#._-]/g, '');
}

function sanitizeRoomId(roomId) {
  if (typeof roomId !== 'string') return '';
  return roomId.trim().slice(0, 64).replace(/[^a-zA-Z0-9_-]/g, '');
}

function sanitizeUserId(userId) {
  if (typeof userId !== 'string') return '';
  return userId.trim().slice(0, 64).replace(/[^a-zA-Z0-9_-]/g, '');
}

module.exports = {
  sanitizeCode,
  sanitizeLanguage,
  sanitizeRoomId,
  sanitizeUserId,
  MAX_CODE_LENGTH,
};

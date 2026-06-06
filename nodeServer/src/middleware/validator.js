'use strict';

const Joi = require('joi');
const { MAX_CODE_LENGTH } = require('../utils/sanitizer');

const runCodeSchema = Joi.object({
  language: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9+#._-]+$/)
    .min(1)
    .max(32)
    .required(),
  code: Joi.string().min(1).max(MAX_CODE_LENGTH).required(),
  stdin: Joi.string().max(10_000).optional(),
  version: Joi.string().max(32).optional(),
  args: Joi.array().items(Joi.string().max(256)).max(20).optional(),
});

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        status: 'error',
        error: 'Validation failed',
        details: error.details.map((d) => d.message),
      });
    }
    req.body = value;
    return next();
  };
}

module.exports = {
  validate,
  runCodeSchema,
};

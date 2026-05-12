const { validationResult } = require('express-validator');

/**
 * Sends 400 with structured errors if express-validator found issues.
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array({ onlyFirstError: false }).map((e) => ({
        path: e.path,
        msg: e.msg,
        value: e.value,
      })),
    });
  }
  return next();
};

module.exports = validateRequest;

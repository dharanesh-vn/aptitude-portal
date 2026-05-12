const { body, param } = require('express-validator');

const submitTestRules = [
  param('id').isMongoId().withMessage('Invalid test id'),
  body('attemptId').isMongoId().withMessage('attemptId must be a valid id'),
  body('answers').isObject().withMessage('answers must be an object'),
];

const testIdParam = [param('id').isMongoId().withMessage('Invalid test id')];

const logViolationRules = [
  param('id').isMongoId().withMessage('Invalid test id'),
  body('attemptId').isMongoId().withMessage('attemptId must be a valid id'),
  body('type').isIn(['tab_switch', 'fullscreen_exit']).withMessage('Invalid violation type'),
];

module.exports = {
  submitTestRules,
  testIdParam,
  logViolationRules,
};

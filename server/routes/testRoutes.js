const express = require('express');
const router = express.Router();
const {
  getAllTests,
  startTest,
  submitTest,
  logViolation,
} = require('../controllers/testController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const {
  submitTestRules,
  testIdParam,
  logViolationRules,
} = require('../validators/testValidators');

router.route('/').get(protect, getAllTests);

router
  .route('/:id/start')
  .get(protect, ...testIdParam, validateRequest, startTest);

router
  .route('/:id/submit')
  .post(protect, ...submitTestRules, validateRequest, submitTest);

router
  .route('/:id/violations')
  .post(protect, ...logViolationRules, validateRequest, logViolation);

module.exports = router;

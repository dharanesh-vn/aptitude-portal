const express = require('express');
const router = express.Router();
const {
  createQuestion,
  getAllQuestions,
  updateQuestion,
  deleteQuestion,
  createTest,
  getTestById,
  updateTest,
  deleteTest,
  getAnalytics,
  getViolationsForTest,
  exportTestScoresCsv,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const {
  createQuestionRules,
  updateQuestionRules,
  listQuestionsRules,
  createTestRules,
  updateTestRules,
  mongoIdParam,
} = require('../validators/adminValidators');
const { param } = require('express-validator');

const violationsTestIdRules = [param('testId').isMongoId().withMessage('Invalid test id')];

router
  .route('/questions')
  .get(protect, admin, listQuestionsRules, validateRequest, getAllQuestions)
  .post(protect, admin, createQuestionRules, validateRequest, createQuestion);

router
  .route('/questions/:id')
  .put(protect, admin, ...updateQuestionRules, validateRequest, updateQuestion)
  .delete(protect, admin, ...mongoIdParam('id'), validateRequest, deleteQuestion);

router
  .route('/tests')
  .post(protect, admin, createTestRules, validateRequest, createTest);

router
  .route('/tests/:id')
  .get(protect, admin, ...mongoIdParam('id'), validateRequest, getTestById)
  .put(protect, admin, ...updateTestRules, validateRequest, updateTest)
  .delete(protect, admin, ...mongoIdParam('id'), validateRequest, deleteTest);

router.get('/analytics', protect, admin, getAnalytics);

router.get(
  '/tests/:testId/violations',
  protect,
  admin,
  ...violationsTestIdRules,
  validateRequest,
  getViolationsForTest
);

router.get(
  '/tests/:id/export',
  protect,
  admin,
  ...mongoIdParam('id'),
  validateRequest,
  exportTestScoresCsv
);

module.exports = router;

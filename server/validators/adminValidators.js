const { body, param, query } = require('express-validator');

const createQuestionRules = [
  body('text').trim().notEmpty().withMessage('Question text is required'),
  body('options').isArray({ min: 2 }).withMessage('At least two options are required'),
  body('options.*').isString().trim().notEmpty(),
  body('correctAnswer').trim().notEmpty().withMessage('Correct answer is required'),
  body('explanation').optional().isString(),
  body('category').trim().notEmpty().withMessage('Category is required'),
];

const updateQuestionRules = [
  param('id').isMongoId().withMessage('Invalid question id'),
  body('text').optional().trim().notEmpty(),
  body('options').optional().isArray({ min: 2 }),
  body('options.*').optional().isString().trim().notEmpty(),
  body('correctAnswer').optional().trim().notEmpty(),
  body('explanation').optional().isString(),
  body('category').optional().trim().notEmpty(),
];

const listQuestionsRules = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('category').optional().isString().trim(),
];

const createTestRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('duration').isNumeric().withMessage('Duration must be a number').toFloat(),
  body('questionIds').optional().isArray().withMessage('questionIds must be an array'),
  body('questionIds.*').optional().isMongoId(),
];

const updateTestRules = [
  param('id').isMongoId().withMessage('Invalid test id'),
  body('title').optional().trim().notEmpty(),
  body('duration').optional().isNumeric().toFloat(),
  body('questionIds').optional().isArray(),
  body('questionIds.*').optional().isMongoId(),
];

const mongoIdParam = (name = 'id') => [param(name).isMongoId().withMessage('Invalid id')];

module.exports = {
  createQuestionRules,
  updateQuestionRules,
  listQuestionsRules,
  createTestRules,
  updateTestRules,
  mongoIdParam,
};

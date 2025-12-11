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
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// Question Routes
router.route('/questions')
  .get(protect, admin, getAllQuestions)
  .post(protect, admin, createQuestion);

router.route('/questions/:id')
  .put(protect, admin, updateQuestion)
  .delete(protect, admin, deleteQuestion);

// Test Routes
router.route('/tests')
  .post(protect, admin, createTest);
  
router.route('/tests/:id')
  .get(protect, admin, getTestById)
  .put(protect, admin, updateTest)
  .delete(protect, admin, deleteTest);

module.exports = router;
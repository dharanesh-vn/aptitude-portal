const express = require('express');
const router = express.Router();
const { getAllTests, startTest, submitTest } = require('../controllers/testController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getAllTests);
router.route('/:id/start').get(protect, startTest);
router.route('/:id/submit').post(protect, submitTest);

module.exports = router;
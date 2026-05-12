const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const Submission = require('../models/Submission');
const {
  getSubmissionReview,
  downloadSubmissionReport,
} = require('../controllers/submissionController');
const { submissionIdParam } = require('../validators/submissionValidators');

router.get('/my-history', protect, async (req, res) => {
  try {
    const submissions = await Submission.find({ user: req.user._id })
      .populate('test', 'title')
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    console.error('ERROR FETCHING SUBMISSION HISTORY:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.get('/:id/review', protect, ...submissionIdParam, validateRequest, getSubmissionReview);

router.get(
  '/:id/report',
  protect,
  ...submissionIdParam,
  validateRequest,
  downloadSubmissionReport
);

module.exports = router;

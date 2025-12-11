const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Submission = require('../models/Submission');
const Test = require('../models/Test'); // We need the Test model for deep population

// GET /api/submissions/my-history
router.get('/my-history', protect, async (req, res) => {
    try {
        const submissions = await Submission.find({ user: req.user._id })
            .populate('test', 'title')
            .sort({ createdAt: -1 });
        res.json(submissions);
    } catch (error) {
        console.error("ERROR FETCHING SUBMISSION HISTORY:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// GET /api/submissions/:id/review
router.get('/:id/review', protect, async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id);

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }
        
        // Security check: ensure the user requesting the review is the one who took the test
        if (!submission.user.equals(req.user._id)) {
            return res.status(403).json({ message: 'Not authorized to view this submission' });
        }

        // --- THIS IS THE CRITICAL FIX ---
        // We need to fetch the Test document and populate its questions FULLY,
        // including the correct answer and explanation for the review.
        const testDetails = await Test.findById(submission.test).populate('questions');

        if (!testDetails) {
            return res.status(404).json({ message: 'Associated test not found' });
        }

        // We construct a new object to send to the frontend, combining the submission
        // with the fully populated and detailed test questions.
        const reviewData = {
            _id: submission._id,
            user: submission.user,
            score: submission.score,
            total: submission.total,
            answers: submission.answers,
            createdAt: submission.createdAt,
            // The `test` object now contains the full questions with all fields
            test: testDetails 
        };

        res.json(reviewData);

    } catch (error) {
        console.error("ERROR FETCHING SUBMISSION REVIEW:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
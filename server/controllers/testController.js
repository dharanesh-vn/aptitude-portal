const mongoose = require('mongoose');
const Test = require('../models/Test');
const Question = require('../models/Question');
const Submission = require('../models/Submission');
const Attempt = require('../models/Attempt');
const Violation = require('../models/Violation');
const { SUBMIT_GRACE_MS } = require('../config/constants');

const shuffleArray = (array) => {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const getAllTests = async (req, res) => {
  try {
    const tests = await Test.find({}).select('title duration');
    res.status(200).json(tests);
  } catch (error) {
    console.error('SERVER ERROR in getAllTests:', error);
    res.status(500).json({ message: 'Server error while fetching tests.' });
  }
};

const startTest = async (req, res) => {
  try {
    const testId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(400).json({ message: 'Invalid Test ID format.' });
    }

    const userId = req.user._id;

    const existingSubmission = await Submission.findOne({ user: userId, test: testId });
    if (existingSubmission) {
      return res.status(409).json({ message: 'You have already submitted this test.' });
    }

    const now = new Date();

    let attempt = await Attempt.findOne({
      user: userId,
      test: testId,
      status: 'active',
    });

    if (attempt && attempt.expiresAt > now) {
      const testDoc = await Test.findById(testId).select('title duration');
      if (!testDoc) {
        return res.status(404).json({ message: 'Test not found.' });
      }

      const rawQuestions = await Question.find({
        _id: { $in: attempt.questions },
      }).select('-correctAnswer');

      const orderMap = new Map(attempt.questions.map((id, i) => [id.toString(), i]));
      rawQuestions.sort((a, b) => orderMap.get(a._id.toString()) - orderMap.get(b._id.toString()));

      return res.status(200).json({
        _id: testDoc._id,
        title: testDoc.title,
        duration: testDoc.duration,
        questions: rawQuestions,
        attemptId: attempt._id,
        expiresAt: attempt.expiresAt.toISOString(),
        serverTime: now.toISOString(),
        resumed: true,
      });
    }

    if (attempt && attempt.expiresAt <= now) {
      attempt.status = 'expired';
      await attempt.save();
    }

    const test = await Test.findById(testId).populate({
      path: 'questions',
      select: '-correctAnswer',
    });

    if (!test || !test.questions?.length) {
      return res.status(404).json({ message: 'Test not found or has no questions.' });
    }

    const shuffled = shuffleArray(test.questions);
    const durationMinutes = test.duration;
    const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000);

    attempt = await Attempt.create({
      user: userId,
      test: testId,
      startedAt: now,
      expiresAt,
      questions: shuffled.map((q) => q._id),
      status: 'active',
    });

    res.status(200).json({
      _id: test._id,
      title: test.title,
      duration: test.duration,
      questions: shuffled,
      attemptId: attempt._id,
      expiresAt: attempt.expiresAt.toISOString(),
      serverTime: now.toISOString(),
      resumed: false,
    });
  } catch (error) {
    console.error('SERVER ERROR in startTest:', error);
    res.status(500).json({ message: 'Server error while starting the test.' });
  }
};

const submitTest = async (req, res) => {
  try {
    const { answers, attemptId } = req.body;
    const testId = req.params.id;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(400).json({ message: 'Invalid Test ID format.' });
    }

    if (!attemptId || !mongoose.Types.ObjectId.isValid(attemptId)) {
      return res.status(400).json({ message: 'Valid attemptId is required.' });
    }

    if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
      return res.status(400).json({ message: 'answers must be an object mapping question IDs to selected options.' });
    }

    const attempt = await Attempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found.' });
    }

    if (!attempt.user.equals(userId)) {
      return res.status(403).json({ message: 'This attempt does not belong to you.' });
    }

    if (!attempt.test.equals(testId)) {
      return res.status(400).json({ message: 'Attempt does not match this test.' });
    }

    if (attempt.status !== 'active') {
      return res.status(400).json({ message: 'This attempt is no longer active.' });
    }

    const deadline = new Date(attempt.expiresAt.getTime() + SUBMIT_GRACE_MS);
    const now = new Date();
    if (now > deadline) {
      attempt.status = 'expired';
      await attempt.save();
      return res.status(400).json({ message: 'Time window for this attempt has expired.' });
    }

    const allowedIds = new Set(attempt.questions.map((id) => id.toString()));
    const submittedKeys = Object.keys(answers);

    for (const key of submittedKeys) {
      if (!allowedIds.has(key)) {
        return res.status(400).json({
          message: 'Invalid answer keys: only question IDs from this attempt are allowed.',
        });
      }
    }

    const questionDocs = await Question.find({
      _id: { $in: attempt.questions },
    });

    const byId = new Map(questionDocs.map((q) => [q._id.toString(), q]));
    let score = 0;
    const total = attempt.questions.length;

    for (const qid of attempt.questions) {
      const q = byId.get(qid.toString());
      if (!q) continue;
      const selected = answers[qid.toString()];
      if (selected !== undefined && selected === q.correctAnswer) {
        score += 1;
      }
    }

    const answersMap = new Map();
    for (const qid of attempt.questions) {
      const key = qid.toString();
      if (answers[key] !== undefined) {
        answersMap.set(key, answers[key]);
      }
    }

    let savedSubmission;
    try {
      savedSubmission = await Submission.create({
        user: userId,
        test: testId,
        attempt: attempt._id,
        score,
        total,
        answers: answersMap,
      });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ message: 'You have already submitted this test.' });
      }
      throw err;
    }

    attempt.status = 'submitted';
    await attempt.save();

    const populatedSubmission = await Submission.findById(savedSubmission._id).populate('test', 'title');

    res.status(201).json(populatedSubmission);
  } catch (error) {
    console.error('SERVER ERROR in submitTest:', error);
    res.status(500).json({ message: 'Server error while submitting the test.' });
  }
};

const logViolation = async (req, res) => {
  try {
    const testId = req.params.id;
    const { attemptId, type } = req.body;

    if (!mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(400).json({ message: 'Invalid Test ID format.' });
    }

    if (!attemptId || !mongoose.Types.ObjectId.isValid(attemptId)) {
      return res.status(400).json({ message: 'Valid attemptId is required.' });
    }

    const attempt = await Attempt.findById(attemptId);
    if (!attempt || !attempt.user.equals(req.user._id)) {
      return res.status(403).json({ message: 'Invalid attempt for this user.' });
    }

    if (!attempt.test.equals(testId)) {
      return res.status(400).json({ message: 'Attempt does not match this test.' });
    }

    await Violation.create({
      user: req.user._id,
      test: testId,
      attempt: attempt._id,
      type,
      timestamp: new Date(),
    });

    res.status(201).json({ message: 'Violation recorded' });
  } catch (error) {
    console.error('SERVER ERROR in logViolation:', error);
    res.status(500).json({ message: 'Server error while logging violation.' });
  }
};

module.exports = {
  getAllTests,
  startTest,
  submitTest,
  logViolation,
};

const mongoose = require('mongoose');
const { Parser } = require('json2csv');
const Question = require('../models/Question');
const Test = require('../models/Test');
const Submission = require('../models/Submission');
const User = require('../models/User');
const Violation = require('../models/Violation');

const MAX_QUESTIONS_PAGE = 50;

const handleWriteError = (res, error, fallbackMessage) => {
  console.error(fallbackMessage, error);
  return res.status(400).json({ message: fallbackMessage });
};

// --- Question Management ---
const createQuestion = async (req, res) => {
  const { text, options, correctAnswer, explanation, category } = req.body;
  try {
    const question = new Question({
      text,
      options,
      correctAnswer,
      explanation,
      category,
      createdBy: req.user._id,
    });
    const createdQuestion = await question.save();
    res.status(201).json(createdQuestion);
  } catch (error) {
    return handleWriteError(res, error, 'Could not create question');
  }
};

const getAllQuestions = async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  let limit = parseInt(req.query.limit, 10) || 20;
  if (limit > MAX_QUESTIONS_PAGE) limit = MAX_QUESTIONS_PAGE;
  if (limit < 1) limit = 1;

  const categoryFilter = req.query.category || '';
  const skip = (page - 1) * limit;

  try {
    const query = {};
    if (categoryFilter) {
      query.category = categoryFilter;
    }

    const questions = await Question.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const totalQuestions = await Question.countDocuments(query);
    const allCategories = await Question.distinct('category');

    res.status(200).json({
      questions,
      currentPage: page,
      totalPages: Math.ceil(totalQuestions / limit) || 1,
      pageSize: limit,
      allCategories,
    });
  } catch (error) {
    console.error('getAllQuestions:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const updateQuestion = async (req, res) => {
  const { text, options, correctAnswer, explanation, category } = req.body;
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (text !== undefined) question.text = text;
    if (options !== undefined) question.options = options;
    if (correctAnswer !== undefined) question.correctAnswer = correctAnswer;
    if (explanation !== undefined) question.explanation = explanation;
    if (category !== undefined) question.category = category;
    question.updatedBy = req.user._id;

    const updatedQuestion = await question.save();
    res.status(200).json(updatedQuestion);
  } catch (error) {
    return handleWriteError(res, error, 'Could not update question');
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    console.info('[AUDIT] Question deleted', {
      questionId: req.params.id,
      adminId: req.user._id.toString(),
    });

    await question.deleteOne();
    await Test.updateMany({}, { $pull: { questions: req.params.id } });
    res.status(200).json({ message: 'Question removed' });
  } catch (error) {
    console.error('deleteQuestion:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// --- Test Management ---
const createTest = async (req, res) => {
  const { title, duration, questionIds = [] } = req.body;
  try {
    const test = new Test({ title, duration, questions: questionIds });
    const createdTest = await test.save();
    res.status(201).json(createdTest);
  } catch (error) {
    return handleWriteError(res, error, 'Could not create test');
  }
};

const getTestById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    const test = await Test.findById(req.params.id).populate('questions');
    if (test) {
      res.status(200).json(test);
    } else {
      res.status(404).json({ message: 'Test not found' });
    }
  } catch (error) {
    console.error('getTestById:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const updateTest = async (req, res) => {
  const { title, duration, questionIds } = req.body;
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    if (title !== undefined) test.title = title;
    if (duration !== undefined) test.duration = duration;
    if (questionIds !== undefined) test.questions = questionIds;
    test.updatedBy = req.user._id;

    const updatedTest = await test.save();
    res.status(200).json(updatedTest);
  } catch (error) {
    return handleWriteError(res, error, 'Could not update test');
  }
};

const deleteTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    console.info('[AUDIT] Test deleted', {
      testId: req.params.id,
      adminId: req.user._id.toString(),
    });

    await test.deleteOne();
    res.status(200).json({ message: 'Test removed' });
  } catch (error) {
    console.error('deleteTest:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// --- Analytics ---
const bucketPct = (pct) => {
  if (pct <= 25) return '0-25';
  if (pct <= 50) return '25-50';
  if (pct <= 75) return '50-75';
  return '75-100';
};

const getAnalytics = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ isAdmin: false });
    const totalTests = await Test.countDocuments();
    const totalSubmissions = await Submission.countDocuments();

    const submissions = await Submission.find().populate('test', 'title');

    const distribution = { '0-25': 0, '25-50': 0, '50-75': 0, '75-100': 0 };
    const avgPerTestMap = new Map();

    const monthlyAgg = new Map();

    for (const sub of submissions) {
      if (!sub.test) continue;

      const pct = sub.total > 0 ? (sub.score / sub.total) * 100 : 0;
      distribution[bucketPct(pct)] += 1;

      const tid = sub.test._id.toString();
      if (!avgPerTestMap.has(tid)) {
        avgPerTestMap.set(tid, { title: sub.test.title, scores: [], totals: [] });
      }
      const entry = avgPerTestMap.get(tid);
      entry.scores.push(sub.score);
      entry.totals.push(sub.total);

      const monthKey = sub.createdAt.toISOString().slice(0, 7);
      if (!monthlyAgg.has(monthKey)) monthlyAgg.set(monthKey, { sumPct: 0, count: 0 });
      const mo = monthlyAgg.get(monthKey);
      mo.sumPct += pct;
      mo.count += 1;
    }

    const averageScorePerTest = [];
    for (const [, v] of avgPerTestMap) {
      let sumRatio = 0;
      let n = 0;
      for (let i = 0; i < v.scores.length; i++) {
        if (v.totals[i] > 0) {
          sumRatio += v.scores[i] / v.totals[i];
          n += 1;
        }
      }
      averageScorePerTest.push({
        testTitle: v.title,
        averagePercent: n ? (sumRatio / n) * 100 : 0,
        submissions: v.scores.length,
      });
    }

    const monthlyAverages = Array.from(monthlyAgg.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, { sumPct, count }]) => ({
        period,
        averagePercent: count ? sumPct / count : 0,
      }));

    // Per-category accuracy across all graded attempts
    const categoryStats = new Map();
    const populatedSubs = await Submission.find();

    for (const sub of populatedSubs) {
      const test = await Test.findById(sub.test).populate('questions');
      if (!test) continue;

      const answersObj =
        sub.answers instanceof Map ? Object.fromEntries(sub.answers) : Object(sub.answers);

      for (const q of test.questions) {
        const cat = q.category || 'Uncategorized';
        if (!categoryStats.has(cat)) {
          categoryStats.set(cat, { correct: 0, total: 0 });
        }
        const st = categoryStats.get(cat);
        st.total += 1;
        const sel = answersObj[q._id.toString()];
        if (sel !== undefined && sel === q.correctAnswer) {
          st.correct += 1;
        }
      }
    }

    const categoryAccuracy = Array.from(categoryStats.entries()).map(([category, { correct, total }]) => ({
      category,
      accuracyPercent: total ? (correct / total) * 100 : 0,
      attempts: total,
    }));

    res.json({
      overview: {
        totalStudents,
        totalTests,
        totalSubmissions,
      },
      scoreDistribution: distribution,
      averageScorePerTest,
      averageScoresOverTime: monthlyAverages,
      categoryAccuracy,
    });
  } catch (error) {
    console.error('getAnalytics:', error);
    res.status(500).json({ message: 'Could not load analytics' });
  }
};

const getViolationsForTest = async (req, res) => {
  try {
    const { testId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(400).json({ message: 'Invalid test ID' });
    }

    const rows = await Violation.find({ test: testId })
      .populate('user', 'name email')
      .populate('attempt')
      .sort({ timestamp: -1 });

    res.json(rows);
  } catch (error) {
    console.error('getViolationsForTest:', error);
    res.status(500).json({ message: 'Could not load violations' });
  }
};

const exportTestScoresCsv = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid test ID' });
    }

    const test = await Test.findById(id).select('title');
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    const submissions = await Submission.find({ test: id }).populate('user', 'name email');

    const rows = submissions.map((s) => {
      const pct = s.total > 0 ? ((s.score / s.total) * 100).toFixed(2) : '0';
      return {
        studentName: s.user?.name || '',
        email: s.user?.email || '',
        score: s.score,
        total: s.total,
        percentage: pct,
        submittedAt: s.createdAt.toISOString(),
      };
    });

    const parser = new Parser({
      fields: ['studentName', 'email', 'score', 'total', 'percentage', 'submittedAt'],
    });
    const csv = parser.parse(rows);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="test-${id}-scores.csv"`
    );
    res.send(csv);
  } catch (error) {
    console.error('exportTestScoresCsv:', error);
    res.status(500).json({ message: 'Could not export CSV' });
  }
};

module.exports = {
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
};

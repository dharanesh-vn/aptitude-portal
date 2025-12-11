const mongoose = require('mongoose');
const Test = require('../models/Test');
const Question = require('../models/Question');
const Submission = require('../models/Submission'); // Ensure this is imported

// Helper function to shuffle an array
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// GET all available tests
const getAllTests = async (req, res) => {
  try {
    const tests = await Test.find({}).select('title duration');
    res.status(200).json(tests);
  } catch (error) {
    console.error("SERVER ERROR in getAllTests:", error);
    res.status(500).json({ message: 'Server error while fetching tests.' });
  }
};

// GET a specific test to begin the exam
const startTest = async (req, res) => {
  try {
    const testId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(400).json({ message: 'Invalid Test ID format.' });
    }

    const test = await Test.findById(testId).populate({
      path: 'questions',
      select: '-correctAnswer'
    });
    if (!test) {
      return res.status(404).json({ message: 'Test not found.' });
    }

    const shuffledQuestions = shuffleArray(test.questions);
    const testPayload = { _id: test._id, title: test.title, duration: test.duration, questions: shuffledQuestions };
    res.status(200).json(testPayload);
  } catch (error) {
    console.error("SERVER ERROR in startTest:", error);
    res.status(500).json({ message: 'Server error while starting the test.' });
  }
};

// POST a test submission, calculate score, and save it
const submitTest = async (req, res) => {
  try {
    const { answers } = req.body;
    const testId = req.params.id;
    const userId = req.user._id;

    const questionIds = Object.keys(answers);
    const correctQuestions = await Question.find({ '_id': { $in: questionIds } });

    let score = 0;
    correctQuestions.forEach(question => {
      if (answers[question._id.toString()] === question.correctAnswer) {
        score++;
      }
    });

    const newSubmission = new Submission({
      user: userId,
      test: testId,
      score: score,
      total: correctQuestions.length,
      answers: answers
    });

    const savedSubmission = await newSubmission.save();
    
    // It's helpful to populate the test title in the response here as well
    const populatedSubmission = await Submission.findById(savedSubmission._id).populate('test', 'title');
    
    res.status(201).json(populatedSubmission); // Send back the complete submission
  } catch (error) {
    console.error("SERVER ERROR in submitTest:", error);
    res.status(500).json({ message: 'Server error while submitting the test.' });
  }
};

module.exports = {
  getAllTests,
  startTest,
  submitTest,
};
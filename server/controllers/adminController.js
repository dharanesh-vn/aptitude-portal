const mongoose = require('mongoose');
const Question = require('../models/Question');
const Test = require('../models/Test');

// --- Question Management ---
const createQuestion = async (req, res) => {
    const { text, options, correctAnswer, explanation, category } = req.body;
    try {
        const question = new Question({ text, options, correctAnswer, explanation, category, createdBy: req.user._id });
        const createdQuestion = await question.save();
        res.status(201).json(createdQuestion);
    } catch (error) {
        res.status(400).json({ message: "Error creating question: " + error.message });
    }
};

const getAllQuestions = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 1000;
    const categoryFilter = req.query.category || '';
    const skip = (page - 1) * limit;

    try {
        let query = {};
        if (categoryFilter) {
            query.category = categoryFilter;
        }

        const questions = await Question.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
        const totalQuestions = await Question.countDocuments(query);
        const allCategories = await Question.distinct('category');

        res.status(200).json({
            questions,
            currentPage: page,
            totalPages: Math.ceil(totalQuestions / limit),
            allCategories
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateQuestion = async (req, res) => {
    const { text, options, correctAnswer, explanation, category } = req.body;
    try {
        const question = await Question.findById(req.params.id);
        if (question) {
            question.text = text || question.text;
            question.options = options || question.options;
            question.correctAnswer = correctAnswer || question.correctAnswer;
            question.explanation = explanation || question.explanation;
            question.category = category || question.category;

            const updatedQuestion = await question.save();
            res.status(200).json(updatedQuestion);
        } else {
            res.status(404).json({ message: 'Question not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Error updating question: ' + error.message });
    }
};

const deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (question) {
            await question.deleteOne();
            await Test.updateMany({}, { $pull: { questions: req.params.id } });
            res.status(200).json({ message: 'Question removed' });
        } else {
            res.status(404).json({ message: 'Question not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


// --- Test Management ---
const createTest = async (req, res) => {
    const { title, duration, questionIds } = req.body;
    try {
        const test = new Test({ title, duration, questions: questionIds });
        const createdTest = await test.save();
        res.status(201).json(createdTest);
    } catch (error) {
        res.status(400).json({ message: "Error creating test." });
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
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateTest = async (req, res) => {
    const { title, duration, questionIds } = req.body;
    try {
        const test = await Test.findById(req.params.id);
        if (test) {
            test.title = title !== undefined ? title : test.title;
            test.duration = duration !== undefined ? duration : test.duration;
            test.questions = questionIds !== undefined ? questionIds : test.questions;
            const updatedTest = await test.save();
            res.status(200).json(updatedTest);
        } else {
            res.status(404).json({ message: 'Test not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Error updating test' });
    }
};

const deleteTest = async (req, res) => {
    try {
        const test = await Test.findById(req.params.id);
        if (test) {
            await test.deleteOne();
            res.status(200).json({ message: 'Test removed' });
        } else {
            res.status(404).json({ message: 'Test not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


module.exports = {
  createQuestion, getAllQuestions, updateQuestion, deleteQuestion,
  createTest, getTestById, updateTest, deleteTest,
};
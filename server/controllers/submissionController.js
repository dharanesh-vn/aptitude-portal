const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const Submission = require('../models/Submission');
const Test = require('../models/Test');
const Question = require('../models/Question');
const getSubmissionReview = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (!submission.user.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to view this submission' });
    }

    const testDetails = await Test.findById(submission.test).populate('questions');

    if (!testDetails) {
      return res.status(404).json({ message: 'Associated test not found' });
    }

    const reviewData = {
      _id: submission._id,
      user: submission.user,
      score: submission.score,
      total: submission.total,
      answers: submission.answers,
      createdAt: submission.createdAt,
      test: testDetails,
    };

    res.json(reviewData);
  } catch (error) {
    console.error('ERROR FETCHING SUBMISSION REVIEW:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const downloadSubmissionReport = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid submission ID' });
    }

    const submission = await Submission.findById(req.params.id)
      .populate('user', 'name email')
      .populate('test', 'title');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (!submission.user._id.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to download this report' });
    }

    const testDoc = await Test.findById(submission.test).populate('questions');

    const answersObj =
      submission.answers instanceof Map
        ? Object.fromEntries(submission.answers)
        : submission.answers;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="report-${submission._id}.pdf"`
    );

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    doc.fontSize(20).text('Assessment Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Student: ${submission.user.name}`);
    doc.text(`Email: ${submission.user.email}`);
    doc.text(`Test: ${submission.test.title}`);
    doc.text(`Date: ${submission.createdAt.toISOString().slice(0, 10)}`);
    doc.text(`Score: ${submission.score} / ${submission.total}`);
    doc.moveDown();

    const pct =
      submission.total > 0 ? ((submission.score / submission.total) * 100).toFixed(1) : '0';
    doc.text(`Percentage: ${pct}%`);
    doc.moveDown();
    doc.fontSize(14).text('Question breakdown');
    doc.moveDown();
    doc.fontSize(11);

    let qNum = 1;
    for (const question of testDoc.questions) {
      const qid = question._id.toString();
      const selected = answersObj[qid];
      const correct = selected === question.correctAnswer;
      doc.text(`${qNum}. ${question.text}`, { continued: false });
      doc.text(`   Your answer: ${selected ?? '(no answer)'}`, { indent: 20 });
      doc.text(`   Correct answer: ${question.correctAnswer}`, { indent: 20 });
      doc.text(`   Result: ${correct ? 'Correct' : 'Incorrect'}`, { indent: 20 });
      doc.text(`   Explanation: ${question.explanation || '—'}`, { indent: 20 });
      doc.moveDown(0.5);
      qNum += 1;
    }

    doc.end();
  } catch (error) {
    console.error('PDF REPORT ERROR:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Could not generate report' });
    }
  }
};

module.exports = {
  getSubmissionReview,
  downloadSubmissionReport,
};

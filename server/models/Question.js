const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  explanation: { type: String, default: 'No explanation provided.' },
  category: { type: String, required: true, trim: true }, // <-- ADDED THIS LINE
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

module.exports = mongoose.model('Question', questionSchema);
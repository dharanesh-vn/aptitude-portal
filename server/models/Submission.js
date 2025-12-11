const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  test: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Test',
  },
  score: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  answers: {
    type: Map,
    of: String,
    required: true,
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

module.exports = mongoose.model('Submission', submissionSchema);
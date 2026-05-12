const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
    },
    startedAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    status: {
      type: String,
      enum: ['active', 'submitted', 'expired'],
      default: 'active',
    },
  },
  { timestamps: true }
);

attemptSchema.index({ user: 1, test: 1, status: 1 });

module.exports = mongoose.model('Attempt', attemptSchema);

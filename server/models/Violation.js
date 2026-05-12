const mongoose = require('mongoose');

const violationSchema = new mongoose.Schema(
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
    attempt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Attempt',
      required: true,
    },
    type: {
      type: String,
      enum: ['tab_switch', 'fullscreen_exit'],
      required: true,
    },
    timestamp: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

violationSchema.index({ user: 1, test: 1 });

module.exports = mongoose.model('Violation', violationSchema);

const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    question: String,
    answer: String,
    clarity: Number,
    relevance: Number,
    completeness: Number,
    suggestions: [String],
    overallComment: String,
  },
  { _id: false }
);

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    questions: [{ type: String }],
    answers: [{ type: String }],
    feedback: [feedbackSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
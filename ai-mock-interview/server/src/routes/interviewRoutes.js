const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const InterviewSession = require('../InterviewSession');
const { generateQuestions, evaluateAnswers } = require('../aiService');

const router = express.Router();

router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ message: 'Role is required.' });
    }

    const questions = await generateQuestions(role);

    return res.json({
      role,
      questions,
    });
  } catch (error) {
    console.error('Generate questions error:', error);
    return res.status(500).json({ message: error.message });
  }
});

router.post('/evaluate', authMiddleware, async (req, res) => {
  try {
    const { role, questions, answers } = req.body;

    if (!role || !questions || !answers) {
      return res.status(400).json({ message: 'Role, questions, and answers are required.' });
    }

    const feedback = await evaluateAnswers(role, questions, answers);

    const session = await InterviewSession.create({
      userId: req.user.userId,
      role,
      questions,
      answers,
      feedback,
    });

    return res.json({
      message: 'Interview evaluated successfully.',
      sessionId: session._id,
      feedback,
    });
  } catch (error) {
    console.error('Evaluate answers error:', error);
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
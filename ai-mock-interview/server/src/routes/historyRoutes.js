const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const InterviewSession = require('../InterviewSession');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const sessions = await InterviewSession.find({ userId: req.user.userId }).sort({
      createdAt: -1,
    });

    return res.json(sessions);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const session = await InterviewSession.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    return res.json(session);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
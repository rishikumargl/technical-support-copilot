import express from 'express';
import { answerQuestion, logFeedback } from '../services/ragServiceDemo.js';

const router = express.Router();

router.post('/ask', async (req, res, next) => {
  try {
    const {
      query,
      searchType = 'hybrid',
      topK = 5,
      filters = {},
      useCache = true
    } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const result = await answerQuestion(query, {
      searchType,
      topK,
      filters,
      useCache
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/feedback', async (req, res, next) => {
  try {
    const { query, feedback } = req.body;

    if (!query || !feedback) {
      return res.status(400).json({ error: 'Query and feedback are required' });
    }

    await logFeedback(query, feedback);
    res.json({ message: 'Feedback logged successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

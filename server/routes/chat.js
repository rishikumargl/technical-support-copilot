import express from 'express';
import { answerQuestion, logFeedback } from '../services/ragService.js';

const router = express.Router();

// Answer a question using RAG
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

// Log feedback for a query
router.post('/feedback', async (req, res, next) => {
  try {
    const { queryId, feedback } = req.body;

    if (!queryId || !feedback) {
      return res.status(400).json({ error: 'Query ID and feedback are required' });
    }

    await logFeedback(queryId, feedback);
    res.json({ message: 'Feedback logged successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

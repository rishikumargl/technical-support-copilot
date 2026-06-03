import { OpenAI } from 'openai';
import { hybridSearch } from './retrievalService.js';
import pool from '../config/database.js';
import crypto from 'crypto';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const SIMILARITY_THRESHOLD = parseFloat(process.env.SIMILARITY_THRESHOLD || 0.3);

async function getCachedResponse(query) {
  const queryHash = crypto.createHash('sha256').update(query).digest('hex');

  const result = await pool.query(
    'SELECT response FROM query_cache WHERE query_hash = $1 AND expires_at > NOW()',
    [queryHash]
  );

  return result.rows[0]?.response;
}

async function cacheResponse(query, response) {
  const queryHash = crypto.createHash('sha256').update(query).digest('hex');
  const ttlMinutes = 60;

  await pool.query(
    `INSERT INTO query_cache (query_hash, response, ttl_minutes, expires_at)
     VALUES ($1, $2, $3, NOW() + INTERVAL '1 minute' * $3)
     ON CONFLICT (query_hash) DO UPDATE SET
       response = $2,
       expires_at = NOW() + INTERVAL '1 minute' * $3`,
    [queryHash, JSON.stringify(response), ttlMinutes]
  );
}

export async function answerQuestion(query, options = {}) {
  const {
    searchType = 'hybrid',
    topK = parseInt(process.env.TOP_K_RESULTS || 5),
    filters = {},
    useCache = true
  } = options;

  // Check cache first
  if (useCache) {
    const cached = await getCachedResponse(query);
    if (cached) {
      return { ...cached, fromCache: true };
    }
  }

  let retrievedChunks;

  if (searchType === 'vector') {
    const { vectorSearch } = await import('./retrievalService.js');
    retrievedChunks = await vectorSearch(query, topK, filters);
  } else if (searchType === 'keyword') {
    const { keywordSearch } = await import('./retrievalService.js');
    retrievedChunks = await keywordSearch(query, topK, filters);
  } else {
    retrievedChunks = await hybridSearch(query, topK, filters);
  }

  // Check if we have relevant results
  const hasRelevantResults = retrievedChunks.length > 0 &&
    (searchType === 'keyword' || retrievedChunks[0].similarity >= SIMILARITY_THRESHOLD);

  if (!hasRelevantResults || retrievedChunks.length === 0) {
    const response = {
      answer: 'I cannot find relevant information in the knowledge base to answer your question. Please try rephrasing your question or contact support.',
      sources: [],
      confidence: 0,
      retrievedChunks: 0,
      hallucinated: false,
      timestamp: new Date()
    };

    if (useCache) {
      await cacheResponse(query, response);
    }

    return response;
  }

  // Prepare context from retrieved chunks
  const context = retrievedChunks
    .map((chunk, index) => `[Source ${index + 1}] (${chunk.document_name})\n${chunk.content}`)
    .join('\n\n');

  // Generate answer using LLM
  const systemPrompt = `You are a technical support assistant with access to a knowledge base.
Your task is to answer user questions based ONLY on the provided context.
If the context doesn't contain enough information to answer the question, clearly state that.
Always maintain a professional and helpful tone.
Cite the specific sections and documents from which you derived your answer.`;

  const userPrompt = `Context from knowledge base:
${context}

User Question: ${query}

Please provide a clear, structured answer based ONLY on the context above.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    const answer = response.choices[0].message.content;

    // Extract source information
    const sources = retrievedChunks.map((chunk, index) => ({
      documentId: chunk.document_id,
      documentName: chunk.document_name,
      department: chunk.department,
      category: chunk.category,
      chunkContent: chunk.content.substring(0, 300),
      chunkIndex: chunk.chunk_index,
      similarity: chunk.similarity || chunk.rank || null,
      sourceNumber: index + 1
    }));

    const result = {
      answer,
      sources,
      confidence: Math.min(retrievedChunks[0].similarity || 0.8, 1),
      retrievedChunks: retrievedChunks.length,
      searchType,
      hallucinated: false,
      timestamp: new Date()
    };

    // Cache the response
    if (useCache) {
      await cacheResponse(query, result);
    }

    // Log analytics
    await logSearchAnalytics(query, searchType, retrievedChunks.length, 'success');

    return result;
  } catch (error) {
    console.error('Error generating answer:', error);
    throw error;
  }
}

async function logSearchAnalytics(query, searchType, resultsCount, feedback = null) {
  try {
    await pool.query(
      `INSERT INTO search_analytics (query, search_type, results_count, user_feedback)
       VALUES ($1, $2, $3, $4)`,
      [query, searchType, resultsCount, feedback]
    );
  } catch (error) {
    console.error('Error logging analytics:', error);
  }
}

export async function logFeedback(queryId, feedback) {
  try {
    await pool.query(
      `UPDATE search_analytics
       SET user_feedback = $1
       WHERE id = $2`,
      [feedback, queryId]
    );
  } catch (error) {
    console.error('Error logging feedback:', error);
    throw error;
  }
}

export default {
  answerQuestion,
  logFeedback
};

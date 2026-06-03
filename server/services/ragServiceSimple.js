import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import { hybridSearch } from './retrievalServiceSimple.js';
import storageDb from '../storage.js';
import crypto from 'crypto';

dotenv.config();

const { storage, saveData } = storageDb;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const SIMILARITY_THRESHOLD = parseFloat(process.env.SIMILARITY_THRESHOLD || 0.3);

function getCachedResponse(query) {
  const queryHash = crypto.createHash('sha256').update(query).digest('hex');
  return storage.cache[queryHash];
}

function cacheResponse(query, response) {
  const queryHash = crypto.createHash('sha256').update(query).digest('hex');
  storage.cache[queryHash] = {
    ...response,
    cachedAt: new Date().toISOString()
  };
  saveData();
}

export async function answerQuestion(query, options = {}) {
  const {
    searchType = 'hybrid',
    topK = parseInt(process.env.TOP_K_RESULTS || 5),
    filters = {},
    useCache = true
  } = options;

  // Check cache
  if (useCache) {
    const cached = getCachedResponse(query);
    if (cached) {
      return { ...cached, fromCache: true };
    }
  }

  let retrievedChunks;

  if (searchType === 'vector') {
    const { vectorSearch } = await import('./retrievalServiceSimple.js');
    retrievedChunks = await vectorSearch(query, topK, filters);
  } else if (searchType === 'keyword') {
    const { keywordSearch } = await import('./retrievalServiceSimple.js');
    retrievedChunks = await keywordSearch(query, topK, filters);
  } else {
    retrievedChunks = await hybridSearch(query, topK, filters);
  }

  const hasRelevantResults = retrievedChunks.length > 0 &&
    (searchType === 'keyword' || retrievedChunks[0].similarity >= SIMILARITY_THRESHOLD);

  if (!hasRelevantResults || retrievedChunks.length === 0) {
    const response = {
      answer: 'I cannot find relevant information in the knowledge base to answer your question. Please try rephrasing your question or upload more documents.',
      sources: [],
      confidence: 0,
      retrievedChunks: 0,
      hallucinated: false,
      timestamp: new Date()
    };

    if (useCache) {
      cacheResponse(query, response);
    }

    return response;
  }

  const context = retrievedChunks
    .map((chunk, index) => `[Source ${index + 1}] (${chunk.document_name})\n${chunk.content}`)
    .join('\n\n');

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

    if (useCache) {
      cacheResponse(query, result);
    }

    // Log analytics
    storage.analytics.push({
      id: crypto.randomUUID(),
      query,
      search_type: searchType,
      results_count: retrievedChunks.length,
      user_feedback: null,
      created_at: new Date().toISOString()
    });
    saveData();

    return result;
  } catch (error) {
    console.error('Error generating answer:', error);
    throw error;
  }
}

export async function logFeedback(queryText, feedback) {
  const record = storage.analytics.find(a => a.query === queryText);
  if (record) {
    record.user_feedback = feedback;
    await saveData();
  }
}

export default {
  answerQuestion,
  logFeedback
};

import pool from '../config/database.js';
import { generateEmbedding, cosineSimilarity } from '../utils/embeddings.js';

// Vector search using cosine similarity
export async function vectorSearch(queryText, topK = 5, filters = {}) {
  const queryEmbedding = await generateEmbedding(queryText);

  let query = `
    SELECT
      c.id,
      c.content,
      c.document_id,
      d.name as document_name,
      d.department,
      d.category,
      e.embedding,
      c.chunk_index,
      c.metadata
    FROM chunks c
    JOIN documents d ON c.document_id = d.id
    LEFT JOIN embeddings e ON c.id = e.chunk_id
    WHERE e.embedding IS NOT NULL
  `;

  const params = [];

  if (filters.department) {
    query += ' AND d.department = $' + (params.length + 1);
    params.push(filters.department);
  }

  if (filters.category) {
    query += ' AND d.category = $' + (params.length + 1);
    params.push(filters.category);
  }

  query += ' ORDER BY c.created_at DESC LIMIT 1000';

  const results = await pool.query(query, params);

  // Calculate similarity scores
  const scored = results.rows.map(row => ({
    ...row,
    similarity: cosineSimilarity(queryEmbedding, row.embedding)
  })).sort((a, b) => b.similarity - a.similarity).slice(0, topK);

  return scored;
}

// Keyword/BM25 search using PostgreSQL full-text search
export async function keywordSearch(queryText, topK = 5, filters = {}) {
  let query = `
    SELECT
      c.id,
      c.content,
      c.document_id,
      d.name as document_name,
      d.department,
      d.category,
      c.chunk_index,
      c.metadata,
      ts_rank(to_tsvector('english', c.content), plainto_tsquery('english', $1)) as rank
    FROM chunks c
    JOIN documents d ON c.document_id = d.id
    WHERE to_tsvector('english', c.content) @@ plainto_tsquery('english', $1)
  `;

  const params = [queryText];

  if (filters.department) {
    query += ' AND d.department = $' + (params.length + 1);
    params.push(filters.department);
  }

  if (filters.category) {
    query += ' AND d.category = $' + (params.length + 1);
    params.push(filters.category);
  }

  query += ' ORDER BY rank DESC, c.created_at DESC LIMIT $' + (params.length + 1);
  params.push(topK);

  const results = await pool.query(query, params);
  return results.rows;
}

// Hybrid search combining vector and keyword search
export async function hybridSearch(queryText, topK = 5, filters = {}) {
  const vectorResults = await vectorSearch(queryText, topK * 2, filters);
  const keywordResults = await keywordSearch(queryText, topK * 2, filters);

  // Combine and deduplicate results
  const combined = new Map();

  vectorResults.forEach((result, index) => {
    const key = result.id;
    if (!combined.has(key)) {
      combined.set(key, { ...result, vectorScore: 1 / (index + 1) });
    } else {
      combined.get(key).vectorScore = 1 / (index + 1);
    }
  });

  keywordResults.forEach((result, index) => {
    const key = result.id;
    if (!combined.has(key)) {
      combined.set(key, { ...result, keywordScore: 1 / (index + 1) });
    } else {
      combined.get(key).keywordScore = 1 / (index + 1);
    }
  });

  // Calculate hybrid score (50-50 weighted average)
  const finalResults = Array.from(combined.values())
    .map(item => ({
      ...item,
      hybridScore: (
        (item.vectorScore || 0) * 0.5 +
        (item.keywordScore || 0) * 0.5
      )
    }))
    .sort((a, b) => b.hybridScore - a.hybridScore)
    .slice(0, topK);

  return finalResults;
}

// Reranking using cross-encoder model (simplified with LLM)
export async function rerankedSearch(queryText, topK = 5, filters = {}) {
  const candidates = await hybridSearch(queryText, topK * 3, filters);

  // In production, would use a cross-encoder model
  // For now, using LLM-based relevance scoring
  const { OpenAI } = await import('openai');
  const openai = new OpenAI();

  const relevanceScores = await Promise.all(
    candidates.map(async (chunk) => {
      try {
        const prompt = `Rate the relevance of this chunk to the query on a scale of 0-10. Only respond with a number.
Query: "${queryText}"
Chunk: "${chunk.content.substring(0, 500)}"`;

        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0,
          max_tokens: 1
        });

        const score = parseInt(response.choices[0].message.content);
        return { ...chunk, relevanceScore: isNaN(score) ? 0 : score };
      } catch (error) {
        console.error('Error scoring relevance:', error);
        return { ...chunk, relevanceScore: 0 };
      }
    })
  );

  return relevanceScores
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, topK);
}

export default {
  vectorSearch,
  keywordSearch,
  hybridSearch,
  rerankedSearch
};

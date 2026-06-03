import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

let embeddingCache = new Map();

export async function generateEmbedding(text, model = 'text-embedding-3-small') {
  const cacheKey = `${model}:${text}`;

  if (embeddingCache.has(cacheKey)) {
    return embeddingCache.get(cacheKey);
  }

  try {
    const response = await openai.embeddings.create({
      model,
      input: text,
      encoding_format: 'float'
    });

    const embedding = response.data[0].embedding;
    embeddingCache.set(cacheKey, embedding);

    // Keep cache size manageable
    if (embeddingCache.size > 10000) {
      const firstKey = embeddingCache.keys().next().value;
      embeddingCache.delete(firstKey);
    }

    return embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

export async function generateEmbeddings(texts, model = 'text-embedding-3-small') {
  try {
    const response = await openai.embeddings.create({
      model,
      input: texts,
      encoding_format: 'float'
    });

    return response.data.map(item => item.embedding);
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw error;
  }
}

// Cosine similarity calculation
export function cosineSimilarity(a, b) {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
}

export default {
  generateEmbedding,
  generateEmbeddings,
  cosineSimilarity
};

import { generateMockEmbedding, cosineSimilarity } from '../utils/embeddingsMock.js';
import storageDb from '../storage.js';

const { storage } = storageDb;

export async function vectorSearch(queryText, topK = 5, filters = {}) {
  try {
    const queryEmbedding = generateMockEmbedding(queryText);

    let results = storage.chunks.map(chunk => {
      const doc = storage.documents.find(d => d.id === chunk.document_id);
      const embedding = storage.embeddings[chunk.id];

      return {
        ...chunk,
        document_name: doc?.name,
        department: doc?.department,
        category: doc?.category,
        similarity: embedding ? cosineSimilarity(queryEmbedding, embedding) : 0
      };
    });

    if (filters.department) {
      results = results.filter(r => r.department === filters.department);
    }

    if (filters.category) {
      results = results.filter(r => r.category === filters.category);
    }

    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  } catch (error) {
    console.error('Error in vector search:', error);
    return [];
  }
}

export async function keywordSearch(queryText, topK = 5, filters = {}) {
  const queryWords = queryText.toLowerCase().split(/\s+/);

  let results = storage.chunks.map(chunk => {
    const doc = storage.documents.find(d => d.id === chunk.document_id);
    const content = chunk.content.toLowerCase();

    // Simple keyword matching score
    const matches = queryWords.filter(word => content.includes(word)).length;
    const rank = matches / queryWords.length;

    return {
      ...chunk,
      document_name: doc?.name,
      department: doc?.department,
      category: doc?.category,
      rank: rank
    };
  });

  if (filters.department) {
    results = results.filter(r => r.department === filters.department);
  }

  if (filters.category) {
    results = results.filter(r => r.category === filters.category);
  }

  return results
    .filter(r => r.rank > 0)
    .sort((a, b) => b.rank - a.rank)
    .slice(0, topK);
}

export async function hybridSearch(queryText, topK = 5, filters = {}) {
  const vectorResults = await vectorSearch(queryText, topK * 2, filters);
  const keywordResults = await keywordSearch(queryText, topK * 2, filters);

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

export default {
  vectorSearch,
  keywordSearch,
  hybridSearch
};

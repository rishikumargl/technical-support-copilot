// Mock embedding generator - for demo without API key
import crypto from 'crypto';

// Generate deterministic mock embeddings (1536 dimensions like OpenAI)
export function generateMockEmbedding(text) {
  const hash = crypto.createHash('sha256').update(text).digest('hex');
  const embedding = [];

  for (let i = 0; i < 1536; i++) {
    const charCode = hash.charCodeAt(i % hash.length) || 65;
    const value = (charCode + i) % 256 / 128 - 1;
    embedding.push(value);
  }

  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(v => v / (magnitude || 1));
}

export function cosineSimilarity(a, b) {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
}

export default {
  generateMockEmbedding,
  cosineSimilarity
};

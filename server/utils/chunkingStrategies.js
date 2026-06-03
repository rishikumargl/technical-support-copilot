// Fixed-size chunking strategy
export function fixedSizeChunking(text, chunkSize = 1000, overlap = 200) {
  const chunks = [];
  let position = 0;

  while (position < text.length) {
    const end = Math.min(position + chunkSize, text.length);
    const chunk = text.substring(position, end);

    chunks.push({
      content: chunk.trim(),
      startPosition: position,
      endPosition: end,
      strategy: 'fixed-size'
    });

    position += chunkSize - overlap;
  }

  return chunks;
}

// Semantic chunking strategy - split on sentence boundaries
export function semanticChunking(text, targetChunkSize = 1000) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks = [];
  let currentChunk = '';
  let startPosition = 0;

  sentences.forEach((sentence, index) => {
    const sentenceLength = sentence.length;

    if ((currentChunk + sentence).length > targetChunkSize && currentChunk.length > 0) {
      chunks.push({
        content: currentChunk.trim(),
        startPosition,
        endPosition: startPosition + currentChunk.length,
        strategy: 'semantic',
        sentenceCount: currentChunk.split(/[.!?]+/).length - 1
      });
      startPosition += currentChunk.length;
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  });

  if (currentChunk.trim()) {
    chunks.push({
      content: currentChunk.trim(),
      startPosition,
      endPosition: startPosition + currentChunk.length,
      strategy: 'semantic',
      sentenceCount: currentChunk.split(/[.!?]+/).length - 1
    });
  }

  return chunks.filter(c => c.content.length > 50);
}

// Hybrid chunking - paragraph-aware with size constraints
export function paragraphAwareChunking(text, maxSize = 1000) {
  const paragraphs = text.split(/\n\n+/);
  const chunks = [];
  let currentChunk = '';
  let startPosition = 0;

  paragraphs.forEach((paragraph) => {
    const paraLength = paragraph.length;

    if ((currentChunk + '\n\n' + paragraph).length > maxSize && currentChunk.length > 0) {
      chunks.push({
        content: currentChunk.trim(),
        startPosition,
        endPosition: startPosition + currentChunk.length,
        strategy: 'paragraph-aware'
      });
      startPosition += currentChunk.length;
      currentChunk = paragraph;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  });

  if (currentChunk.trim()) {
    chunks.push({
      content: currentChunk.trim(),
      startPosition,
      endPosition: startPosition + currentChunk.length,
      strategy: 'paragraph-aware'
    });
  }

  return chunks;
}

export default {
  fixedSizeChunking,
  semanticChunking,
  paragraphAwareChunking
};

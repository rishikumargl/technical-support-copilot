import { v4 as uuidv4 } from 'uuid';
import { extractDocumentText } from '../utils/pdfParser.js';
import { semanticChunking, fixedSizeChunking, paragraphAwareChunking } from '../utils/chunkingStrategies.js';
import { generateMockEmbedding } from '../utils/embeddingsMock.js';
import storageDb from '../storage.js';
import fs from 'fs/promises';
import path from 'path';

const { storage, saveData } = storageDb;
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;
const UPLOADS_DIR = './uploads';

async function ensureUploadsDir() {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  } catch (error) {
    // Already exists
  }
}

export async function ingestDocument(file, metadata = {}) {
  try {
    await ensureUploadsDir();

    // Save file
    const filePath = path.join(UPLOADS_DIR, `${uuidv4()}_${file.originalname}`);
    await fs.writeFile(filePath, file.buffer);

    // Create document record
    const documentId = uuidv4();
    const fileType = path.extname(file.originalname).substring(1);

    const document = {
      id: documentId,
      name: file.originalname,
      file_path: filePath,
      file_type: fileType,
      file_size: file.size,
      department: metadata.department || 'Engineering',
      category: metadata.category || 'Documentation',
      version: metadata.version || '1.0',
      created_at: new Date().toISOString()
    };

    // Extract text from document
    const { text } = await extractDocumentText(filePath, fileType);

    // Choose chunking strategy
    let chunks;
    const chunkingStrategy = metadata.chunkingStrategy || 'semantic';

    if (chunkingStrategy === 'semantic') {
      chunks = semanticChunking(text, CHUNK_SIZE);
    } else if (chunkingStrategy === 'paragraph') {
      chunks = paragraphAwareChunking(text, CHUNK_SIZE);
    } else {
      chunks = fixedSizeChunking(text, CHUNK_SIZE, CHUNK_OVERLAP);
    }

    // Store chunks
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkId = uuidv4();

      storage.chunks.push({
        id: chunkId,
        document_id: documentId,
        content: chunk.content,
        chunk_index: i,
        start_position: chunk.startPosition,
        end_position: chunk.endPosition,
        metadata: {
          strategy: chunk.strategy,
          sentenceCount: chunk.sentenceCount
        },
        created_at: new Date().toISOString()
      });

      // Generate embedding (using mock for demo mode)
      try {
        const embedding = generateMockEmbedding(chunk.content);
        storage.embeddings[chunkId] = embedding;
      } catch (error) {
        console.error(`Error generating embedding for chunk ${i}:`, error);
      }
    }

    // Save document
    storage.documents.push(document);
    await saveData();

    return {
      document,
      chunksCreated: chunks.length,
      chunkingStrategy
    };
  } catch (error) {
    console.error('Error ingesting document:', error);
    throw error;
  }
}

export async function getDocuments(filters = {}) {
  let docs = storage.documents;

  if (filters.department) {
    docs = docs.filter(d => d.department === filters.department);
  }

  if (filters.category) {
    docs = docs.filter(d => d.category === filters.category);
  }

  return docs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function getDocumentById(id) {
  return storage.documents.find(d => d.id === id);
}

export async function getDocumentChunks(documentId) {
  return storage.chunks
    .filter(c => c.document_id === documentId)
    .sort((a, b) => a.chunk_index - b.chunk_index);
}

export async function deleteDocument(documentId) {
  try {
    // Get document to find file path
    const doc = storage.documents.find(d => d.id === documentId);
    if (doc) {
      // Delete file
      try {
        await fs.unlink(doc.file_path);
      } catch (error) {
        console.error('Error deleting file:', error);
      }

      // Delete document
      storage.documents = storage.documents.filter(d => d.id !== documentId);

      // Delete chunks
      const chunksToDelete = storage.chunks.filter(c => c.document_id === documentId);
      for (const chunk of chunksToDelete) {
        delete storage.embeddings[chunk.id];
      }
      storage.chunks = storage.chunks.filter(c => c.document_id !== documentId);

      await saveData();
    }

    return true;
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}

export async function getDocumentStats() {
  const departments = new Set(storage.documents.map(d => d.department));
  const categories = new Set(storage.documents.map(d => d.category));

  return {
    total_documents: storage.documents.length,
    total_chunks: storage.chunks.length,
    unique_departments: departments.size,
    unique_categories: categories.size,
    avg_file_size: storage.documents.length > 0
      ? Math.round(storage.documents.reduce((sum, d) => sum + d.file_size, 0) / storage.documents.length)
      : 0
  };
}

export default {
  ingestDocument,
  getDocuments,
  getDocumentById,
  getDocumentChunks,
  deleteDocument,
  getDocumentStats
};

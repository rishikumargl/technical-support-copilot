import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { extractDocumentText } from '../utils/pdfParser.js';
import { semanticChunking, fixedSizeChunking, paragraphAwareChunking } from '../utils/chunkingStrategies.js';
import { generateEmbedding } from '../utils/embeddings.js';
import fs from 'fs/promises';
import path from 'path';

const CHUNK_SIZE = parseInt(process.env.MAX_CHUNK_SIZE || 1000);
const CHUNK_OVERLAP = parseInt(process.env.CHUNK_OVERLAP || 200);

export async function ingestDocument(file, metadata = {}) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Save file
    const uploadDir = path.join(process.cwd(), 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, `${uuidv4()}_${file.originalname}`);
    await fs.writeFile(filePath, file.buffer);

    // Create document record
    const documentId = uuidv4();
    const fileType = path.extname(file.originalname).substring(1);

    const docResult = await client.query(
      `INSERT INTO documents (id, name, file_path, file_type, file_size, department, category, version)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        documentId,
        file.originalname,
        filePath,
        fileType,
        file.size,
        metadata.department || 'Engineering',
        metadata.category || 'Documentation',
        metadata.version || '1.0'
      ]
    );

    const document = docResult.rows[0];

    // Extract text from document
    const { text } = await extractDocumentText(filePath, fileType);

    // Choose chunking strategy based on metadata
    let chunks;
    const chunkingStrategy = metadata.chunkingStrategy || 'semantic';

    if (chunkingStrategy === 'semantic') {
      chunks = semanticChunking(text, CHUNK_SIZE);
    } else if (chunkingStrategy === 'paragraph') {
      chunks = paragraphAwareChunking(text, CHUNK_SIZE);
    } else {
      chunks = fixedSizeChunking(text, CHUNK_SIZE, CHUNK_OVERLAP);
    }

    // Store chunks and generate embeddings
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      const chunkResult = await client.query(
        `INSERT INTO chunks (id, document_id, content, chunk_index, start_position, end_position, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
          uuidv4(),
          documentId,
          chunk.content,
          i,
          chunk.startPosition,
          chunk.endPosition,
          JSON.stringify({
            strategy: chunk.strategy,
            sentenceCount: chunk.sentenceCount
          })
        ]
      );

      const chunkId = chunkResult.rows[0].id;

      // Generate and store embedding
      try {
        const embedding = await generateEmbedding(chunk.content);

        await client.query(
          `INSERT INTO embeddings (id, chunk_id, embedding, model)
           VALUES ($1, $2, $3, $4)`,
          [
            uuidv4(),
            chunkId,
            JSON.stringify(embedding),
            'text-embedding-3-small'
          ]
        );
      } catch (error) {
        console.error(`Error generating embedding for chunk ${i}:`, error);
        // Continue with other chunks even if one fails
      }
    }

    await client.query('COMMIT');

    return {
      document,
      chunksCreated: chunks.length,
      chunkingStrategy
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error ingesting document:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function getDocuments(filters = {}) {
  let query = 'SELECT * FROM documents WHERE 1=1';
  const params = [];

  if (filters.department) {
    query += ' AND department = $' + (params.length + 1);
    params.push(filters.department);
  }

  if (filters.category) {
    query += ' AND category = $' + (params.length + 1);
    params.push(filters.category);
  }

  query += ' ORDER BY created_at DESC';

  const result = await pool.query(query, params);
  return result.rows;
}

export async function getDocumentById(id) {
  const result = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);
  return result.rows[0];
}

export async function getDocumentChunks(documentId) {
  const result = await pool.query(
    `SELECT id, content, chunk_index, metadata
     FROM chunks
     WHERE document_id = $1
     ORDER BY chunk_index ASC`,
    [documentId]
  );
  return result.rows;
}

export async function deleteDocument(documentId) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get document to find file path
    const docResult = await client.query(
      'SELECT file_path FROM documents WHERE id = $1',
      [documentId]
    );

    if (docResult.rows[0]) {
      // Delete file from disk
      try {
        await fs.unlink(docResult.rows[0].file_path);
      } catch (error) {
        console.error('Error deleting file:', error);
      }

      // Delete from database (cascades to chunks and embeddings)
      await client.query('DELETE FROM documents WHERE id = $1', [documentId]);
    }

    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting document:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function getDocumentStats() {
  const result = await pool.query(
    `SELECT
       COUNT(DISTINCT d.id) as total_documents,
       COUNT(DISTINCT c.id) as total_chunks,
       COUNT(DISTINCT department) as unique_departments,
       COUNT(DISTINCT category) as unique_categories,
       ROUND(AVG(file_size)) as avg_file_size
     FROM documents d
     LEFT JOIN chunks c ON d.id = c.document_id`
  );
  return result.rows[0];
}

export default {
  ingestDocument,
  getDocuments,
  getDocumentById,
  getDocumentChunks,
  deleteDocument,
  getDocumentStats
};

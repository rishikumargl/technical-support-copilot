import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const DATA_DIR = './data';

// Initialize in-memory storage
const storage = {
  documents: [],
  chunks: [],
  embeddings: {},
  analytics: [],
  cache: {}
};

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

async function loadData() {
  try {
    await ensureDataDir();

    const docsPath = path.join(DATA_DIR, 'documents.json');
    const chunksPath = path.join(DATA_DIR, 'chunks.json');
    const embeddingsPath = path.join(DATA_DIR, 'embeddings.json');
    const analyticsPath = path.join(DATA_DIR, 'analytics.json');

    try {
      const docs = await fs.readFile(docsPath, 'utf-8');
      storage.documents = JSON.parse(docs);
    } catch (e) {
      // File doesn't exist yet
    }

    try {
      const chunks = await fs.readFile(chunksPath, 'utf-8');
      storage.chunks = JSON.parse(chunks);
    } catch (e) {
      // File doesn't exist yet
    }

    try {
      const embeddings = await fs.readFile(embeddingsPath, 'utf-8');
      storage.embeddings = JSON.parse(embeddings);
    } catch (e) {
      // File doesn't exist yet
    }

    try {
      const analytics = await fs.readFile(analyticsPath, 'utf-8');
      storage.analytics = JSON.parse(analytics);
    } catch (e) {
      // File doesn't exist yet
    }

    console.log(`✓ Data loaded: ${storage.documents.length} documents, ${storage.chunks.length} chunks`);
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

async function saveData() {
  try {
    await ensureDataDir();

    await fs.writeFile(
      path.join(DATA_DIR, 'documents.json'),
      JSON.stringify(storage.documents, null, 2)
    );

    await fs.writeFile(
      path.join(DATA_DIR, 'chunks.json'),
      JSON.stringify(storage.chunks, null, 2)
    );

    await fs.writeFile(
      path.join(DATA_DIR, 'embeddings.json'),
      JSON.stringify(storage.embeddings, null, 2)
    );

    await fs.writeFile(
      path.join(DATA_DIR, 'analytics.json'),
      JSON.stringify(storage.analytics, null, 2)
    );
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

export default {
  storage,
  loadData,
  saveData,
  ensureDataDir
};

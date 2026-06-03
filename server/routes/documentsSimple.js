import express from 'express';
import multer from 'multer';
import {
  ingestDocument,
  getDocuments,
  getDocumentById,
  getDocumentChunks,
  deleteDocument,
  getDocumentStats
} from '../services/documentServiceSimple.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const result = await ingestDocument(req.file, {
      department: req.body.department || 'Engineering',
      category: req.body.category || 'Documentation',
      version: req.body.version || '1.0',
      chunkingStrategy: req.body.chunkingStrategy || 'semantic'
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const filters = {
      department: req.query.department,
      category: req.query.category
    };

    const documents = await getDocuments(filters);
    res.json(documents);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const document = await getDocumentById(req.params.id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/chunks', async (req, res, next) => {
  try {
    const chunks = await getDocumentChunks(req.params.id);
    res.json(chunks);
  } catch (error) {
    next(error);
  }
});

router.get('/stats/overview', async (req, res, next) => {
  try {
    const stats = await getDocumentStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await deleteDocument(req.params.id);
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

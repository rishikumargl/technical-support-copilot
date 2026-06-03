import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import 'express-async-errors';
import storageDb from './storage.js';
import documentRoutes from './routes/documentsSimple.js';
import chatRoutes from './routes/chatSimple.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Load data at startup
await storageDb.loadData();

// Routes
app.use('/api/documents', documentRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);

  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    error: message,
    timestamp: new Date()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✅ RAG Assistant running on http://localhost:${PORT}`);
  console.log(`📚 Frontend: http://localhost:5173`);
  console.log(`🔌 Backend: http://localhost:${PORT}`);
  console.log(`✓ No database needed - using in-memory storage with JSON files\n`);
});

export default app;

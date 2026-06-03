# Quick Start Guide

## 5-Minute Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 13+ with pgvector
- OpenAI API key

### Step 1: Install Dependencies (2 min)
```bash
cd "c:/Users/priyanshu.pandey2/New folder"
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### Step 2: Configure Environment (1 min)
```bash
cp server/.env.example server/.env

# Edit server/.env with your values:
# - DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
# - OPENAI_API_KEY
```

### Step 3: Setup Database (1 min)
```bash
# Create database (PostgreSQL)
createdb -U postgres rag_assistant

# Run migrations
npm run db:migrate
```

### Step 4: Start Application (1 min)
```bash
npm run dev
```

**Access the application:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

## First Run Walkthrough

### 1. Upload Sample Documents

1. Navigate to "Documents" tab
2. Click "Upload Document"
3. Select `sample-documents/kubernetes-troubleshooting.md`
4. Choose settings:
   - Department: Engineering
   - Category: Troubleshooting
   - Chunking Strategy: Semantic
5. Click "Upload Document"
6. Repeat with `sample-documents/http-errors.md`

**Expected Result:**
- "kubernetes-troubleshooting.md" → ~8 chunks
- "http-errors.md" → ~15 chunks
- Total: 23 chunks indexed

### 2. Ask a Question

1. Navigate to "Chat" tab
2. Select search type: "Hybrid" (recommended)
3. Type: "How do I troubleshoot a CrashLoopBackOff error?"
4. Press Enter

**Expected Result:**
```
Answer: "CrashLoopBackOff is a Kubernetes status that indicates 
a pod is crashing repeatedly..."

Confidence: 92%
Sources Found: 5
Search Type: Hybrid
```

### 3. Review Sources

1. Click "Sources (5)"
2. Expand to see full chunk references
3. Verify information is accurate

### 4. Provide Feedback

1. Click "Helpful" or "Not Helpful"
2. This helps improve the system

---

## Common Questions

### Q: How do I add my own documents?

1. Prepare your document (PDF, TXT, or Markdown)
2. Go to Documents tab
3. Upload with appropriate metadata
4. System will automatically chunk and embed

### Q: What search type should I use?

- **Vector**: For semantic/conceptual queries
- **Keyword**: For exact term matching
- **Hybrid**: Best overall, combines both (recommended)

### Q: Why is the confidence low?

Low confidence means:
- Few relevant chunks found
- Chunks have low semantic similarity
- The knowledge base doesn't have complete information

To improve:
- Upload more relevant documents
- Ask more specific questions
- Adjust similarity threshold

### Q: How do I delete documents?

1. Go to Documents tab
2. Find the document in the list
3. Click the trash icon
4. Confirm deletion

---

## Architecture Overview

```
React Frontend (Chat UI)
        ↓ (HTTP)
Node.js Backend (Express)
        ↓ (SQL)
PostgreSQL + pgvector
```

### Data Flow

```
User Question
    ↓
Generate Embedding (OpenAI)
    ↓
Search Database (Vector + Keyword)
    ↓
Retrieve Top Results
    ↓
Generate Answer with LLM (OpenAI)
    ↓
Return with Sources
```

---

## API Endpoints

### Chat API

**Ask Question:**
```bash
curl -X POST http://localhost:5000/api/chat/ask \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How do I fix a 502 error?",
    "searchType": "hybrid",
    "topK": 5
  }'
```

**Response:**
```json
{
  "answer": "A 502 Bad Gateway occurs when...",
  "sources": [
    {
      "documentName": "http-errors.md",
      "chunkIndex": 2,
      "similarity": 0.92
    }
  ],
  "confidence": 0.92,
  "retrievedChunks": 3
}
```

### Document API

**Upload Document:**
```bash
curl -X POST http://localhost:5000/api/documents/upload \
  -F "file=@document.pdf" \
  -F "department=Engineering" \
  -F "category=Documentation"
```

**Get Documents:**
```bash
curl http://localhost:5000/api/documents?department=Engineering
```

**Delete Document:**
```bash
curl -X DELETE http://localhost:5000/api/documents/doc-id
```

---

## Troubleshooting

### Database connection error?
```bash
# Check PostgreSQL is running
psql -U postgres -l

# Verify connection string in .env
echo $DATABASE_URL
```

### OpenAI API error?
```bash
# Verify API key
echo $OPENAI_API_KEY

# Test API
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Port already in use?
```bash
# Find and kill process on port 5000
lsof -i :5000
kill -9 <PID>

# Or change PORT in .env
```

### Frontend not loading?
```bash
# Check if backend is running
curl http://localhost:5000/health

# Check browser console for CORS errors
# Verify CORS_ORIGIN in .env matches frontend URL
```

---

## Next Steps

### 1. Explore Features
- [ ] Try different search types
- [ ] Test with different document types
- [ ] Use metadata filters
- [ ] Provide feedback on results

### 2. Customize System
- [ ] Adjust chunking strategy per document
- [ ] Tune similarity threshold
- [ ] Modify LLM temperature
- [ ] Configure cache TTL

### 3. Scale Up
- [ ] Add more documents
- [ ] Optimize database indexes
- [ ] Set up monitoring
- [ ] Implement caching layer

### 4. Deploy to Production
- [ ] Follow DEPLOYMENT_GUIDE.md
- [ ] Set up reverse proxy
- [ ] Configure SSL/TLS
- [ ] Implement backup strategy

---

## Performance Tips

### Faster Searches
```javascript
// Increase TOP_K_RESULTS in .env to get more context
TOP_K_RESULTS=10

// Reduce chunk size for finer granularity
MAX_CHUNK_SIZE=500

// Enable query caching
useCache: true
```

### Better Results
```javascript
// Use semantic chunking for best quality
chunkingStrategy: 'semantic'

// Adjust similarity threshold based on needs
SIMILARITY_THRESHOLD=0.4  // More lenient
SIMILARITY_THRESHOLD=0.2  // More strict
```

### Production Optimization
```javascript
// Enable response caching
const useCache = true;

// Configure connection pooling
max: 20

// Set up monitoring
log all queries
```

---

## Key Concepts

### Chunking
Breaking documents into manageable pieces for processing and retrieval.

**Strategies:**
- Semantic: Splits on sentence boundaries (best quality)
- Fixed: Fixed-size chunks with overlap (fastest)
- Paragraph: Respects document structure

### Embedding
Converting text to numerical vectors for semantic comparison.

**Properties:**
- Dimensions: 1536 (OpenAI standard)
- Model: text-embedding-3-small
- Cached for performance

### Hybrid Search
Combining vector (semantic) and keyword (exact match) search.

**Benefits:**
- Captures meaning + exact matches
- More accurate than either alone
- Recommended default

### Hallucination Control
Preventing the system from generating unsupported answers.

**Methods:**
- Similarity threshold enforcement
- Conservative LLM prompting
- Source requirement
- Confidence scoring

---

## Example Queries

**Technical Support:**
- "How do I troubleshoot a CrashLoopBackOff error?"
- "What causes a 502 Bad Gateway?"
- "How can I fix ImagePullBackOff?"

**Troubleshooting:**
- "Pod is in pending state, why?"
- "How do I increase resource limits?"
- "What does DiskPressure mean?"

**Configuration:**
- "How do I set up HTTPS?"
- "What environment variables are needed?"
- "How do I enable logging?"

---

## Resources

- **Full Documentation**: See README.md
- **Architecture Details**: See ARCHITECTURE.md
- **Challenge Analysis**: See CHALLENGE_ANALYSIS.md
- **Deployment**: See DEPLOYMENT_GUIDE.md
- **Sample Docs**: See sample-documents/

---

## Support

Having issues? Check:
1. README.md troubleshooting section
2. GitHub issues (if hosted on GitHub)
3. Application logs: `pm2 logs`
4. Database logs: PostgreSQL logs

---

## Summary

You now have a production-ready RAG system that:
- ✓ Retrieves information accurately
- ✓ Prevents hallucinations
- ✓ Provides source attribution
- ✓ Scales to handle thousands of documents
- ✓ Works with multiple search strategies
- ✓ Collects feedback for improvement

Start asking questions and building your knowledge base!

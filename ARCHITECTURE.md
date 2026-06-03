# Architecture Documentation

## System Design

### Overview
This is a production-ready RAG system that retrieves and augments responses from a curated knowledge base. The system is designed to handle multiple document types, provide accurate retrieval, and prevent hallucinations through a multi-layered approach.

### Technology Stack
- **Frontend**: React 18 with Zustand (state management)
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with pgvector
- **LLM**: OpenAI GPT-3.5-turbo
- **Embeddings**: OpenAI text-embedding-3-small (1536 dimensions)

## Component Architecture

### 1. Document Ingestion Pipeline

```
Upload File
    ↓
Parse Content (PDF/TXT/MD)
    ↓
Extract Text
    ↓
Choose Chunking Strategy
    ├─ Semantic Chunking (sentence-based)
    ├─ Fixed-Size Chunking (size-based with overlap)
    └─ Paragraph-Aware Chunking (structure-aware)
    ↓
Store Chunks in Database
    ↓
Generate Embeddings (Batch)
    ├─ Cache locally for performance
    └─ Store in PostgreSQL
    ↓
Index for Search (Automatic)
```

**Key Decisions:**
- Semantic chunking by default for better quality
- Batch embedding generation for efficiency
- Metadata tracking for filtering and analysis
- Transaction-based ingestion for consistency

### 2. Retrieval System

```
User Query
    ↓
Prepare Query Text
    ├─ Check Query Cache
    └─ If cache miss, proceed
    ↓
Parallel Retrieval (3 strategies)
    ├─ Vector Search
    │  ├─ Generate query embedding
    │  ├─ Calculate cosine similarity
    │  └─ Apply similarity threshold
    │
    ├─ Keyword Search
    │  ├─ PostgreSQL full-text search
    │  └─ Calculate BM25 rank
    │
    └─ Hybrid Search (Recommended)
       ├─ Combine vector results (50%)
       ├─ Combine keyword results (50%)
       └─ Deduplicate and rank
    ↓
Apply Filters (Optional)
    ├─ Department
    ├─ Category
    └─ Version
    ↓
Retrieve Top-K Results
    ↓
[Optional] Rerank using Cross-Encoder
    ↓
Return Results with Metadata
```

**Retrieval Strategies:**

**Vector Search**
- Uses cosine similarity between query and chunk embeddings
- Strengths: Semantic understanding, captures meaning
- Weaknesses: Can miss exact matches, slower than keyword

**Keyword Search**
- Uses PostgreSQL full-text search
- Strengths: Fast, exact matches, works for structured data
- Weaknesses: No semantic understanding, requires exact terms

**Hybrid Search** (Recommended)
- Combines both approaches with equal weighting (50/50)
- Strengths: Balances semantic and exact matching
- Weaknesses: Requires tuning weights for different use cases

### 3. Response Generation

```
Retrieved Chunks
    ↓
Format Context with Sources
    ├─ Include document names
    ├─ Include chunk indices
    └─ Include source metadata
    ↓
Send to LLM with Prompt
    ├─ System prompt (role and constraints)
    ├─ Context (retrieved chunks)
    └─ User query
    ↓
Temperature: 0.3 (Low for consistency)
Max Tokens: 1000
    ↓
Post-Process Response
    ├─ Check for hallucination markers
    ├─ Add confidence score
    └─ Include source citations
    ↓
Cache Result (60-min TTL)
    ↓
Log Analytics
    ↓
Return to User
```

**Hallucination Control Mechanisms:**

1. **Similarity Threshold**
   - Enforces minimum similarity (0.3 by default)
   - No response if top result below threshold

2. **Confidence Scoring**
   - Based on similarity of top result
   - Reported to user for transparency
   - Used for result ranking

3. **Conservative Prompting**
   - System prompt explicitly states constraints
   - Instructs LLM to refuse unsupported answers
   - Uses low temperature (0.3) for consistency

4. **Source Requirement**
   - Every response must cite sources
   - Users can verify answers
   - Clear indication if insufficient data

## Data Models

### Chunk Structure
```javascript
{
  id: UUID,
  document_id: UUID,
  content: string,
  chunk_index: number,
  start_position: number,
  end_position: number,
  metadata: {
    strategy: 'semantic' | 'fixed-size' | 'paragraph-aware',
    sentenceCount: number,
    // ... custom metadata
  }
}
```

### Search Result
```javascript
{
  id: UUID,
  content: string,
  document_id: UUID,
  document_name: string,
  department: string,
  category: string,
  chunk_index: number,
  similarity: number,  // 0-1 for vector, rank for keyword
  hybridScore: number  // combined score
}
```

### Response
```javascript
{
  answer: string,
  sources: [{
    documentId: UUID,
    documentName: string,
    department: string,
    category: string,
    chunkContent: string,
    chunkIndex: number,
    similarity: number,
    sourceNumber: number
  }],
  confidence: number,  // 0-1
  retrievedChunks: number,
  searchType: 'vector' | 'keyword' | 'hybrid',
  hallucinated: boolean,
  timestamp: Date,
  fromCache: boolean
}
```

## Chunking Strategy Analysis

### Semantic Chunking
```javascript
// Split on sentence boundaries
"Document. Another sentence. More text."
// Results in more natural chunks that preserve meaning

// Pros:
✓ Better semantic coherence
✓ Fewer out-of-context chunks
✓ Better for QA tasks

// Cons:
✗ Slower processing
✗ Variable chunk sizes
✗ May miss important context between sentences
```

### Fixed-Size Chunking
```javascript
// Split every N characters with overlap
const chunkSize = 1000
const overlap = 200
// Chunk 1: [0-1000]
// Chunk 2: [800-1800]
// Chunk 3: [1600-2600]

// Pros:
✓ Fast and predictable
✓ Consistent sizes
✓ Simple to implement

// Cons:
✗ May cut mid-sentence
✗ Loses context at boundaries
✗ Wastes token budget on overlap
```

### Paragraph-Aware Chunking
```javascript
// Respect document structure while maintaining size
// Split on paragraph boundaries, combine to reach target size

// Pros:
✓ Preserves document structure
✓ Good for formatted documents
✓ Better context preservation

// Cons:
✗ Variable sizes
✗ Slower than fixed-size
✗ Requires parsed structure
```

## Database Schema

### Performance Optimizations

**Indexes Created:**
```sql
-- Metadata filtering
CREATE INDEX idx_documents_department ON documents(department);
CREATE INDEX idx_documents_category ON documents(category);

-- Chunk retrieval
CREATE INDEX idx_chunks_document_id ON chunks(document_id);

-- Embedding lookup
CREATE INDEX idx_embeddings_chunk_id ON embeddings(chunk_id);

-- Cache management
CREATE INDEX idx_query_cache_hash ON query_cache(query_hash);

-- Analytics querying
CREATE INDEX idx_search_analytics_created_at ON search_analytics(created_at);

-- Vector similarity (pgvector specific)
CREATE INDEX idx_embeddings_vector ON embeddings 
USING ivfflat (embedding vector_cosine_ops);
```

**Estimated Query Times:**
- Vector search: ~50-100ms (with index)
- Keyword search: ~10-30ms
- Hybrid search: ~100-150ms
- Document lookup: ~5ms
- Cache lookup: ~1ms

## Scaling Considerations

### Horizontal Scaling

**Database Sharding:**
```
Documents Split by Department:
├─ Shard 1: Engineering (10GB)
├─ Shard 2: Operations (8GB)
├─ Shard 3: Support (5GB)
└─ Shard 4: Product (7GB)
```

**Read Replicas:**
```
Primary Database (Write)
├─ Read Replica 1 (Search queries)
├─ Read Replica 2 (Analytics)
└─ Read Replica 3 (Backup)
```

**Load Balancing:**
```
[User] → Load Balancer (nginx)
          ├─ API Server 1
          ├─ API Server 2
          └─ API Server 3
```

### Vertical Scaling

**Current Limits:**
- Single server: ~1M chunks
- Single database: ~100GB
- Concurrent users: ~100

**Improvements Needed:**
- Enable connection pooling
- Implement query caching
- Add Redis for distributed cache
- Optimize vector search

## Security Architecture

### Data Protection

1. **Authentication**
   - API key validation (future)
   - JWT token support (future)

2. **Authorization**
   - Department-based access control (future)
   - Role-based filtering

3. **Encryption**
   - TLS for transit
   - Database encryption at rest (future)

4. **Input Validation**
   - File type validation
   - File size limits (50MB)
   - Query length limits

### API Security

```javascript
// CORS Configuration
cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
})

// Rate Limiting (Future)
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// Input Validation
const { body, validationResult } = require('express-validator');
```

## Monitoring & Observability

### Metrics Collected

**Search Analytics:**
- Query count by search type
- Average response time
- Retrieval quality (user feedback)
- Cache hit rate

**System Metrics:**
- Database query times
- API response times
- Error rates
- Resource utilization

### Logging Strategy

```javascript
// Structured logging
logger.info('Query processed', {
  queryId: '...',
  searchType: 'hybrid',
  resultsFound: 5,
  responseTime: 123,
  cached: false,
  timestamp: new Date()
});

// Error logging with context
logger.error('Retrieval failed', {
  error: error.message,
  queryId: '...',
  stack: error.stack
});
```

### Alerting

**Production Alerts:**
- Error rate > 5%
- Response time > 5s
- Database connection failures
- Cache hit rate < 30%

## Cost Analysis

### OpenAI API Usage

**Embeddings:**
- Cost: $0.02 per 1M input tokens
- Example: 1000 documents × 10 chunks × 500 tokens = 5M tokens = $0.10

**Chat Completions:**
- Cost: $0.0005 per 1K input tokens, $0.0015 per 1K output tokens
- Example: 100 queries × (2000 input + 500 output) = $0.20/day = $6/month

**Estimate for 1000 users:**
- Monthly API cost: ~$200-300

### Infrastructure Costs

**Database (PostgreSQL):**
- Small: $20-50/month
- Medium: $100-200/month
- Large: $300-500/month

**Application Server:**
- Small: $10-20/month
- Medium: $50-100/month
- Large: $200-300/month

**Total Monthly Cost (Medium):**
- API: $250
- Database: $150
- Server: $75
- **Total: ~$475/month**

## Deployment Checklist

- [ ] Configure environment variables
- [ ] Set up PostgreSQL with pgvector
- [ ] Run database migrations
- [ ] Build React frontend
- [ ] Configure reverse proxy (nginx)
- [ ] Set up HTTPS/SSL
- [ ] Enable backup strategy
- [ ] Set up monitoring/alerting
- [ ] Load test the system
- [ ] Document runbooks
- [ ] Set up CI/CD pipeline
- [ ] Plan disaster recovery

## Future Roadmap

### Phase 2
- [ ] User authentication
- [ ] Multi-tenant support
- [ ] Advanced analytics dashboard
- [ ] Document versioning
- [ ] Workflow automation

### Phase 3
- [ ] Custom embedding models
- [ ] Fine-tuned LLMs
- [ ] Real-time collaboration
- [ ] Advanced RBAC
- [ ] Audit logging

### Phase 4
- [ ] Federated search (multiple knowledge bases)
- [ ] Knowledge graph integration
- [ ] Automatic document summarization
- [ ] Continuous learning from feedback

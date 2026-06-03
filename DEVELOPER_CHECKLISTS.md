# Developer Checklists - Quick Reference for Each Person

## PERSON 1: Frontend Developer

### First Time Setup
```bash
# Clone repository
cd "c:/Users/priyanshu.pandey2/New folder"
git clone <repository-url> rag-assistant
cd rag-assistant

# Install dependencies
cd team/frontend
npm install

# Start development
npm run dev

# Open browser to http://localhost:5173
```

### Daily Workflow

**Morning:**
```bash
git checkout main
git pull origin main
```

**Start new feature:**
```bash
git checkout -b feature/frontend/<feature-name>
```

**Make changes in:** `team/frontend/src/`

**Commit when ready:**
```bash
git add team/frontend/src/components/YourComponent.jsx
git commit -m "feat(frontend): description of change

- Detail 1
- Detail 2"
```

**Push when done:**
```bash
git push origin feature/frontend/<feature-name>
```

**Create Pull Request:**
- Go to GitHub
- New PR
- Request review from team
- Wait for approval
- Merge when ready

### Key Files
- `team/frontend/src/App.jsx` - Main component
- `team/frontend/src/components/` - Reusable components
- `team/frontend/src/api.js` - API calls
- `team/frontend/src/store.js` - State management

### What You Need from Others
- ✅ Person 2: API endpoints `/api/chat/ask`, `/api/documents/*`
- ✅ Person 5: Utilities from core-utils

### Commit Example
```bash
git add team/frontend/src/components/ChatInterface.jsx
git commit -m "feat(frontend): add ChatInterface component

Implements:
- Message input field
- Send button with loading state
- Message display area
- Source attribution display

Related: Backend API endpoints from Person 2"
```

---

## PERSON 2: Backend API Developer

### First Time Setup
```bash
# Clone repository
cd "c:/Users/priyanshu.pandey2/New folder"
git clone <repository-url> rag-assistant
cd rag-assistant

# Install dependencies
cd team/backend-api
npm install

# Note: Full backend server starts from server/indexSimple.js
# But you work only in team/backend-api/
```

### Daily Workflow

**Morning:**
```bash
git checkout main
git pull origin main
```

**Start new feature:**
```bash
git checkout -b feature/backend-api/<feature-name>
```

**Make changes in:** `team/backend-api/routes/` and `team/backend-api/controllers/`

**Commit when ready:**
```bash
git add team/backend-api/routes/chat.js
git commit -m "feat(backend-api): add chat endpoint

Endpoint: POST /api/chat/ask
Request: { query, searchType, topK }
Response: { answer, sources, confidence }

Calls: RAG Service from Person 3"
```

**Push and create PR:**
```bash
git push origin feature/backend-api/<feature-name>
```

### Key Files
- `team/backend-api/routes/chat.js` - Chat endpoints
- `team/backend-api/routes/documents.js` - Document endpoints
- `team/backend-api/controllers/` - Business logic

### What You Need from Others
- ✅ Person 3: RAG services (answerQuestion, logFeedback)
- ✅ Person 4: Document services (uploadDocument, getDocuments)
- ✅ Person 5: Error handling utils

### Commit Example
```bash
git add team/backend-api/controllers/chatController.js
git commit -m "feat(backend-api): add chat controller

Functions:
- askQuestion(req, res) - Handle chat requests
- Validate input query
- Call RAG service
- Return formatted response

Error handling:
- 400 for invalid input
- 500 for server errors"
```

---

## PERSON 3: RAG Services Developer

### First Time Setup
```bash
# Clone repository
cd "c:/Users/priyanshu.pandey2/New folder"
git clone <repository-url> rag-assistant
cd rag-assistant

# Install dependencies
cd team/rag-services
npm install
```

### Daily Workflow

**Morning:**
```bash
git checkout main
git pull origin main
```

**Start new feature:**
```bash
git checkout -b feature/rag-services/<feature-name>
```

**Make changes in:** `team/rag-services/services/`

**Commit when ready:**
```bash
git add team/rag-services/services/retrievalService.js
git commit -m "feat(rag-services): implement hybrid search

Algorithm:
- Vector search (50% weight)
- Keyword search (50% weight)
- Deduplicate and score
- Return top-K results

Performance: 150ms average latency"
```

**Push and create PR:**
```bash
git push origin feature/rag-services/<feature-name>
```

### Key Files
- `team/rag-services/services/ragService.js` - Main RAG logic
- `team/rag-services/services/retrievalService.js` - Search strategies
- `team/rag-services/index.js` - Module exports

### What You Need from Others
- ✅ Person 4: Document retrieval (getChunks, retrieveChunks)
- ✅ Person 5: Embeddings (generateEmbedding), similarity calculation

### Commit Example
```bash
git add team/rag-services/services/ragService.js
git commit -m "feat(rag-services): add RAG orchestration

Main function: answerQuestion(query, options)
- Retrieve relevant chunks
- Generate answer with LLM
- Include source attribution
- Calculate confidence score
- Implement caching

Calls dependencies:
- retrievalService.hybridSearch()
- Document service for chunks
- Core utils for embeddings"
```

---

## PERSON 4: Document Processing Developer

### First Time Setup
```bash
# Clone repository
cd "c:/Users/priyanshu.pandey2/New folder"
git clone <repository-url> rag-assistant
cd rag-assistant

# Install dependencies
cd team/document-processing
npm install
```

### Daily Workflow

**Morning:**
```bash
git checkout main
git pull origin main
```

**Start new feature:**
```bash
git checkout -b feature/document-processing/<feature-name>
```

**Make changes in:** `team/document-processing/services/` and `team/document-processing/utils/`

**Commit when ready:**
```bash
git add team/document-processing/utils/chunkingStrategies.js
git commit -m "feat(document-processing): add semantic chunking

Algorithm:
- Split on sentence boundaries
- Preserve semantic meaning
- Handle edge cases
- Track positions

Impact: 20% improvement in Q&A accuracy"
```

**Push and create PR:**
```bash
git push origin feature/document-processing/<feature-name>
```

### Key Files
- `team/document-processing/services/documentService.js` - Document management
- `team/document-processing/utils/chunkingStrategies.js` - Chunking algorithms
- `team/document-processing/utils/pdfParser.js` - PDF extraction

### What You Need from Others
- ✅ Person 5: Storage (storeChunk), embeddings (generateEmbedding)

### Commit Example
```bash
git add team/document-processing/services/documentService.js
git commit -m "feat(document-processing): implement document upload

Function: ingestDocument(file, metadata)
Process:
1. Extract text from PDF/TXT/MD
2. Apply chunking strategy
3. Store chunks with metadata
4. Generate embeddings for each

Returns: {documentId, chunksCreated, strategy}

Supported formats: PDF, TXT, Markdown"
```

---

## PERSON 5: Core Utils Developer

### First Time Setup
```bash
# Clone repository
cd "c:/Users/priyanshu.pandey2/New folder"
git clone <repository-url> rag-assistant
cd rag-assistant

# Install dependencies
cd team/core-utils
npm install
```

### Daily Workflow

**Morning:**
```bash
git checkout main
git pull origin main
```

**Start new feature:**
```bash
git checkout -b feature/core-utils/<feature-name>
```

**Make changes in:** `team/core-utils/embeddings/`, `team/core-utils/storage/`, `team/core-utils/utils/`

**Commit when ready:**
```bash
git add team/core-utils/embeddings/embeddings.js
git commit -m "feat(core-utils): add embedding cache

Implementation:
- LRU cache with 10k capacity
- Cache statistics tracking
- Automatic eviction
- Thread-safe operations

Performance: <1ms on cache hit vs 2000ms API call
Hit rate: 60-70% expected"
```

**Push and create PR:**
```bash
git push origin feature/core-utils/<feature-name>
```

### Key Files
- `team/core-utils/embeddings/embeddings.js` - OpenAI embeddings
- `team/core-utils/embeddings/embeddingsMock.js` - Demo mode
- `team/core-utils/storage/storage.js` - JSON storage
- `team/core-utils/utils/errors.js` - Error handling

### Important: You're the Foundation
All other 4 people depend on your code!
- Person 1 (frontend) - uses error handling
- Person 2 (api) - uses error handling
- Person 3 (rag) - uses embeddings
- Person 4 (docs) - uses embeddings & storage

### Commit Example
```bash
git add team/core-utils/storage/storage.js
git commit -m "feat(core-utils): add persistent storage

Features:
- Save documents to data/documents.json
- Save chunks to data/chunks.json
- Save embeddings to data/embeddings.json
- Auto-load on startup
- Auto-save on changes

Used by:
- Person 3 (RAG caching)
- Person 4 (Document storage)
- All modules (Error handling)"
```

---

## General Git Commands (Everyone)

### Check what you changed
```bash
git diff team/<your-module>/
```

### See your commits
```bash
git log --oneline team/<your-module>/
```

### Undo changes in a file
```bash
git checkout team/<your-module>/filename.js
```

### See status
```bash
git status
```

### Unstage a file
```bash
git reset team/<your-module>/filename.js
```

### Undo last commit (before pushing)
```bash
git reset --soft HEAD~1
```

### Push a branch
```bash
git push origin feature/<your-module>/<feature-name>
```

### Pull latest main
```bash
git fetch origin
git rebase origin/main
```

---

## Merge Conflicts - How to Handle

**If you see conflicts when pulling main:**

```bash
# 1. See what files have conflicts
git status

# 2. Open conflicted files in your editor
# Look for:
# <<<<<<< HEAD
# your changes
# =======
# their changes
# >>>>>>> main

# 3. Fix the conflicts manually

# 4. Mark as resolved
git add team/<your-module>/<fixed-file>

# 5. Continue the merge/rebase
git rebase --continue

# 6. Push
git push origin feature/<your-module>/<feature> -f
```

---

## Before You Commit - Checklist

Every developer should check:

- [ ] My changes are ONLY in `team/<my-module>/`
- [ ] Code works when tested locally
- [ ] No console errors
- [ ] Commit message describes WHAT and WHY
- [ ] Related files are committed together
- [ ] No accidental debug code left in

---

## Asking for Help

**In team chat:**
```
@Person X - Question about X

Problem: [describe issue]
File: team/<module>/filename.js
Context: [explain what you're trying to do]

Thanks!
```

**In PR comments:**
```
@Person X - Can you review this part?

I did X but I'm not sure if it's correct.
The issue is...
```

---

## Success Indicators

✅ You pushed code to your feature branch
✅ You created a Pull Request
✅ You got at least 1 approval
✅ Your PR was merged to main
✅ Other developers can now use your code

---

For more details, see:
- `TEAM_STRUCTURE.md` - Overall team organization
- `INTEGRATION_GUIDE.md` - How to work together
- `team/<your-module>/README.md` - Your specific guide

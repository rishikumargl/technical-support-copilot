# RAG Assistant - No Database Required ⚡

**Run the app immediately without setting up PostgreSQL!**

## Quick Start (2 Minutes)

### 1. Set Your OpenAI API Key

Get a free API key from [OpenAI](https://platform.openai.com/api-keys)

**On Windows (Command Prompt):**
```cmd
set OPENAI_API_KEY=sk-your-api-key-here
run-no-db.bat
```

**On Mac/Linux:**
```bash
export OPENAI_API_KEY=sk-your-api-key-here
chmod +x run-no-db.sh
./run-no-db.sh
```

**Or edit the file:**
```bash
# Edit server/.env and replace:
OPENAI_API_KEY=sk-your-api-key-here
```

### 2. Install Dependencies

```bash
cd "c:/Users/priyanshu.pandey2/New folder"
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### 3. Run the Application

**Windows:**
```cmd
run-no-db.bat
```

**Mac/Linux:**
```bash
./run-no-db.sh
```

**Or manually (any OS):**
```bash
# Terminal 1: Backend
cd server
node indexSimple.js

# Terminal 2: Frontend
cd client
npm run dev
```

### 4. Access the App

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

---

## What's Different?

### ✅ No Database Setup Needed
- Uses in-memory storage with JSON files
- Data saved to `data/` directory
- Everything works offline

### ✅ Same Features as Full Version
- Upload documents (PDF, TXT, Markdown)
- Search with multiple strategies (vector, keyword, hybrid)
- AI-powered answers
- Source attribution
- Feedback collection

### ⚠️ Limitations
- Data is only persisted locally (not in production database)
- All data stored in `data/` folder (JSON files)
- No concurrent multi-user support
- Performance optimized for <1000 documents

---

## First Run

### Step 1: Upload Sample Documents

The `sample-documents/` folder has two files ready:
- `kubernetes-troubleshooting.md` (8 KB)
- `http-errors.md` (12 KB)

1. Go to **Documents** tab
2. Click **Upload Document**
3. Select `sample-documents/kubernetes-troubleshooting.md`
4. Choose settings:
   - Department: Engineering
   - Category: Troubleshooting
5. Click **Upload Document**

Repeat with `http-errors.md`

### Step 2: Ask a Question

1. Go to **Chat** tab
2. Select **Hybrid** search (recommended)
3. Type: "How do I troubleshoot a CrashLoopBackOff error?"
4. Press Enter
5. See the answer with sources!

### Step 3: Try More Questions

```
"What causes a 502 Bad Gateway?"
"How can I resolve an ImagePullBackOff?"
"What's a 404 error?"
"How do I debug Kubernetes pods?"
```

---

## Data Storage

All data is stored in the `data/` folder:

```
data/
├── documents.json      # Uploaded documents metadata
├── chunks.json         # Text chunks from documents
├── embeddings.json     # Vector embeddings
└── analytics.json      # Search queries and feedback
```

**Files are auto-saved** whenever you:
- Upload a document
- Ask a question (cached)
- Provide feedback

---

## Troubleshooting

### "Cannot find module" error?
```bash
# Install dependencies again
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### "OpenAI API error"?
```bash
# Make sure API key is set correctly
echo %OPENAI_API_KEY%  # Windows
echo $OPENAI_API_KEY   # Mac/Linux

# Should show: sk-...
# If empty, set it again:
set OPENAI_API_KEY=sk-your-key
```

### Port 5000 or 5173 already in use?
```bash
# Edit .env to use different ports:
PORT=5001  # Use 5001 instead of 5000
```

### Slow responses on first query?
- First call generates embeddings (takes ~5-10 seconds)
- Subsequent queries are faster
- Cached queries are nearly instant

### "No relevant information found"?
- Upload more documents
- Rephrase your question
- Check that documents were uploaded successfully

---

## Performance Tips

### Faster Searches
- Use **Hybrid** search (combines vector + keyword)
- Keep chunk size reasonable (1000 characters default)
- Cached queries are instant

### Better Results
- Use semantic chunking (default)
- Upload well-structured documents
- Provide clear, specific questions

### System Performance
- <100 documents: No optimization needed
- 100-1000 documents: Still runs smoothly
- \>1000 documents: Consider using full database version

---

## Converting to Database Version

To upgrade to the full PostgreSQL version later:

1. Install PostgreSQL with pgvector
2. Update `server/index.js` imports
3. Replace `documentServiceSimple.js` with `documentService.js`
4. Replace `retrievalServiceSimple.js` with `retrievalService.js`
5. Replace `ragServiceSimple.js` with `ragService.js`

See `DEPLOYMENT_GUIDE.md` for details.

---

## API Examples

### Ask a Question
```bash
curl -X POST http://localhost:5000/api/chat/ask \
  -H "Content-Type: application/json" \
  -d '{"query":"How do I fix a 502 error?"}'
```

### Upload Document
```bash
curl -X POST http://localhost:5000/api/documents/upload \
  -F "file=@document.pdf" \
  -F "department=Engineering"
```

### Get Documents
```bash
curl http://localhost:5000/api/documents
```

### Get Statistics
```bash
curl http://localhost:5000/api/documents/stats/overview
```

---

## What's Next?

### Explore Features
- [ ] Upload different file types
- [ ] Try all search strategies
- [ ] Use metadata filters
- [ ] Provide feedback on answers

### Customize
- [ ] Adjust chunking strategy
- [ ] Tune similarity threshold
- [ ] Change LLM temperature
- [ ] Configure cache settings

### Scale Up
- [ ] Add more documents
- [ ] Monitor performance
- [ ] Collect analytics
- [ ] Switch to PostgreSQL version

---

## Architecture

No database = simpler architecture:

```
React Frontend
    ↕ REST API (Express)
Node.js Backend
    ↕ File I/O
JSON Files (data/)
    ↕
OpenAI API (Embeddings & Chat)
```

**Data Flow:**
1. Upload document → Extract text → Generate embeddings → Save JSON
2. Ask question → Generate query embedding → Search → Call LLM → Return answer
3. Provide feedback → Update analytics JSON

---

## Security Notes

### Safe to Use Locally
- No external database exposure
- All data stays on your machine
- OpenAI API key used for LLM only

### For Production
- Don't use JSON file storage
- Switch to PostgreSQL version
- Add authentication
- Use environment variables for secrets

---

## FAQ

**Q: Can multiple people use it at once?**
A: Not recommended. JSON file storage doesn't support concurrent writes.

**Q: How long does embedding generation take?**
A: First query: ~5-10 seconds. Cached queries: <1 second.

**Q: Can I export my data?**
A: Yes! Data is in `data/` folder as plain JSON files.

**Q: What happens if I close the terminal?**
A: Data is saved to `data/` folder. Reopen and data is still there.

**Q: Can I use custom OpenAI models?**
A: Yes. Edit `server/servicesSimple/ragServiceSimple.js` to change the model.

**Q: Is this slower than the database version?**
A: Slightly, for 1000+ documents. But fine for typical use cases.

---

## Need Help?

- See **README.md** for full documentation
- See **ARCHITECTURE.md** for technical details
- See **CHALLENGE_ANALYSIS.md** for production insights

---

**Happy RAG-ing! 🚀**

Start with: `run-no-db.bat` (Windows) or `./run-no-db.sh` (Mac/Linux)

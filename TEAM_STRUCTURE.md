# RAG Assistant - Team Structure (5 Developers)

## Team Organization

The project is divided into 5 independent modules that can be worked on in parallel:

```
RAG Assistant
├── team/
│   ├── frontend/              (Person 1 - React Developer)
│   ├── backend-api/           (Person 2 - API Developer)
│   ├── rag-services/          (Person 3 - AI/ML Developer)
│   ├── document-processing/   (Person 4 - Data Engineer)
│   └── core-utils/            (Person 5 - Infrastructure/Utils)
│
├── root-level files (shared)
│   ├── package.json
│   ├── .gitignore
│   └── README.md
```

## Module Responsibilities

| Module | Developer | Responsibility |
|--------|-----------|-----------------|
| **frontend** | Person 1 | React UI, Components, State Management |
| **backend-api** | Person 2 | Express Routes, Controllers, API Endpoints |
| **rag-services** | Person 3 | RAG Logic, Retrieval, Answer Generation |
| **document-processing** | Person 4 | Document Ingestion, Chunking, Parsing |
| **core-utils** | Person 5 | Embeddings, Storage, Database, Utilities |

## Git Workflow

### Initial Setup (One-time)

```bash
# Everyone starts here
cd "c:/Users/priyanshu.pandey2/New folder"
git clone <repository-url>
cd RAG-Assistant

# Install root dependencies
npm install
```

### Daily Workflow

Each developer follows the same pattern:

```bash
# 1. Update main branch
git checkout main
git pull origin main

# 2. Create feature branch (from your module)
git checkout -b feature/<your-module>/<feature-name>

# 3. Work on your code
# ... make changes ...

# 4. Commit frequently
git add <files>
git commit -m "feat(<module>): description"

# 5. Push to remote
git push origin feature/<your-module>/<feature-name>

# 6. Create Pull Request on GitHub
# Review → Approve → Merge to main
```

## Commit Message Convention

Each developer should follow this format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `docs:` - Documentation
- `test:` - Tests
- `chore:` - Build, dependencies, etc.

**Example:**
```
feat(frontend): add chat message component
fix(rag-services): handle empty chunks in retrieval
refactor(core-utils): optimize embedding caching
```

## Module Dependencies

```
frontend (UI)
    ↓ (API calls)
backend-api (Routes)
    ↓ (imports)
├── rag-services (Answer generation)
│   ├── (uses)
│   └── core-utils (Embeddings)
│
├── document-processing (Document handling)
│   ├── (uses)
│   └── core-utils (Storage, parsing)
│
└── core-utils (Foundation)
    ├── Embeddings
    ├── Storage
    └── Utilities
```

## Integration Points

**Frontend → Backend-API:**
- HTTP requests to `/api/*` endpoints
- JSON request/response bodies

**Backend-API → RAG-Services:**
- Question answering requests
- Feedback logging

**Backend-API → Document-Processing:**
- Document upload handling
- Chunk retrieval

**RAG-Services → Core-Utils:**
- Embedding generation
- Similarity calculations

**Document-Processing → Core-Utils:**
- Chunk storage
- Metadata management

## Communication

- **Daily standup**: 10:00 AM
- **Code review**: Post PR in Slack
- **Blockers**: Discuss in team chat immediately
- **Documentation**: Update in shared wiki

## Merge Strategy

1. Create feature branch
2. Make commits
3. Push to remote
4. Create Pull Request (PR)
5. Team review (at least 1 approval)
6. Merge to main with message:
   ```
   Merge PR #123: <description>
   
   Co-authored-by: Person1 <email1>
   Co-authored-by: Person2 <email2>
   ```

## Release Process

When ready to release:

```bash
git checkout main
git pull origin main
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

## Emergency Hotfix

If critical bug is found:

```bash
git checkout -b hotfix/critical-bug
# Fix the bug
git commit -m "hotfix: critical-bug description"
git push origin hotfix/critical-bug
# Create PR, merge to main
# Cherry-pick to release branch if needed
```

---

Each team member should follow the specific README in their module folder for detailed setup and workflow instructions.

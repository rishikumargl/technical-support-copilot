# Team Workflow Summary - Start Here!

## Quick Navigation

👤 **Which guide is for you?**

| If you are... | Read this first |
|---|---|
| **Person 1** (Frontend) | `team/frontend/README.md` + `DEVELOPER_CHECKLISTS.md` |
| **Person 2** (Backend API) | `team/backend-api/README.md` + `DEVELOPER_CHECKLISTS.md` |
| **Person 3** (RAG Services) | `team/rag-services/README.md` + `DEVELOPER_CHECKLISTS.md` |
| **Person 4** (Document Processing) | `team/document-processing/README.md` + `DEVELOPER_CHECKLISTS.md` |
| **Person 5** (Core Utils) | `team/core-utils/README.md` + `DEVELOPER_CHECKLISTS.md` |
| **Team Lead** | `TEAM_STRUCTURE.md` + `INTEGRATION_GUIDE.md` |

---

## The Super Quick Workflow (Everyone)

### First Day
```bash
# Step 1: Clone repo
cd "c:/Users/priyanshu.pandey2/New folder"
git clone <repository-url> rag-assistant
cd rag-assistant

# Step 2: Navigate to your module
cd team/frontend  # or backend-api, rag-services, document-processing, core-utils

# Step 3: Install dependencies
npm install
```

### Every Day
```bash
# Step 1: Stay in sync
git checkout main
git pull origin main

# Step 2: Create feature branch
git checkout -b feature/<your-module>/<feature-name>

# Step 3: Make changes (only in your module!)

# Step 4: Commit frequently
git add team/<your-module>/<changed-file>
git commit -m "feat(<module>): description of what you did"

# Step 5: Push
git push origin feature/<your-module>/<feature-name>

# Step 6: Create Pull Request on GitHub
# - Go to GitHub
# - Click "New Pull Request"
# - Wait for reviews
# - Merge when approved
```

### That's it! 🎉

---

## Your Module & Responsibilities

```
team/
├── frontend/                 Person 1
│   └── React UI, components, state management
│
├── backend-api/              Person 2
│   └── Express routes, API endpoints
│
├── rag-services/             Person 3
│   └── RAG logic, answer generation, retrieval
│
├── document-processing/      Person 4
│   └── Document upload, chunking, text extraction
│
└── core-utils/               Person 5
    └── Embeddings, storage, utilities (foundation)
```

---

## Git Commit Template (Use This!)

```bash
git commit -m "feat(<your-module>): short description

- Detailed point 1
- Detailed point 2
- Detailed point 3"
```

**Examples:**

```bash
# Person 1
git commit -m "feat(frontend): add chat message component

- Display user and AI messages
- Show sources and confidence
- Add helpful/not helpful buttons"

# Person 2
git commit -m "feat(backend-api): add chat endpoint

- POST /api/chat/ask
- Validate query parameter
- Call RAG service and return answer"

# Person 3
git commit -m "feat(rag-services): implement hybrid search

- Combine vector and keyword search
- Score and deduplicate results
- Return top-K results"

# Person 4
git commit -m "feat(document-processing): add PDF extraction

- Parse PDF files
- Extract text
- Handle errors gracefully"

# Person 5
git commit -m "feat(core-utils): add embedding cache

- LRU cache with 10k capacity
- Cache hit statistics
- Automatic eviction"
```

---

## Daily Git Commands (Quick Reference)

```bash
# See what you changed
git diff team/<your-module>/

# See your commits
git log --oneline team/<your-module>/

# See status
git status

# Stage files
git add team/<your-module>/

# Commit
git commit -m "message"

# Push
git push origin feature/<your-module>/<feature-name>

# Undo changes to a file
git checkout team/<your-module>/file.js

# Undo last commit (before pushing)
git reset --soft HEAD~1
```

---

## When You Get Stuck

### "I need something from Person X"

**Example: Person 3 needs Person 5's embeddings**

```bash
# Option 1: Wait for them to finish and merge to main
git checkout main
git pull origin main
# Now you can import their code

# Option 2: Use a temporary version while they work
# Create a mock/stub of what you need
# Replace with real code later
```

### "I have a merge conflict"

```bash
# Update from main first
git fetch origin
git merge origin/main

# Fix the conflicts in your editor
# (look for <<<<<<< and >>>>>>>)

# Then commit and push
git add team/<your-module>/
git commit -m "fix: resolve merge conflict"
git push origin feature/<your-module>/<feature> -f
```

### "I committed to main by accident"

```bash
# Undo the commit on main
git reset --soft HEAD~1

# Create proper branch
git checkout -b feature/<your-module>/<feature>

# Recommit
git commit -m "feat(<module>): message"

# Push
git push origin feature/<your-module>/<feature>
```

---

## Integration Timeline

```
Week 1:
├─ Person 5 → Core Utils (foundation)
├─ Person 4 → Document Processing (uses Person 5)
└─ Person 3 → RAG Services (uses Person 5 & 4)

Week 2:
└─ Person 2 → Backend API (uses Person 3 & 4)

Week 3:
└─ Person 1 → Frontend (uses Person 2)

Week 4:
└─ Integration & Testing
```

---

## Code Review Process

### When you create a Pull Request:

1. **Create PR** on GitHub
   - Title: `feat(module): description`
   - Description: Explain what you did

2. **Request Reviewers**
   - At least 2 team members
   - Tag people who depend on your code

3. **Address Feedback**
   - Make changes
   - Commit and push
   - PR updates automatically

4. **Get Approval**
   - Wait for ✅ from reviewers

5. **Merge PR**
   - Click "Merge Pull Request"
   - Choose "Squash and merge"

6. **Sync Everyone**
   - Everyone: `git pull origin main`

---

## Useful Links

- `TEAM_STRUCTURE.md` - Overall team org
- `INTEGRATION_GUIDE.md` - How to work together
- `DEVELOPER_CHECKLISTS.md` - Your specific guide
- `team/<your-module>/README.md` - Detailed module guide
- `README.md` - Project overview

---

## Success Checklist

By end of project:

- ✅ Person 1: Frontend working, components complete
- ✅ Person 2: All API endpoints working
- ✅ Person 3: RAG logic complete and tested
- ✅ Person 4: Document processing working
- ✅ Person 5: Embeddings and storage working
- ✅ All 5 modules integrated
- ✅ All commits merged to main
- ✅ Application works end-to-end
- ✅ Each person has 20+ commits
- ✅ Clear git history with good messages

---

## Emergency Contacts

**Have a blocker?**
```
Blocked by Person 3?
  → Ask in team chat
  → Provide specifics
  → Offer to help unblock

Problem with git?
  → Ask team lead
  → Share error message
  → Show your git log

Need to understand dependencies?
  → Check INTEGRATION_GUIDE.md
  → Review other person's README.md
  → Ask in standup
```

---

## Remember

✅ **Keep changes in YOUR module only**
- Person 1 only edits `team/frontend/`
- Person 2 only edits `team/backend-api/`
- Person 3 only edits `team/rag-services/`
- Person 4 only edits `team/document-processing/`
- Person 5 only edits `team/core-utils/`

✅ **Commit frequently (daily)**
- Don't wait until the end
- Easier to track changes
- Easier to find bugs

✅ **Write good commit messages**
- Describe WHAT you did
- Describe WHY you did it
- Use the template above

✅ **Review others' code**
- Comment on PRs
- Ask questions
- Approve when ready

✅ **Keep main branch clean**
- Only merge working code
- Only merge reviewed code
- Only merge tested code

---

## Quick Start Command for Each Person

**Person 1 (Frontend):**
```bash
cd "c:/Users/priyanshu.pandey2/New folder" && git clone <repo> rag && cd rag/team/frontend && npm install && npm run dev
```

**Person 2 (Backend API):**
```bash
cd "c:/Users/priyanshu.pandey2/New folder" && git clone <repo> rag && cd rag/team/backend-api && npm install
```

**Person 3 (RAG Services):**
```bash
cd "c:/Users/priyanshu.pandey2/New folder" && git clone <repo> rag && cd rag/team/rag-services && npm install
```

**Person 4 (Document Processing):**
```bash
cd "c:/Users/priyanshu.pandey2/New folder" && git clone <repo> rag && cd rag/team/document-processing && npm install
```

**Person 5 (Core Utils):**
```bash
cd "c:/Users/priyanshu.pandey2/New folder" && git clone <repo> rag && cd rag/team/core-utils && npm install
```

---

## Questions?

1. **Read your module's README** (`team/<your-module>/README.md`)
2. **Check DEVELOPER_CHECKLISTS.md** for your specific person
3. **Review INTEGRATION_GUIDE.md** for how things fit together
4. **Ask in team chat** if still stuck

---

**You're ready! 🚀 Go build awesome RAG features!**

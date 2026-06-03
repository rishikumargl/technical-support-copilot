# Setup Instructions for Your 5-Person Team

## What You Have

A **production-ready RAG Assistant** application divided into 5 independent modules that your team can develop in parallel using Git.

---

## Step 0: Have This Information Ready

Before your team starts, make sure you have:

- ✅ Git installed (`git --version`)
- ✅ Node.js installed (`node --version`)
- ✅ GitHub repository created
- ✅ Repository URL (will look like: `https://github.com/yourname/rag-assistant.git`)

---

## Step 1: Share the Repository

**Team Lead:** Create a GitHub repository with this code

```bash
# Push to GitHub (one time)
cd "c:/Users/priyanshu.pandey2/New folder"
git remote add origin https://github.com/yourname/rag-assistant.git
git branch -M main
git push -u origin main
```

**Share with team:** Send them the repository URL

---

## Step 2: Each Person Sets Up Their Environment

**Person 1, 2, 3, 4, and 5 each do this:**

```bash
# Clone the repository
cd "c:/Users/priyanshu.pandey2/New folder"
git clone <repository-url> rag-assistant
cd rag-assistant

# Navigate to your module and install
# REPLACE <your-module> with your actual module name

cd team/<your-module>
npm install
```

**Replace `<your-module>` with:**
- Person 1: `frontend`
- Person 2: `backend-api`
- Person 3: `rag-services`
- Person 4: `document-processing`
- Person 5: `core-utils`

---

## Step 3: Everyone Reads the Guides

**All team members read:**
1. `FILES_OVERVIEW.txt` - Understand the structure (5 min)
2. `GETTING_STARTED_TEAM.md` - Understand how to work together (10 min)
3. Your specific module README: `team/<your-module>/README.md` (15 min)

Total time: **30 minutes**

---

## Step 4: Daily Workflow (Everyone)

This is what each person does every single day:

```bash
# Morning: Sync with team
git checkout main
git pull origin main

# Create your work branch
git checkout -b feature/<your-module>/<feature-name>

# Make changes in your module ONLY
# ... edit files ...

# Commit frequently
git add team/<your-module>/
git commit -m "feat(<module>): description of what you did"

# Push when ready
git push origin feature/<your-module>/<feature-name>

# On GitHub: Create Pull Request
# - Wait for 2 approvals
# - Merge PR
# - Back to step 1
```

---

## Example: Person 1 (Frontend) First Day

```bash
# Setup (first time)
cd "c:/Users/priyanshu.pandey2/New folder"
git clone https://github.com/yourname/rag-assistant.git rag
cd rag
cd team/frontend
npm install

# Read documentation
cat ../../FILES_OVERVIEW.txt
cat ../../GETTING_STARTED_TEAM.md
cat README.md

# Start work
git checkout main
git pull origin main
git checkout -b feature/frontend/add-chat-ui

# Edit files in team/frontend/src/

# Commit
git add team/frontend/src/components/Chat.jsx
git commit -m "feat(frontend): add chat component

- Message input field
- Send button
- Message display"

# Push
git push origin feature/frontend/add-chat-ui

# On GitHub: Create PR, get reviews, merge
```

---

## Module Structure & Responsibilities

```
team/
├── frontend/              Person 1
│   ├── src/
│   │   ├── components/   (ChatInterface, MessageBubble, etc.)
│   │   ├── App.jsx       (Main app)
│   │   ├── store.js      (State management)
│   │   └── api.js        (API calls)
│   └── README.md         ← Read this first
│
├── backend-api/           Person 2
│   ├── routes/           (Chat, Documents endpoints)
│   ├── controllers/      (Business logic)
│   └── README.md         ← Read this first
│
├── rag-services/          Person 3
│   ├── services/         (RAG logic, retrieval)
│   └── README.md         ← Read this first
│
├── document-processing/   Person 4
│   ├── services/         (Document upload, chunking)
│   ├── utils/            (Chunking strategies, PDF parsing)
│   └── README.md         ← Read this first
│
└── core-utils/            Person 5
    ├── embeddings/       (OpenAI embeddings)
    ├── storage/          (Database/JSON storage)
    ├── utils/            (Error handling)
    └── README.md         ← Read this first
```

---

## Git Best Practices (Everyone)

### ✅ DO THIS:

```bash
# Create feature branch
git checkout -b feature/<your-module>/<name>

# Commit frequently (daily)
git commit -m "feat(<module>): clear description"

# Push regularly (daily)
git push origin feature/<your-module>/<name>

# Create Pull Requests
# Wait for reviews
# Merge when approved

# After PR merged, sync
git checkout main
git pull origin main
```

### ❌ DON'T DO THIS:

```bash
# Don't commit directly to main
git commit -m "quick fix"  # ❌ On main branch

# Don't edit other modules
team/backend-api/file.js   # ❌ If you're Person 1

# Don't push without testing
git push --force           # ❌ Force push

# Don't merge your own PRs
# Always wait for team review
```

---

## Commit Message Template

Every commit should follow this format:

```bash
git commit -m "feat(<module>): short description

- Detailed point 1
- Detailed point 2
- Detailed point 3"
```

---

## Timeline & Milestones

### Week 1
- [ ] Person 5: Core Utils → First commit
- [ ] Person 4: Document Processing → First commit  
- [ ] Person 3: RAG Services → First commit
- [ ] Everyone has 5+ commits

### Week 2
- [ ] Person 2: Backend API → First commit
- [ ] Person 5,4,3 modules merged to main
- [ ] Everyone has 15+ commits

### Week 3
- [ ] Person 1: Frontend → First commit
- [ ] Person 2 module merged to main
- [ ] Everyone has 25+ commits

### Week 4
- [ ] Person 1 module merged to main
- [ ] Full application working
- [ ] Everyone has 40+ commits
- [ ] Ready for production

---

## Success Criteria

Each person should have:
- ✅ 40-50 commits (10-15 per week)
- ✅ Clear, descriptive messages
- ✅ Code ONLY in their module
- ✅ At least 5 PRs
- ✅ All PRs merged to main
- ✅ Code reviewed by teammates

---

## Running the Application

### First time setup (after Person 5 finishes):

```bash
# Install dependencies
npm install
cd team/backend-api && npm install && cd ../..
cd team/document-processing && npm install && cd ../..
cd team/rag-services && npm install && cd ../..
cd team/frontend && npm install && cd ../..
cd team/core-utils && npm install && cd ../..

# Start backend
cd server
node indexSimple.js

# Start frontend (in another terminal)
cd client
npm run dev

# Visit http://localhost:5173
```

---

## Troubleshooting

### "How do I see my changes?"
```bash
git diff team/<your-module>/
```

### "How do I see my commits?"
```bash
git log --oneline team/<your-module>/
```

### "I made a mistake, undo last commit"
```bash
git reset --soft HEAD~1
```

### "Merge conflict"
```bash
# Fix the file, then:
git add team/<your-module>/
git commit -m "fix: resolve merge conflict"
```

### "I need help from Person X"
```
In Slack/Chat:
@Person X - Need your help with <issue>
File: <path>
Problem: <description>
```

---

## Key Files to Read

| Question | File |
|----------|------|
| How do I start? | `GETTING_STARTED_TEAM.md` |
| What's my daily workflow? | `TEAM_WORKFLOW_SUMMARY.md` |
| Which file should I read? | `FILES_OVERVIEW.txt` |
| How do I integrate my code? | `INTEGRATION_GUIDE.md` |
| How does the app work? | `README.md` |

---

## Quick Links for Each Person

**Person 1 (Frontend):**
```
1. Read: GETTING_STARTED_TEAM.md
2. Read: team/frontend/README.md
3. Read: DEVELOPER_CHECKLISTS.md
4. Setup: cd team/frontend && npm install
```

**Person 2 (Backend API):**
```
1. Read: GETTING_STARTED_TEAM.md
2. Read: team/backend-api/README.md
3. Read: DEVELOPER_CHECKLISTS.md
4. Setup: cd team/backend-api && npm install
```

**Person 3 (RAG Services):**
```
1. Read: GETTING_STARTED_TEAM.md
2. Read: team/rag-services/README.md
3. Read: DEVELOPER_CHECKLISTS.md
4. Setup: cd team/rag-services && npm install
```

**Person 4 (Document Processing):**
```
1. Read: GETTING_STARTED_TEAM.md
2. Read: team/document-processing/README.md
3. Read: DEVELOPER_CHECKLISTS.md
4. Setup: cd team/document-processing && npm install
```

**Person 5 (Core Utils - START FIRST):**
```
1. Read: GETTING_STARTED_TEAM.md
2. Read: team/core-utils/README.md
3. Read: DEVELOPER_CHECKLISTS.md
4. Setup: cd team/core-utils && npm install
```

---

## Team Communication

### Daily Standup
```
Each person shares:
✅ What I completed today
⏳ What I'm working on
🚫 What's blocking me
🤝 What I need from others
```

### Code Review
- Create PR when feature is done
- Request reviews from 2+ team members
- Address feedback
- Merge when approved

### Blocked?
Ask in team chat with:
- What you're trying to do
- What went wrong
- What you've already tried
- Screenshot/error message

---

## Ready to Start?

1. **Person 5**: Start Core Utils first (no dependencies)
2. **Person 4**: Start Document Processing (needs Person 5)
3. **Person 3**: Start RAG Services (needs Person 5 & 4)
4. **Person 2**: Start Backend API (needs Person 3 & 4)
5. **Person 1**: Start Frontend (needs Person 2)

But they can work in parallel! Person 5 can be building while others are still setting up.

---

## You're Ready! 🚀

- ✅ Project structure set up
- ✅ Documentation complete
- ✅ Git workflow defined
- ✅ Each person has their guide
- ✅ Dependencies are clear
- ✅ Success criteria defined

**Time to build!**

For questions, check `GETTING_STARTED_TEAM.md` or your module's `README.md`.

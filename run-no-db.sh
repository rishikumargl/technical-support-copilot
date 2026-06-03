#!/bin/bash

echo "🚀 Starting RAG Assistant (No Database Required)"
echo "================================================"
echo ""

# Check if OPENAI_API_KEY is set
if [ -z "$OPENAI_API_KEY" ]; then
  echo "⚠️  WARNING: OPENAI_API_KEY not set!"
  echo "   Set it with: export OPENAI_API_KEY=sk-..."
  echo "   Or edit server/.env file"
  echo ""
fi

echo "Starting backend server..."
cd server
node indexSimple.js &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"
echo ""

echo "Waiting for backend to initialize..."
sleep 2

echo "Starting frontend development server..."
cd ../client
npm run dev &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"
echo ""

echo "================================================"
echo "✅ RAG Assistant is running!"
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "================================================"

# Wait for both processes
wait

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

app = FastAPI(title="Enterprise Knowledge Assistant API", version="1.0.0")

app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API running"}

@app.post("/api/chat")
async def chat(question: str = ""):
    return {"answer": "Placeholder response. RAG coming soon.", "sources": [], "confidence": 0.0}

@app.get("/api/documents")
async def documents():
    return {"documents": []}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.backend_host, port=settings.backend_port)

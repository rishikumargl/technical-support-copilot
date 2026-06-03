import os

class Settings:
    backend_host = os.getenv("BACKEND_HOST", "0.0.0.0")
    backend_port = int(os.getenv("BACKEND_PORT", "8000"))
    debug = os.getenv("DEBUG", "true").lower() == "true"
    database_url = os.getenv("DATABASE_URL", "sqlite:///./enterprise_rag.db")
    cors_origins = ["http://localhost:3000"]

settings = Settings()

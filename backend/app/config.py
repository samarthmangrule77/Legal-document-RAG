import os

class Settings:
    PROJECT_NAME: str = "LexiRAG AI Enterprise Legal Assistant"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "lexirag-secret-key-super-secure-2026-prod")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # PostgreSQL Database Configuration
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:postgres@localhost:5432/lexirag"
    )

    # AWS S3 / MinIO Cloud Storage Configuration
    S3_ENDPOINT_URL: str = os.getenv("S3_ENDPOINT_URL", "http://localhost:9000")
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "minioadmin")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY", "minioadmin")
    S3_BUCKET_NAME: str = os.getenv("S3_BUCKET_NAME", "lexirag-documents")
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")

    # Document Security & Encryption Parameters
    ENCRYPTION_KEY: str = os.getenv("ENCRYPTION_KEY", "lexirag-secret-encryption-key-2026-32b!")
    MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", "50"))
    ALLOWED_EXTENSIONS: list = [".pdf", ".docx", ".doc", ".txt", ".rtf", ".png", ".jpg", ".jpeg"]

    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    EMBEDDING_MODEL_NAME: str = os.getenv("EMBEDDING_MODEL_NAME", "all-MiniLM-L6-v2")
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
    VECTOR_DB_DIR: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), "vector_db")

settings = Settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.VECTOR_DB_DIR, exist_ok=True)

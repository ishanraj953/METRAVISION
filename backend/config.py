import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "METRA-X Compliance System"
    API_V1_STR: str = ""
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./metrax.db")
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "metravision")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "metrax_db")
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "localhost")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "metrax-super-secret-jwt-key-2026-hackathon-spec")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRE_MINUTES", "1440"))
    
    AI_SERVICE_URL: str = os.getenv("AI_SERVICE_URL", "http://localhost:8000/mock-ai")
    RULE_ENGINE_URL: str = os.getenv("RULE_ENGINE_URL", "http://localhost:8000/mock-rules")
    
    STORAGE_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "storage"))

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()

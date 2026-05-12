"""
Configuration management using Pydantic Settings.
Loads all environment variables from .env file.
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Application
    APP_NAME: str = "AI Career Autopilot"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # MongoDB
    MONGODB_URL: str
    MONGODB_DB_NAME: str = "ai_career_autopilot"
    
    # JWT Authentication
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # External APIs
    JSEARCH_API_KEY: str
    JSEARCH_API_URL: str = "https://jsearch.p.rapidapi.com"
    
    ADZUNA_APP_ID: str
    ADZUNA_APP_KEY: str
    ADZUNA_BASE_URL: str = "https://api.adzuna.com/v1/api"
    ADZUNA_COUNTRY: str = "us"
    
    COURSERA_API_URL: str = "https://api.coursera.org/api/courses.v1"
    
    GROQ_API_KEY: str
    GROQ_API_URL: str = "https://api.groq.com/openai/v1"
    GROQ_MODEL: str = "llama-3.1-8b-instant"
    
    HUGGINGFACE_TOKEN: Optional[str] = None
    
    DEEPSEEK_API_KEY: Optional[str] = None
    DEEPSEEK_API_URL: str = "https://api.deepseek.com/v1"
    
    # Scheduler
    SCHEDULER_ENABLED: bool = True
    WEEKLY_UPDATE_CRON: str = "0 9 * * 1"  # Every Monday at 9 AM UTC

    # Google OAuth
    GOOGLE_CLIENT_ID: Optional[str] = None

    # Frontend URL (for CORS)
    FRONTEND_URL: str = "http://localhost:3000"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()

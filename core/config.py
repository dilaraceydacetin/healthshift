from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Veritabanı
    database_url: str = "postgresql://user:password@localhost:5432/healthshift"

    # LLM
    llm_provider: str = "openai"  # "openai" veya "anthropic"
    llm_api_key: str = ""
    llm_model: str = "gpt-4o-mini"
    llm_base_url: str = "https://api.groq.com/openai/v1" 

    # Uygulama
    debug: bool = True
    app_name: str = "healthshift"

    class Config:
        env_file = ".env"
        extra = "allow"

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
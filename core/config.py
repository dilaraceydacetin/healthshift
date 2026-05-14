from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/healthshift"
    LLM_PROVIDER: str = "groq"
    LLM_API_KEY: str = ""
    llm_model: str = "llama-3.3-70b-versatile"
    llm_base_url: str = "https://api.groq.com/openai/v1"
    debug: bool = True
    app_name: str = "healthshift"

    model_config = SettingsConfigDict(env_file=".env", extra="allow")

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
import os
from pydantic_settings import BaseSettings
from pydantic import field_validator
from dotenv import load_dotenv
from typing import List

load_dotenv()

class Settings(BaseSettings):
    gnani_api_key: str = ""

    # Real Vachana API endpoints (confirmed from official Gnani docs)
    gnani_stt_endpoint: str = "https://api.vachana.ai/stt/v3"
    gnani_tts_endpoint: str = "https://api.vachana.ai/api/v1/tts/inference"
    gnani_evon_endpoint: str = ""   # No public LLM endpoint yet — uses rule-based fallback

    app_env: str = "development"
    max_upload_size_mb: int = 50
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    database_path: str = "./suraksha.db"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def demo_mode(self) -> bool:
        """True if no real Gnani API key is configured."""
        key = (self.gnani_api_key or "").strip()
        return not key or key == "your_vachana_api_key_here"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

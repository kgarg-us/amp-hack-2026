from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_ROOT = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    app_name: str = "Ampcus Hackathon: New-Hire Onboarding API"
    # Comma-separated list of allowed browser origins (Vite dev server is 5173).
    frontend_origin: str = "http://localhost:5173,http://localhost:3000"
    openai_api_key: str
    openai_model: str = "gpt-4.1-mini"
    faq_pdf_path: Path = BACKEND_ROOT / "New_Hire_FAQ_Questions.pdf"
    faq_data_path: Path = BACKEND_ROOT / "faq_data.json"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


@lru_cache
def get_settings() -> Settings:
    return Settings()

from pathlib import Path

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]
REPO_DIR = BACKEND_DIR.parent


class Settings(BaseSettings):
    app_name: str = "AuraSync API"
    database_url: str = f"sqlite:///{(BACKEND_DIR / 'aurasync.db').as_posix()}"
    jwt_secret: str = "dev-secret-change-in-production-INSECURE"  # Mude via AURASYNC_JWT_SECRET
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 60
    refresh_token_days: int = 30
    storage_dir: Path = REPO_DIR / "storage"
    media_base_url: str = "/media"
    seed_admin_password: str = "TrocarEssaSenha123!"
    cors_origins: str = "*"  # Dev: "*", Prod: "https://aurasync.vercel.app,https://admin.aurasync.vercel.app"

    @model_validator(mode="after")
    def fix_postgres_url(self) -> "Settings":
        if self.database_url.startswith("postgres://"):
            self.database_url = self.database_url.replace("postgres://", "postgresql://", 1)
        return self

    model_config = SettingsConfigDict(
        env_prefix="AURASYNC_",
        env_file=".env",
        env_file_encoding="utf-8"
    )


settings = Settings()

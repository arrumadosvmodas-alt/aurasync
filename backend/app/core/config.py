from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]
REPO_DIR = BACKEND_DIR.parent


class Settings(BaseSettings):
    app_name: str = "AuraSync API"
    database_url: str = f"sqlite:///{(BACKEND_DIR / 'aurasync.db').as_posix()}"
    jwt_secret: str = "dev-secret-change-in-production-0000"
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 60
    refresh_token_days: int = 30
    storage_dir: Path = REPO_DIR / "storage"
    media_base_url: str = "/media"
    # Senha do admin criado pelo seed; sobrescreva em produção via variável de ambiente.
    seed_admin_password: str = "TrocarEssaSenha123!"

    model_config = SettingsConfigDict(env_prefix="AURASYNC_", env_file=".env")


settings = Settings()

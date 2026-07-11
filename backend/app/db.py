from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from .core.config import settings


class Base(DeclarativeBase):
    pass


# Configurar connection args dependendo do tipo de banco
connect_args = {}
if settings.database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
elif settings.database_url.startswith("postgresql"):
    # Supabase e PostgreSQL com SSL e suporte a Transaction Pooler (sem prepared statements)
    connect_args = {"sslmode": "require", "prepare_threshold": 0}

engine = create_engine(settings.database_url, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()

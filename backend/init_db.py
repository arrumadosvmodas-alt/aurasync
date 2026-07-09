import sys
from pathlib import Path

# Adicionar backend ao path
sys.path.insert(0, str(Path(__file__).parent))

from app.db import Base, engine
from app.models import *

try:
    # Criar todas as tabelas
    Base.metadata.create_all(bind=engine)
    print("[OK] Banco de dados inicializado com sucesso!")
except Exception as e:
    print(f"[ERRO] {str(e)}")

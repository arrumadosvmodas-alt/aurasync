#!/bin/bash
# AuraSync — Production Deployment Script
# Usage: bash deploy.sh [staging|production]

set -e

ENV=${1:-staging}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🚀 AuraSync Deployment — $ENV ($TIMESTAMP)"
echo "================================================"

# 1. Validar ambiente
echo "✓ Validando configurações..."
if [ ! -f ".env.$ENV" ]; then
    echo "❌ Arquivo .env.$ENV não encontrado!"
    exit 1
fi

# 2. Backup do banco de dados
echo "✓ Fazendo backup do banco de dados..."
DB_BACKUP="backups/aurasync_$(date +%Y%m%d_%H%M%S).sql"
mkdir -p backups
if command -v pg_dump &> /dev/null; then
    pg_dump "$AURASYNC_DATABASE_URL" > "$DB_BACKUP"
    echo "  → Backup salvo em: $DB_BACKUP"
fi

# 3. Instalar/atualizar dependências
echo "✓ Instalando dependências..."
cd backend && pip install -r requirements.txt --quiet
cd ../admin && npm ci --quiet
cd ../mobile && npm ci --quiet
cd ..

# 4. Executar migrações
echo "✓ Executando migrações do banco de dados..."
cd backend
alembic upgrade head
cd ..

# 5. Rodar testes
echo "✓ Executando testes..."
cd backend
python -m pytest tests -q --tb=short || {
    echo "❌ Testes falharam! Deploy cancelado."
    exit 1
}
cd ..

# 6. Build do frontend
echo "✓ Compilando Admin CMS e Mobile..."
cd admin && npm run build --quiet
cd ../mobile && npm run build --quiet
cd ..

# 7. Seed (apenas se banco novo)
echo "✓ Verificando dados iniciais..."
cd backend
python -c "
from app.db import SessionLocal
from app.models import User
db = SessionLocal()
if db.query(User).count() == 0:
    print('  → Criando dados iniciais...')
    import subprocess
    subprocess.run(['python', '-m', 'seeds.seed'])
"
cd ..

# 8. Health check
echo "✓ Verificando saúde da API..."
sleep 2
curl -s http://localhost:8000/health > /dev/null || {
    echo "❌ API não respondendo!"
    exit 1
}

# 9. Relatório final
echo ""
echo "✅ DEPLOY CONCLUÍDO COM SUCESSO!"
echo "================================================"
echo "Ambiente: $ENV"
echo "Timestamp: $TIMESTAMP"
echo "Backup: $DB_BACKUP"
echo ""
echo "Próximos passos:"
echo "1. Verificar logs: tail -f /var/log/aurasync/api.log"
echo "2. Testar API: curl http://localhost:8000/health"
echo "3. Testar CMS: https://admin.aurasync.app"
echo "4. Monitorar: Verificar Sentry/Datadog"
echo ""

# 🚀 AuraSync — Guia de Produção

## Pré-requisitos

- ✅ PostgreSQL 14+ (ou RDS)
- ✅ Redis 7+ (para cache + sessions)
- ✅ Node.js 20+ (para admin/mobile builds)
- ✅ Python 3.10+ com pip
- ✅ Docker (recomendado)
- ✅ Nginx/HAProxy (reverse proxy)
- ✅ SSL/TLS (Let's Encrypt)

---

## 1. Preparação do Servidor

### 1.1 Instalar dependências
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y python3 python3-pip python3-venv
sudo apt-get install -y postgresql redis-server nginx

# macOS (Homebrew)
brew install python@3.11 postgresql redis nginx
```

### 1.2 Criar usuário do sistema
```bash
sudo useradd -m -s /bin/bash aurasync
sudo mkdir -p /var/aurasync/{storage,logs,backups}
sudo chown -R aurasync:aurasync /var/aurasync
```

### 1.3 Preparar banco de dados
```bash
sudo -u postgres psql <<EOF
CREATE DATABASE aurasync;
CREATE USER aurasync WITH PASSWORD 'senha-segura-aqui';
ALTER ROLE aurasync SET client_encoding TO 'utf8';
ALTER ROLE aurasync SET default_transaction_isolation TO 'read committed';
ALTER ROLE aurasync SET default_transaction_deferrable TO on;
ALTER ROLE aurasync SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE aurasync TO aurasync;
EOF
```

---

## 2. Deploy do Aplicativo

### 2.1 Clonar repositório
```bash
sudo -u aurasync git clone https://github.com/seu-repo/aurasync.git /var/aurasync/app
cd /var/aurasync/app
```

### 2.2 Configurar variáveis de ambiente
```bash
# Copiar template
cp .env.example /var/aurasync/.env.production

# Editar com valores reais
sudo -u aurasync nano /var/aurasync/.env.production
```

**Valores importantes:**
```
AURASYNC_DATABASE_URL=postgresql://aurasync:senha@localhost/aurasync
AURASYNC_JWT_SECRET=<gerar com secrets.token_urlsafe(32)>
AURASYNC_STORAGE_DIR=/var/aurasync/storage
AURASYNC_SEED_ADMIN_PASSWORD=<gerar senha segura>
```

### 2.3 Instalar dependências do backend
```bash
cd /var/aurasync/app/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2.4 Executar migrações
```bash
cd /var/aurasync/app/backend
export AURASYNC_DATABASE_URL="postgresql://aurasync:senha@localhost/aurasync"
alembic upgrade head
python -m seeds.seed  # Criar dados iniciais + admin
```

### 2.5 Build frontend (Admin + Mobile)
```bash
cd /var/aurasync/app/admin
npm install
npm run build

cd /var/aurasync/app/mobile
npm install
npm run build:web
```

---

## 3. Configuração de Serviços

### 3.1 Systemd service para Backend
```ini
# /etc/systemd/system/aurasync-api.service
[Unit]
Description=AuraSync API
After=network.target postgresql.service redis.service

[Service]
Type=notify
User=aurasync
WorkingDirectory=/var/aurasync/app/backend
Environment="AURASYNC_DATABASE_URL=postgresql://aurasync:senha@localhost/aurasync"
ExecStart=/var/aurasync/app/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable aurasync-api
sudo systemctl start aurasync-api
```

### 3.2 Nginx reverse proxy
```nginx
# /etc/nginx/sites-available/aurasync
upstream api {
    server localhost:8000;
}

server {
    listen 80;
    server_name api.aurasync.app;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.aurasync.app;
    
    ssl_certificate /etc/letsencrypt/live/api.aurasync.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.aurasync.app/privkey.pem;
    
    location / {
        proxy_pass http://api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /media/ {
        alias /var/aurasync/storage/;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/aurasync /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3.3 SSL/TLS (Let's Encrypt)
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d api.aurasync.app -d admin.aurasync.app
```

---

## 4. Monitoramento & Logging

### 4.1 Estrutura de logs
```bash
mkdir -p /var/aurasync/logs
touch /var/aurasync/logs/{api,nginx,error}.log
chmod 755 /var/aurasync/logs
```

### 4.2 Integração Sentry (erro tracking)
```python
# backend/app/main.py
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

if settings.sentry_dsn:
    sentry_sdk.init(
        dsn=settings.sentry_dsn,
        integrations=[FastApiIntegration()],
        traces_sample_rate=0.1,
    )
```

### 4.3 Health check
```bash
# Cron job para verificar se a API está respondendo
* * * * * curl -f http://localhost:8000/health || \
  systemctl restart aurasync-api
```

---

## 5. Backup & Disaster Recovery

### 5.1 Backup automático do banco
```bash
# /usr/local/bin/backup-aurasync.sh
#!/bin/bash
BACKUP_DIR="/var/aurasync/backups"
DB_URL="postgresql://aurasync:senha@localhost/aurasync"

mkdir -p $BACKUP_DIR
pg_dump "$DB_URL" | gzip > "$BACKUP_DIR/aurasync_$(date +%Y%m%d_%H%M%S).sql.gz"

# Manter apenas últimos 30 dias
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

```bash
sudo crontab -e
# Executar diariamente às 2 AM
0 2 * * * /usr/local/bin/backup-aurasync.sh
```

### 5.2 Backup de mídia (storage)
```bash
# Backup semanal do storage para S3
aws s3 sync /var/aurasync/storage s3://aurasync-backups/ --delete
```

---

## 6. Performance & Escalabilidade

### 6.1 Database optimization
```sql
-- Índices principais
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_content_type ON content_items(type);
CREATE INDEX idx_content_published ON content_items(published_at);
CREATE INDEX idx_user_prefs ON user_preferences(user_id);

-- Vacuum
VACUUM ANALYZE;
```

### 6.2 Redis cache
```python
# backend/app/main.py
from redis import Redis

redis_client = Redis.from_url(
    "redis://localhost:6379",
    decode_responses=True
)

# Cache recommendations
@app.get("/recommendations")
async def get_recommendations(
    goal: str = None,
    hour: int = None,
    cache_key = f"recs:{goal}:{hour}"
):
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    # ... compute recommendations ...
    redis_client.setex(cache_key, 3600, json.dumps(result))
    return result
```

### 6.3 Load balancing (múltiplos workers)
```bash
# Usar Gunicorn com múltiplos workers
gunicorn -w 4 -b 0.0.0.0:8000 app.main:app
```

---

## 7. Segurança em Produção

### 7.1 Hardening
```bash
# Firewall
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 5432/tcp  # PostgreSQL (apenas rede interna)
```

### 7.2 Secrets management
```bash
# Usar AWS Secrets Manager ou HashiCorp Vault
# NUNCA commitar .env.production no git
git rm --cached .env.production
```

### 7.3 Rate limiting
```python
from slowapi import Limiter

limiter = Limiter(key_func=get_remote_address)

@app.post("/auth/login")
@limiter.limit("5/minute")
async def login(body: LoginRequest):
    # ...
```

---

## 8. Troubleshooting

### API não inicia
```bash
# Verificar logs
journalctl -u aurasync-api -f

# Testar banco de dados
psql postgresql://aurasync:senha@localhost/aurasync -c "SELECT 1"

# Verificar permissões
ls -la /var/aurasync/
```

### Memória alta
```bash
# Aumentar workers do Gunicorn
# Usar Redis para cache
# Implementar pagination na API
```

### Lentidão
```bash
# Verificar índices
EXPLAIN ANALYZE SELECT * FROM content_items WHERE type='binaural';

# Cache com Redis
# CDN para mídia (CloudFront, Cloudflare)
```

---

## 9. Checklist Pré-Deploy

- [ ] Banco de dados criado e testado
- [ ] .env.production configurado com senhas seguras
- [ ] Migrações executadas com sucesso
- [ ] Admin + Mobile buildados
- [ ] Testes passando (12/12)
- [ ] SSL/TLS configurado
- [ ] Sentry configurado
- [ ] Backups automatizados
- [ ] Monitoring ativo
- [ ] Firewall configurado
- [ ] Rate limiting ativo
- [ ] Health check respondendo

---

## 10. Monitoramento Pós-Deploy

```bash
# Verificar status
systemctl status aurasync-api
journalctl -u aurasync-api -n 50

# Testar endpoints
curl https://api.aurasync.app/health
curl -X POST https://api.aurasync.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aurasync.app","password":"..."}'

# Verificar banco
psql $AURASYNC_DATABASE_URL -c "SELECT COUNT(*) FROM users;"
```

---

**🚀 Deployment concluído!**

Para suporte: documentação em `/var/aurasync/app/docs/`

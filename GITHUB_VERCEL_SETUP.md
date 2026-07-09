# 🚀 AuraSync — Setup GitHub + Vercel

## Passo 1: Criar Repositório no GitHub

### 1.1 Criar novo repositório
1. Acesse [github.com/new](https://github.com/new)
2. Nome: `aurasync`
3. Descrição: "Spiritual relaxation app with music, soundscapes, and guided journeys"
4. Visibilidade: **Public** (para deploy automático)
5. Deixar desmarcado: "Add .gitignore" e "Add license"
6. Clicar **Create repository**

### 1.2 Push do código local
```bash
cd C:\AuraSync

# Remover git antigo
rm -rf .git

# Inicializar novo git
git init
git add .
git commit -m "Initial commit: AuraSync MVP with FastAPI, React Native, and admin CMS"

# Adicionar remote
git remote add origin https://github.com/SEU_USER/aurasync.git
git branch -M main
git push -u origin main
```

**Substitua `SEU_USER` pelo seu username do GitHub**

---

## Passo 2: Setup do Vercel

### 2.1 Conectar repositório
1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique **Add New** → **Project**
3. Selecione **Import Git Repository**
4. Busque por `aurasync` e clique **Import**

### 2.2 Configurar projeto

**Nome do projeto:** `aurasync`

**Framework:** Deixar **Vite** detectar automaticamente

**Root Directory:** 
```
admin/
```
(para o Admin CMS)

### 2.3 Environment Variables
Adicionar as seguintes variáveis:

```
REACT_APP_API_URL=https://aurasync-api.vercel.app
REACT_APP_ENV=production
```

Clicar **Deploy**

---

## Passo 3: Deploy do Backend (API)

### 3.1 Criar Vercel config para backend
```bash
# Na raiz do projeto
cat > vercel.json <<'EOF'
{
  "buildCommand": "cd backend && pip install -r requirements.txt && alembic upgrade head",
  "outputDirectory": "backend",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "https://api.aurasync.vercel.app/$1"
    }
  ]
}
EOF
```

### 3.2 Deploy backend no Vercel
```bash
# Instalar Vercel CLI
npm install -g vercel

# Fazer deploy
vercel --prod --name aurasync-api
```

**Seguir as instruções interativas**

---

## Passo 4: Deploy do Mobile (Expo Web)

### 4.1 Build estático
```bash
cd mobile
npm run build:web
vercel --prod --name aurasync-mobile
```

---

## Passo 5: Configuração de Domínio

### 5.1 Apontar domínios (ex: aurasync.app)

**Via Vercel:**
1. Ir para **Project Settings** → **Domains**
2. Adicionar domínio customizado
3. Seguir instruções de DNS

**Exemplo de configuração DNS:**
```
api.aurasync.app          → CNAME aurasync-api.vercel.app
admin.aurasync.app        → CNAME aurasync.vercel.app
app.aurasync.app          → CNAME aurasync-mobile.vercel.app
```

---

## Passo 6: Configurar Database (Produção)

### 6.1 PostgreSQL no Vercel
Vercel não hospeda banco de dados, mas recomenda:

**Opção 1: AWS RDS** (recomendado)
```bash
# Criar RDS PostgreSQL
aws rds create-db-instance \
  --db-instance-identifier aurasync-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --allocated-storage 20
```

**Opção 2: Railway.app** (mais simples)
1. Ir para [railway.app](https://railway.app)
2. Criar novo projeto
3. Adicionar PostgreSQL plugin
4. Copiar `DATABASE_URL`

**Opção 3: Supabase** (Firebase para Postgres)
1. Ir para [supabase.com](https://supabase.com)
2. Criar novo projeto
3. Copiar `postgresql://...`

### 6.2 Adicionar DATABASE_URL aos Environment Variables

**No Vercel:**
1. Ir para **Project Settings** → **Environment Variables**
2. Adicionar:
```
AURASYNC_DATABASE_URL=postgresql://user:password@host/aurasync
AURASYNC_JWT_SECRET=<gerar com secrets.token_urlsafe(32)>
AURASYNC_STORAGE_DIR=/tmp/aurasync
AURASYNC_SEED_ADMIN_PASSWORD=<senha segura>
```

---

## Passo 7: Configurar CI/CD

### 7.1 GitHub Actions para testes
```yaml
# .github/workflows/tests.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: "3.11"
      - run: |
          cd backend
          pip install -r requirements.txt
          pytest tests -v
```

### 7.2 Commit e push
```bash
git add .github/
git commit -m "Add CI/CD with GitHub Actions"
git push origin main
```

---

## Passo 8: Verificar Deploy

### 8.1 Acessar aplicativos

**Admin CMS:**
```
https://aurasync.vercel.app
Credenciais: admin@aurasync.app / TrocarEssaSenha123!
```

**API:**
```
https://aurasync-api.vercel.app/health
https://aurasync-api.vercel.app/docs
```

**Mobile (Web):**
```
https://aurasync-mobile.vercel.app
Credenciais: demo@aurasync.app / aurasync123
```

---

## Passo 9: Configurar Auto-Deploy

### 9.1 No Vercel
- **Auto-deploy** está ativado por padrão
- Qualquer push para `main` dispara novo build
- Verificar status em **Deployments**

### 9.2 No GitHub
- Actions rodará automaticamente
- Ver status em **Actions** → **Workflows**

---

## Passo 10: Monitoramento

### 10.1 Ver logs
```bash
# Vercel CLI
vercel logs

# Ou no Dashboard: Project → Deployments → Build Logs
```

### 10.2 Ver métricas
- Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
- Clique no projeto
- Vá para **Analytics**

---

## 🔐 Segurança

### ✅ Checklist
- [ ] `.env.production` NÃO commitado (verificar `.gitignore`)
- [ ] Variáveis sensíveis em **Environment Variables** do Vercel
- [ ] JWT_SECRET gerado com `secrets.token_urlsafe(32)`
- [ ] Admin password alterado em produção
- [ ] CORS configurado apenas para seus domínios
- [ ] Rate limiting ativo
- [ ] SSL/TLS automático (Vercel fornece)

---

## 📊 Estrutura de Deploy

```
GitHub (origem)
    ↓
    ├→ Vercel [Admin CMS]         → admin.aurasync.app
    ├→ Vercel [Mobile Web]        → app.aurasync.app
    └→ Vercel [API Backend]       → api.aurasync.app
         ↓
         └→ PostgreSQL (RDS/Railway/Supabase)
```

---

## 🆘 Troubleshooting

### Build falha
```bash
# Ver logs detalhados
vercel logs --tail

# Limpar cache
vercel projects --scope=<seu-username>
# Ir para settings e resetar cache
```

### Erro de conexão com banco
```bash
# Verificar CONNECTION STRING
echo $AURASYNC_DATABASE_URL

# Testar conectividade
psql $AURASYNC_DATABASE_URL -c "SELECT 1"
```

### Variáveis de ambiente não funcionam
```bash
# Adicionar novamente no Vercel
vercel env pull  # Baixar locais
vercel env push  # Subir para produção
```

---

## 📱 URLs Finais

| Componente | URL |
|---|---|
| **Admin CMS** | https://aurasync.vercel.app |
| **API Backend** | https://aurasync-api.vercel.app |
| **Mobile Web** | https://aurasync-mobile.vercel.app |
| **Docs API** | https://aurasync-api.vercel.app/docs |

---

## ✅ Próximas Etapas

1. ✅ Fazer push para GitHub
2. ✅ Conectar ao Vercel
3. ✅ Configurar database (RDS/Railway/Supabase)
4. ✅ Adicionar variáveis de ambiente
5. ✅ Validar deploy
6. ✅ Testar login e funcionalidades
7. ✅ Configurar domínio customizado
8. ✅ Setup monitoramento

**Tempo estimado:** 30-45 minutos

---

**Pronto para ir live! 🚀**

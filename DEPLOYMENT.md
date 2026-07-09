# 🚀 AuraSync — Deployment Guide

## Arquitetura Final (Simplificada)

- **Backend API**: Vercel (Python + FastAPI)
- **Admin CMS**: Vercel (React + Vite)
- **Mobile App**: EAS Build (Expo) ou Expo Web (opcional, hospedado separadamente)
- **Database**: Supabase PostgreSQL (connection pooler)

## Pré-requisitos

1. **GitHub**: Repositório público em `github.com/seu-usuario/aurasync`
2. **Supabase**: Projeto criado e credenciais obtidas
3. **Vercel**: Conta conectada ao GitHub
4. **Variáveis de Ambiente**: Preparadas em Vercel Secrets

---

## 1️⃣ Configurar Supabase

### Criar Projeto
1. Vá para [supabase.com](https://supabase.com) → **New Project**
2. Nome: `aurasync`, Senha: (gere uma forte)
3. Region: escolha a mais próxima
4. Aguarde ~5 min de inicialização

### Obter Connection String
1. Projeto → **Settings** → **Database**
2. **Connection pooler** tab (importante para serverless!)
3. Copie a string (formato: `postgresql://postgres:PASSWORD@db.PROJECT_ID.supabase.co:6543/postgres`)
4. Substitua `PASSWORD` pela senha real do projeto

---

## 2️⃣ Deploy Backend (Vercel + Alembic)

### Preparar Vercel
1. Vá para [vercel.com](https://vercel.com) → **Add New** → **Project**
2. Selecione repositório `aurasync` do GitHub
3. **Configure Project**:
   - Framework Preset: `Other`
   - Root Directory: `.` (raiz do repo, pois vercel.json está lá)
   - Build Command: (deixar vazio ou usar o padrão — vercel.json define)
   - Output Directory: (deixar vazio)

### Adicionar Secrets (Environment Variables)
No Vercel: **Settings** → **Environment Variables**, adicione:

```
AURASYNC_DATABASE_URL = postgresql://postgres:PASSWORD@db.PROJECT_ID.supabase.co:6543/postgres
AURASYNC_JWT_SECRET = <gerar com 32+ caracteres alfanuméricos>
AURASYNC_SEED_ADMIN_PASSWORD = <gerar nova senha forte>
AURASYNC_CORS_ORIGINS = https://aurasync.vercel.app
```

**Nota**: `PYTHONPATH` já está em `vercel.json`.

### Deploy
1. Clique **Deploy**
2. Aguarde ~5-10 min (primeira vez, Alembic criará as tabelas)
3. Após sucesso, você terá uma URL tipo `https://aurasync-api.vercel.app`

### Verificar
```bash
curl https://aurasync-api.vercel.app/health
# Deve retornar: {"status":"ok","app":"AuraSync API"}
```

---

## 3️⃣ Deploy Admin CMS (Vercel)

### Criar Projeto Vercel (2º)
1. Vercel → **Add New** → **Project**
2. Selecione mesmo repositório `aurasync`
3. **Configure Project**:
   - Framework Preset: `Vite`
   - Root Directory: `admin`
   - Build Command: `npm run build`
   - Output Directory: `dist`

### Adicionar Secret
```
VITE_API_URL = https://aurasync-api.vercel.app
```

### Deploy
1. Clique **Deploy**
2. Aguarde ~3-5 min
3. Você terá uma URL tipo `https://aurasync-admin-xxxxx.vercel.app`

### Acessar Admin
- URL: `https://aurasync-admin-xxxxx.vercel.app`
- Email: `admin@aurasync.app`
- Senha: (a que você gerou em `AURASYNC_SEED_ADMIN_PASSWORD`)

---

## 4️⃣ Deploy Mobile (Opcional: Expo Web)

Se quiser publicar o app mobile também como Expo Web na Vercel:

### Criar Projeto Vercel (3º)
1. Vercel → **Add New** → **Project**
2. Selecione `aurasync`
3. **Configure Project**:
   - Framework Preset: `Other`
   - Root Directory: `mobile`
   - Build Command: `npm run build:web`
   - Output Directory: `web-build`

### Adicionar Secret
```
EXPO_PUBLIC_API_URL = https://aurasync-api.vercel.app
```

### Deploy
1. Clique **Deploy**
2. Aguarde ~5-10 min (Expo Web build leva mais tempo)
3. Acesse em `https://aurasync-mobile-xxxxx.vercel.app`

**Alternativa**: usar [EAS Build](https://eas.expo.dev) para build nativo (iOS/Android) — mais recomendado para produção mobile real.

---

## 5️⃣ Variáveis de Ambiente — Resumo

| Variável | Backend | Admin | Mobile | Notas |
|---|---|---|---|---|
| `AURASYNC_DATABASE_URL` | ✅ | ❌ | ❌ | Supabase connection pooler |
| `AURASYNC_JWT_SECRET` | ✅ | ❌ | ❌ | 32+ chars aleatórios |
| `AURASYNC_SEED_ADMIN_PASSWORD` | ✅ | ❌ | ❌ | Usada na primeira inicialização |
| `AURASYNC_CORS_ORIGINS` | ✅ | ❌ | ❌ | URLs permitidas (produção) |
| `VITE_API_URL` | ❌ | ✅ | ❌ | URL do backend (build-time) |
| `EXPO_PUBLIC_API_URL` | ❌ | ❌ | ✅ | URL do backend (build-time) |

---

## 6️⃣ Testando o Deploy

### Backend API
```bash
# Health check
curl https://aurasync-api.vercel.app/health

# API Docs
open https://aurasync-api.vercel.app/docs

# Login teste
curl -X POST https://aurasync-api.vercel.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aurasync.app","password":"SEU_SEED_PASSWORD"}'
```

### Admin CMS
1. Acesse `https://aurasync-admin-xxxxx.vercel.app`
2. Login com `admin@aurasync.app` / `SEU_SEED_PASSWORD`
3. Navegue até **Catálogo** → deve carregar lista de conteúdo (ou estar vazia se nenhum foi seeded)

### Mobile App
1. Acesse `https://aurasync-mobile-xxxxx.vercel.app` (se deployado web)
2. Tente login com email/senha de teste
3. Verifique se `/media` retorna erro 404 (esperado, pois storage local está desativado) — isso é OK em dev

---

## 🔧 Troubleshooting

### Backend não inicia (erro 500)
- Verificar logs: `vercel logs --tail`
- Verificar `AURASYNC_DATABASE_URL` está correto
- Verificar Alembic rodou (logs devem mostrar `alembic upgrade head`)

### Admin não conecta ao backend
- Verificar `VITE_API_URL` em Vercel
- Verificar CORS: backend deve permitir a origem do Admin
- Abrir DevTools → Network tab, ver erro de CORS

### Mobile recebe erro 401 (Unauthorized)
- Verificar `EXPO_PUBLIC_API_URL` está correto
- Verif credenciais (email/password enviados)
- Verificar JWT_SECRET é o mesmo em dev e prod

### Alembic falha no build
- Verificar `backend/alembic/` existe e tem migrations
- Verificar variáveis de ambiente estão definidas
- Testar localmente: `cd backend && alembic upgrade head`

---

## 📋 Checklist Final

- [ ] Supabase projeto criado e connection string obtida
- [ ] Backend deploy no Vercel com `AURASYNC_DATABASE_URL` configurado
- [ ] `alembic upgrade head` rodou (verificar nos logs do Vercel)
- [ ] Admin deploy no Vercel com `VITE_API_URL` correto
- [ ] Admin consegue fazer login no backend
- [ ] CORS permitindo origem do admin (AURASYNC_CORS_ORIGINS)
- [ ] Testes e verificação funcionando
- [ ] Domínios customizados configurados (opcional, via CNAME em Vercel)

---

## 🚀 Próximos Passos (Futuros)

1. **Storage de Mídia**: Implementar Supabase Storage para áudios/imagens (atualmente `/media` está desativado)
2. **Mobile Nativo**: Build iOS/Android com EAS
3. **CI/CD**: GitHub Actions para testes automáticos em cada push
4. **Monitoramento**: Adicionar Sentry/Datadog para logs e erros em produção
5. **Domínios Customizados**: Apontar `api.aurasync.app`, `admin.aurasync.app`, etc.

---

**Status**: ✅ Backend + Admin prontos para produção  
**Último update**: 2026-07-09

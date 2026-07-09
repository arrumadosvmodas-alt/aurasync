# 🚀 AuraSync — Push para GitHub & Deploy Vercel

## ⚡ Quick Start (Agora Mesmo)

### Passo 1: Criar Repositório GitHub

1. Acesse [github.com/new](https://github.com/new)
2. Nome do repositório: `aurasync`
3. Descrição: `Spiritual relaxation app with AI recommendations`
4. Selecione **Public**
5. Clique **Create repository**

### Passo 2: Push do Código

Execute na raiz do projeto (`C:\AuraSync`):

```bash
git remote add origin https://github.com/SEU_USERNAME/aurasync.git
git branch -M main
git push -u origin main
```

**Substitua `SEU_USERNAME` pelo seu username no GitHub**

---

## 🚀 Deploy Vercel

### Passo 1: Conectar GitHub ao Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique **Add New** → **Project**
3. Selecione **Import Git Repository**
4. Procure por `aurasync`
5. Selecione o repositório e clique **Import**

### Passo 2: Configurar Builds

Para cada projeto, configure assim:

#### **Admin CMS**
- Root Directory: `admin`
- Build Command: `npm run build`
- Output Directory: `dist`

#### **Mobile Web**
- Root Directory: `mobile`
- Build Command: `npm run build:web`
- Output Directory: `web-build`

#### **API Backend**
- Root Directory: `backend`
- Build Command: `pip install -r requirements.txt && alembic upgrade head`
- Output Directory: `.`

### Passo 3: Adicionar Environment Variables

No Vercel, ir para **Settings** → **Environment Variables** e adicionar:

```
REACT_APP_API_URL=https://aurasync-api.vercel.app
REACT_APP_ENV=production
AURASYNC_DATABASE_URL=postgresql://user:password@host/db
AURASYNC_JWT_SECRET=<gerar com secrets.token_urlsafe(32)>
AURASYNC_SEED_ADMIN_PASSWORD=<ADICIONAR_NO_VERCEL_SECRETS_APENAS>
```

### Passo 4: Deploy

Clicar **Deploy**

Aguardar ~5-10 minutos para completar

---

## 🔗 URLs após Deploy

```
Admin CMS:          https://aurasync.vercel.app
API Backend:        https://aurasync-api.vercel.app
Mobile Web:         https://aurasync-mobile.vercel.app
API Docs:           https://aurasync-api.vercel.app/docs
```

**Credenciais:**
- Admin: `admin@aurasync.app` / (senha definida em `AURASYNC_SEED_ADMIN_PASSWORD` no Vercel Secrets)
- Demo: `demo@aurasync.app` / `aurasync123`

---

## 📊 Monitoramento

### Ver Deployments
- Vercel Dashboard: [vercel.com/dashboard](https://vercel.com/dashboard)
- GitHub: **Actions** tab no seu repositório

### Ver Logs
```bash
vercel logs --tail
```

### Ver Métricas
- Vercel: Analytics
- GitHub: Actions workflows

---

## 🔐 Secrets do GitHub (para CI/CD)

Para ativar auto-deploy via GitHub Actions, adicionar secrets:

1. Vá para repositório → **Settings** → **Secrets and variables** → **Actions**
2. Adicione:

```
VERCEL_TOKEN=<seu token Vercel>
VERCEL_ORG_ID=<seu org ID>
VERCEL_PROJECT_ID=<seu project ID>
```

**Como obter:**
- `VERCEL_TOKEN`: [vercel.com/account/tokens](https://vercel.com/account/tokens) (gerar novo)
- `VERCEL_ORG_ID` e `VERCEL_PROJECT_ID`: Após criar projeto no Vercel, ir para **Settings**

---

## ✅ Checklist Completo

```
GitHub
  ☐ Criar repositório em github.com
  ☐ Fazer push: git push -u origin main
  ☐ Verificar código em github.com/seu_user/aurasync

Vercel
  ☐ Conectar repositório GitHub
  ☐ Configurar 3 projetos (Admin, Mobile, API)
  ☐ Adicionar Environment Variables
  ☐ Clicar Deploy
  ☐ Aguardar build completar (~10 min)

Validação
  ☐ Testar https://aurasync.vercel.app (Admin CMS)
  ☐ Testar https://aurasync-api.vercel.app/health (API)
  ☐ Testar https://aurasync-mobile.vercel.app (Mobile)
  ☐ Login funciona
  ☐ GitHub Actions roda em cada push
```

---

## 🆘 Troubleshooting

### Build falha no Vercel
```bash
# Ver logs detalhados
vercel logs --tail --level=debug
```

### Variáveis de ambiente não carregam
- Vercel: Limpar cache (Settings → Redeploy)
- GitHub: Reconectar repositório

### API não conecta
- Verificar `AURASYNC_DATABASE_URL` no Vercel
- Verificar firewall permite conexão

---

## 📱 Links Finais (Após Deploy)

| Componente | URL |
|---|---|
| **GitHub** | https://github.com/SEU_USERNAME/aurasync |
| **Admin CMS** | https://aurasync.vercel.app |
| **API Backend** | https://aurasync-api.vercel.app |
| **Mobile Web** | https://aurasync-mobile.vercel.app |
| **API Docs** | https://aurasync-api.vercel.app/docs |

---

## 📚 Referência Completa

- **[GITHUB_VERCEL_SETUP.md](GITHUB_VERCEL_SETUP.md)** — Guia detalhado (10 passos)
- **[vercel.json](vercel.json)** — Configuração dos 3 projetos
- **[.github/workflows/tests.yml](.github/workflows/tests.yml)** — CI/CD automático

---

## ⏱️ Tempo Estimado

- Push GitHub: **2 minutos**
- Setup Vercel: **5 minutos**
- Build automático: **10-15 minutos**
- **Total: ~20-30 minutos**

---

**🎉 Pronto para ir live!**

Após completar, seus links ficarão assim:
```
https://aurasync.vercel.app          ← Admin CMS
https://aurasync-api.vercel.app      ← API
https://aurasync-mobile.vercel.app   ← Mobile Web
```

E toda vez que fizer push para `main`, o Vercel redeploy automaticamente! 🚀

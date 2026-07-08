# AuraSync

Aplicativo de relaxamento, contemplação espiritual e expansão interior baseado em
músicas, sons naturais, meditações guiadas, imagens simbólicas, jornadas
espirituais e sessões binaurais.

> **Aviso**: o AuraSync não é um tratamento médico e não substitui acompanhamento
> profissional de saúde. A proposta é apoiar relaxamento, foco, sono, respiração,
> presença e contemplação. Ver [docs/COMPLIANCE.md](docs/COMPLIANCE.md).

## Estrutura do monorepo

| Pasta | Descrição |
|---|---|
| `backend/` | API FastAPI + SQLAlchemy 2 + Alembic (SQLite em dev, PostgreSQL em prod) |
| `mobile/` | App Expo (React Native + TypeScript), 5 abas + player imersivo |
| `admin/` | CMS básico em React + Vite + TypeScript |
| `scripts/` | Geração de áudio binaural próprio e ingestão manual de assets |
| `storage/` | Assets locais em dev (S3/Cloudflare R2 em prod) |
| `docs/` | Produto, taxonomia espiritual, política de licenças e compliance |

## Como rodar (dev)

### Backend

```bash
cd backend
python -m venv .venv
.venv/Scripts/activate        # Windows
pip install -r requirements.txt
python -m seeds.seed          # cria o banco, gera áudios binaurais e popula o catálogo
uvicorn app.main:app --reload --port 8000
```

API em `http://localhost:8000` — documentação interativa em `/docs`.

### Mobile

```bash
cd mobile
npm install
npx expo start --web          # ou use o app Expo Go no celular
```

### Admin (CMS)

```bash
cd admin
npm install
npm run dev                   # http://localhost:5173
```

## Princípios de conteúdo

1. Todo asset (áudio/imagem) **precisa** de licença registrada (`asset_licenses`)
   antes de ser publicado — fonte, autor, URL, licença e exigência de atribuição.
2. Ordem de preferência: domínio público → CC0 → CC BY → royalty-free permissiva
   → conteúdo próprio. Ver [docs/LICENCAS.md](docs/LICENCAS.md).
3. Sessões binaurais são **geradas por nós** (`scripts/generate_binaural.py`) —
   conteúdo 100% próprio, sem marcas de terceiros.
4. Nunca usar "Hemi-Sync®" ou marcas registradas de terceiros em código, UI,
   metadados ou marketing.

# Guia de Integração e Deploy em Produção (Supabase, Railway, Vercel)

Este guia apresenta o passo a passo completo para provisionar e implantar toda a infraestrutura em produção para o ecossistema AuraSync.

---

## Passo 1: Configuração do Supabase (Banco de Dados & Storage)

### 1.1 Criar Projeto no Supabase
1. Acesse o site do [Supabase](https://supabase.com) e crie um novo projeto.
2. Defina uma senha forte para o banco de dados e anote-a.
3. No painel do projeto, vá em **Project Settings > Database** e copie a **Connection String** no formato **URI** (modo *Transaction Pooler*, geralmente porta `6543`). Ela se parece com:
   `postgresql://postgres.[sua-ref]:[sua-senha]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require`

### 1.2 Configurar Supabase Storage (Buckets Públicos)
1. No menu lateral do Supabase, acesse **Storage**.
2. Clique em **New Bucket** e crie dois buckets:
   - Nome: `audio` (Marque como **Public**)
   - Nome: `images` (Marque como **Public**)
3. A URL pública para acessar os seus arquivos será estruturada da seguinte forma:
   `https://[sua-ref-supabase].supabase.co/storage/v1/object/public`

---

## Passo 2: Provisionar e Deploy do Backend no Railway

### 2.1 Criar Serviço no Railway
1. Acesse o [Railway](https://railway.app) e crie um novo projeto.
2. Adicione um novo serviço selecionando seu repositório GitHub e a pasta raiz `backend`.
3. O Railway detectará o arquivo [railway.json](file:///c:/AuraSync/backend/railway.json) na pasta `backend` e configurará o deploy automaticamente utilizando o Nixpacks.

### 2.2 Configurar Variáveis de Ambiente no Railway
No painel do Railway, selecione o serviço do backend, vá na aba **Variables** e adicione:
- `AURASYNC_DATABASE_URL`: *Cole a Connection String do Supabase copiada no Passo 1.1.*
- `AURASYNC_MEDIA_BASE_URL`: `https://[sua-ref-supabase].supabase.co/storage/v1/object/public` *(Copie a URL pública do Passo 1.2)*
- `AURASYNC_JWT_SECRET`: *Gere uma hash aleatória forte (ex: rodando `python -c "import secrets; print(secrets.token_urlsafe(32))"` no terminal).*
- `AURASYNC_CORS_ORIGINS`: `https://aurasync-admin.vercel.app,https://aurasync-mobile.vercel.app` *(Substitua pelas URLs reais geradas pelos deploys no Vercel a seguir)*

---

## Passo 3: Executar Migrações e Carga Inicial (Seeds) no Banco

Com a connection string de produção do Supabase em mãos, você criará as tabelas e povoará o catálogo rodando localmente (com o terminal apontado para a nuvem):

```bash
# 1. Entre na pasta backend e ative o ambiente virtual
cd backend
source .venv/bin/activate # ou .venv\Scripts\activate no Windows

# 2. Defina a variável de ambiente temporária do banco de produção
export AURASYNC_DATABASE_URL="sua-connection-string-do-supabase"
# No Windows PowerShell use:
# $env:AURASYNC_DATABASE_URL="sua-connection-string-do-supabase"

# 3. Rode as migrações do Alembic para estruturar o banco de dados
alembic upgrade head

# 4. Rode o script de Seeds para gerar as sessões padrão e o usuário admin de produção
python -m seeds.seed
```

---

## Passo 4: Configurar e Implantar o Painel Admin no Vercel

1. Acesse o [Vercel](https://vercel.com) e adicione um novo projeto conectado ao seu repositório.
2. Defina o **Root Directory** como `admin`.
3. Nas configurações do projeto, adicione a variável de ambiente:
   - `VITE_API_URL`: URL pública gerada pelo Railway para o backend (ex: `https://backend-production.up.railway.app`).
4. Clique em **Deploy**. O Vercel usará o arquivo [admin/vercel.json](file:///c:/AuraSync/admin/vercel.json) para gerenciar o roteamento dinâmico SPA.

---

## Passo 5: Configurar e Implantar o Mobile Expo Web no Vercel

1. No painel do Vercel, adicione outro novo projeto conectado ao mesmo repositório.
2. Defina o **Root Directory** como `mobile`.
3. Ajuste os comandos de Build e Output no painel da Vercel:
   - **Build Command**: `npm run build:web`
   - **Output Directory**: `web-build`
4. Nas configurações do projeto, adicione a variável de ambiente:
   - `EXPO_PUBLIC_API_URL`: URL pública gerada pelo Railway para o backend (ex: `https://backend-production.up.railway.app`).
5. Clique em **Deploy**. O Vercel usará o arquivo [mobile/vercel.json](file:///c:/AuraSync/mobile/vercel.json) para servir os arquivos estáticos compilados do Expo Web.

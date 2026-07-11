# AuraSync — Guia de Teste Manual

## Pré-requisitos

Todos os 3 servidores devem estar rodando em **novas janelas de terminal** (não histórico):

```bash
# Terminal 1: Backend FastAPI
cd C:\AuraSync\backend
.venv/Scripts/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Admin CMS (Vite)
cd C:\AuraSync\admin
npm run dev

# Terminal 3: Mobile (Expo)
cd C:\AuraSync\mobile
npm run web
```

---

## 1. Teste da API Backend (curl)

### 1.1 Health check
```bash
curl http://localhost:8000/health
# Esperado: {"status":"ok","app":"AuraSync API"}
```

### 1.2 Login como admin
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aurasync.app","password":"16Ta15Ti@"}'
```

**Esperado:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

**Copie o `access_token` para usar nos próximos testes.**

### 1.3 Verificar usuário admin
```bash
curl http://localhost:8000/auth/me \
  -H "Authorization: Bearer {COPIE_O_TOKEN_AQUI}"
```

**Esperado:**
```json
{
  "id": "...",
  "email": "admin@aurasync.app",
  "display_name": "Administrador",
  "role": "admin",
  "is_active": true
}
```

### 1.4 Listar todos os usuários
```bash
curl http://localhost:8000/admin/users \
  -H "Authorization: Bearer {COPIE_O_TOKEN_AQUI}"
```

**Esperado:** Lista com admin + demo@aurasync.app (ambos com role e is_active)

### 1.5 Desativar usuário demo
```bash
# Primeiro, obtenha o ID do demo do resultado anterior

curl -X PATCH http://localhost:8000/admin/users/{ID_DO_DEMO} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {COPIE_O_TOKEN_AQUI}" \
  -d '{"is_active": false}'
```

**Esperado:** demo@aurasync.app com `is_active: false`

### 1.6 Tentar login com conta desativada
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@aurasync.app","password":"16Ta15Ti@"}'
```

**Esperado:** 403 Forbidden — "Conta desativada"

---

## 2. Teste do CMS Admin (http://localhost:5173)

### 2.1 Tela de login
- Abrir http://localhost:5173
- Ver formulário com E-mail (`admin@aurasync.app`) pré-preenchido
- Campo Senha vazio
- Botão "Entrar"

### 2.2 Fazer login
- Preencher Senha: `16Ta15Ti@`
- Clicar "Entrar"
- **Esperado:** Redirecionar para CMS com aba "Conteúdo" ativa

### 2.3 Verificar aba Conteúdo
- Ver tabela com ~8 itens (5 binaurais + 3 respirações)
- Todos com status "publicado"
- Botões "Despublicar" à direita

### 2.4 Verificar aba Usuários
- Clicar aba "Usuários (2)"
- Ver tabela com:
  - `admin@aurasync.app` — Papel: admin, Status: ativo
  - `demo@aurasync.app` — Papel: user, Status: desativado (se testou 1.5)
- Admin tem label "sua conta" (sem botões de ação)

### 2.5 Promover demo para admin
- Clicar "Fazer admin" na linha demo
- Botão muda para "Remover admin"
- Papel muda de "user" para "admin"

### 2.6 Tentar auto-sabotagem (proteção)
- Clicar "Remover admin" no seu próprio usuário (admin)
- **Esperado:** Erro "Você não pode remover seu próprio acesso de administrador"

---

## 3. Teste do App Mobile (http://localhost:19006)

### 3.1 Tela de login
- Abrir http://localhost:19006
- Ver formulário com demo@aurasync.app pré-preenchido
- Clicar "Entrar"

### 3.2 Fluxo se demo ainda estiver ativo
- Onboarding de 4 telas (objetivo, tipo, duração, eixos)
- Tela Início com "Recomendado para agora"
- Abas: Início, Explorar, Meditar, Jornadas, Perfil

### 3.3 Fluxo se demo foi desativado (1.5)
- **Esperado:** Erro "Conta desativada" após clicar Entrar
- Reativar demo em /admin/users do CMS e tentar novamente

---

## 4. Testes Automatizados Backend

Todos os testes devem passar (12/12):

```bash
cd C:\AuraSync\backend
.venv/Scripts/python.exe -m pytest tests -v
```

**Esperado:** 12 passed

---

## Checklist de Conclusão

- [ ] Health check do backend retorna OK
- [ ] Login do admin gera JWT token válido
- [ ] /auth/me mostra role='admin' e is_active=true
- [ ] /admin/users lista ambos os usuários com role e status
- [ ] Desativar demo bloqueia seu login
- [ ] CMS carrega e faz login com sucesso
- [ ] Aba Conteúdo mostra 8 itens publicados
- [ ] Aba Usuários lista 2 usuários com ações
- [ ] Proteção anti-sabotagem funciona (não consegue remover seu próprio admin)
- [ ] 12/12 testes backend passam

---

## Notas

- Credenciais padrão de dev são para **desenvolvimento apenas**. Em produção, defina `AURASYNC_SEED_ADMIN_PASSWORD`.
- O uvicorn tem `--reload` habilitado, então mudanças em Python recarregam automaticamente.
- O Vite tem hot reload para React/TypeScript — mudanças aparecem instantaneamente.
- Se o CMS ficar preso, fazer hard refresh (`Ctrl+Shift+R` no navegador) ou limpar localStorage: `localStorage.clear()` no console do navegador.

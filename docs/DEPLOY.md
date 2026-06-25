# Deploy gratuito — Supabase + Render

Guia passo a passo para subir o LookMenu **de graça** e testar todas as funcionalidades (exceto WhatsApp em produção — veja nota no final).

**Tempo estimado:** ~30 minutos na primeira vez.

---

## Visão geral

| Serviço | Plano | Função |
|---------|-------|--------|
| [Supabase](https://supabase.com) | Free | PostgreSQL + Storage de imagens |
| [Render](https://render.com) | Free | Hospeda o Next.js |
| [cron-job.org](https://cron-job.org) | Free | Dispara o recuperador de carrinho (opcional) |

**WhatsApp (Evolution API):** não roda no Render gratuito. Deixe `WHATSAPP_ENABLED=false` no deploy. Para testar WhatsApp, use Docker local (`docker compose up`).

---

## Parte 1 — Supabase (banco + imagens)

### 1.1 Criar conta e projeto

1. Acesse [supabase.com](https://supabase.com) → **Start your project** → login com GitHub.
2. **New project**
   - Name: `lookmenu`
   - Database Password: **anote essa senha** (você vai usar várias vezes)
   - Region: escolha a mais próxima (ex: South America se disponível, senão US East)
3. Aguarde ~2 minutos o projeto ficar **Active**.

### 1.2 Pegar as URLs do banco

1. No painel Supabase: **Project Settings** (ícone engrenagem) → **Database**
2. Role até **Connection string** → aba **URI**

Você precisa de **duas** connection strings:

#### `DATABASE_URL` (runtime — pooler, porta 6543)

- Clique em **Connect** → **ORMs** → **Prisma**
- Copie a string **"Transaction pooler"** (porta **6543**)
- Deve conter `?pgbouncer=true`

Exemplo:
```
postgresql://postgres.abcdefgh:SUA_SENHA@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

#### `DIRECT_URL` (migrations — direta, porta 5432)

- Na mesma tela, copie **"Session pooler"** ou **"Direct connection"** (porta **5432**)

Exemplo:
```
postgresql://postgres.abcdefgh:SUA_SENHA@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

> **Dica:** substitua `[YOUR-PASSWORD]` pela senha que você definiu ao criar o projeto.

### 1.3 Pegar chaves da API (Storage)

1. **Project Settings** → **API**
2. Copie:
   - **Project URL** → vira `SUPABASE_URL`  
     Ex: `https://abcdefgh.supabase.co`
   - **service_role** (secret) → vira `SUPABASE_SERVICE_KEY`  
     ⚠️ **Nunca** exponha no frontend. Só no Render.

### 1.4 Criar bucket de imagens

1. Menu lateral → **Storage** → **New bucket**
2. Name: `lookmenu`
3. Marque **Public bucket** ✅
4. Create bucket

Pronto — uploads do painel (logo, fotos de produtos) vão para esse bucket.

---

## Parte 2 — Gerar segredos (AUTH + CRON)

No seu PC, na raiz do projeto:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/generate-secrets.ps1
```

Isso imprime valores para `AUTH_SECRET` e `CRON_SECRET`. **Anote os dois.**

Ou gere manualmente:
```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

## Parte 3 — GitHub (se ainda não tiver)

1. Crie um repositório no GitHub (pode ser privado).
2. Faça push do projeto:

```bash
git add .
git commit -m "Preparar deploy Render + Supabase"
git push origin main
```

---

## Parte 4 — Render (hospedar o app)

### Opção A — Blueprint (recomendado)

1. Acesse [dashboard.render.com/blueprints](https://dashboard.render.com/blueprints)
2. **New Blueprint Instance** → conecte o GitHub → selecione o repo `lookmenu`
3. Render detecta o `render.yaml` — clique **Apply**

### Opção B — Manual

1. [dashboard.render.com](https://dashboard.render.com) → **New +** → **Web Service**
2. Conecte o repo
3. Configuração:

| Campo | Valor |
|-------|-------|
| Name | `lookmenu` |
| Region | Oregon (ou mais próxima) |
| Branch | `main` |
| Root Directory | *(vazio — raiz do repo)* |
| Runtime | Node |
| Build Command | `bun run render:build` |
| Start Command | `bun run render:start` |
| Plan | **Free** |

### 4.1 Variáveis de ambiente no Render

No serviço → **Environment** → adicione:

| Variável | Valor | Onde pegar |
|----------|-------|------------|
| `APP_URL` | `https://lookmenu-xxxx.onrender.com` | URL do serviço após criar (atualize depois do 1º deploy se mudar) |
| `DATABASE_URL` | `postgresql://...6543...?pgbouncer=true` | Supabase → Database → Transaction pooler |
| `DIRECT_URL` | `postgresql://...5432...` | Supabase → Database → Session/Direct |
| `AUTH_SECRET` | string longa aleatória | `generate-secrets.ps1` |
| `CRON_SECRET` | outra string longa | `generate-secrets.ps1` |
| `STORAGE_PROVIDER` | `supabase` | fixo |
| `SUPABASE_URL` | `https://xxx.supabase.co` | Supabase → Settings → API |
| `SUPABASE_SERVICE_KEY` | `eyJ...` (service_role) | Supabase → Settings → API |
| `SUPABASE_BUCKET` | `lookmenu` | nome do bucket |
| `WHATSAPP_ENABLED` | `false` | fixo (Render free) |
| `SUPER_ADMIN_PASSWORD` | senha forte | você escolhe |
| `LOJISTA_DEMO_PASSWORD` | senha forte | você escolhe |
| `SUPPORT_WHATSAPP` | `5511...` | seu WhatsApp (opcional) |

Render gera `AUTH_SECRET` e `CRON_SECRET` automaticamente se usar o Blueprint — ou cole os seus.

Clique **Save Changes** → **Manual Deploy** → **Deploy latest commit**.

O build leva ~5–10 min (instala deps, `prisma db push`, `next build`).

### 4.2 Atualizar APP_URL

Após o deploy, copie a URL real (ex: `https://lookmenu-abc1.onrender.com`) e atualize `APP_URL` no Environment → Save → redeploy.

Isso corrige links de QR Code e recuperador de carrinho.

---

## Parte 5 — Popular o banco (seed)

O seed **não** roda no build (evita recriar dados a cada deploy).

1. Render → seu serviço → aba **Shell**
2. Execute:

```bash
bun run db:seed
```

Saída esperada: loja demo criada, usuários, produtos, mesas.

### Credenciais após o seed

| Papel | Email | Senha |
|-------|-------|-------|
| Super Admin | `admin@lookmenu.local` | valor de `SUPER_ADMIN_PASSWORD` no Render |
| Lojista demo | `lojista@burger-king-demo.local` | valor de `LOJISTA_DEMO_PASSWORD` no Render |

**Loja demo:** slug `burger-king-demo`  
URL pública: `https://SEU-APP.onrender.com/burger-king-demo`

**PINs garçom** (`/burger-king-demo/atendimento`):
- João — `1234`
- Maria — `5678`

---

## Parte 6 — Testar tudo

Checklist após deploy:

- [ ] Landing: `https://SEU-APP.onrender.com`
- [ ] Login lojista: `/login` → `/painel`
- [ ] Cardápio público: `/burger-king-demo`
- [ ] Checkout (PIX simulado): adicionar item → checkout → confirmar
- [ ] KDS: `/painel/pedidos` — pedido aparece
- [ ] Upload imagem produto: `/painel/produtos` (Supabase Storage)
- [ ] Salão: `/burger-king-demo/atendimento` PIN `1234`
- [ ] Admin: login `admin@lookmenu.local` → `/admin`
- [ ] Criar loja nova: `/comecar`

> **Cold start:** no plano free o Render “dorme” após ~15 min sem acesso. A primeira requisição pode levar 30–60 s.

---

## Parte 7 — Cron do recuperador (opcional, grátis)

Só funciona com WhatsApp — se `WHATSAPP_ENABLED=false`, pule esta parte.

Para agendar sem pagar Render Cron:

1. Crie conta em [cron-job.org](https://cron-job.org)
2. **Create cronjob**
   - URL: `https://SEU-APP.onrender.com/api/cron/recuperador`
   - Schedule: every 5 minutes
   - Request method: **POST**
   - Headers: `Authorization: Bearer SEU_CRON_SECRET`
3. Salve e ative

Teste manual (PowerShell):
```powershell
curl -Method POST "https://SEU-APP.onrender.com/api/cron/recuperador" `
  -Headers @{ Authorization = "Bearer SEU_CRON_SECRET" }
```

Resposta esperada: `{"ok":true,...}`

---

## Parte 8 — WhatsApp local (opcional)

Para testar notificações WhatsApp **no seu PC**:

```bash
# raiz do projeto
docker compose up -d
```

No `.env` local:
```env
WHATSAPP_ENABLED="true"
EVOLUTION_API_URL="http://localhost:8080"
EVOLUTION_API_KEY="change-this-evolution-key"
EVOLUTION_INSTANCE="lookmenu"
```

Guia completo: [whatsapp-setup.md](./whatsapp-setup.md)

---

## Resumo — onde pegar cada chave

| Variável | Onde |
|----------|------|
| `DATABASE_URL` | Supabase → Settings → Database → URI → **Transaction pooler :6543** |
| `DIRECT_URL` | Supabase → Settings → Database → URI → **Session/Direct :5432** |
| `SUPABASE_URL` | Supabase → Settings → **API** → Project URL |
| `SUPABASE_SERVICE_KEY` | Supabase → Settings → **API** → `service_role` secret |
| `AUTH_SECRET` | `scripts/generate-secrets.ps1` ou Render auto-gera |
| `CRON_SECRET` | idem |
| `APP_URL` | URL do serviço no Render |
| `SUPER_ADMIN_PASSWORD` | você define no Render |
| `LOJISTA_DEMO_PASSWORD` | você define no Render |

---

## Problemas comuns

### Build falha em `prisma db push`
- Confira `DATABASE_URL` e `DIRECT_URL`
- Senha com caracteres especiais? Encode na URL (`@` → `%40`, etc.)
- Projeto Supabase está **Active**?

### Upload de imagem falha
- `STORAGE_PROVIDER=supabase`
- Bucket `lookmenu` existe e é **público**
- `SUPABASE_SERVICE_KEY` é a **service_role**, não a `anon`

### Login não funciona
- Rode `bun run db:seed` no Shell do Render
- `AUTH_SECRET` não pode mudar depois do seed sem invalidar sessões (só faça logout/login)

### App lento
- Plano free do Render — cold start normal
- Supabase free — limites de conexão; use sempre o pooler (`6543`) em `DATABASE_URL`

### Redeploy após mudar schema
Cada deploy roda `prisma db push` automaticamente no build.

---

## Próximos passos (quando sair do free)

- Gateway PIX real (Mercado Pago / Asaas)
- Billing de planos
- VPS para Evolution API (WhatsApp em produção)
- Render paid ou Vercel Pro (sem cold start)

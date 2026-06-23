# LookMenu

Multi-tenant SaaS for restaurants. Each store gets a branded digital menu, checkout, full dining room management (tables, waiters, KDS, bar), financial reports, and optional WhatsApp notifications.

## Requirements

- [Bun](https://bun.sh/) v1.1+
- [PostgreSQL](https://www.postgresql.org/) 14+
- [Docker](https://www.docker.com/) (optional — for Evolution API / WhatsApp)
- Node.js 20+ (used by some tooling)

## Development Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd lookmenu/web
bun install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set at minimum:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/lookmenu"
AUTH_SECRET="a-random-32-char-string-here"
```

### 3. Database

```bash
# From the project root (lookmenu/)
bun run prisma db push       # Create/sync tables
bun run prisma generate      # Generate Prisma client
bun run prisma db seed       # Seed with demo data
```

### 4. Run the app

```bash
cd web
bun dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

## Seed Credentials

After running the seed:

| Role | Email | Password |
|---|---|---|
| Super Admin | `admin@lookmenu.com.br` | `admin123` |
| Lojista | `lojista@demonstracao.com.br` | `loja123` |

Demo store slug: `demonstracao`

Waiter PINs (for `/{slug}/atendimento` login):
- João Garçom — PIN `1234`
- Maria Atendente — PIN `5678`

## Useful Scripts

All commands from the `lookmenu/` project root unless noted:

```bash
# Sync schema to DB (no migration files, dev only)
bun run prisma db push

# Generate Prisma client after schema change
bun run prisma generate

# Open Prisma Studio (DB GUI)
bun run prisma studio

# Reseed the database
bun run prisma db seed

# TypeScript check (from web/)
cd web && bun run tsc --noEmit
```

## WhatsApp (Evolution API) — Local Setup

See [`docs/whatsapp-setup.md`](./docs/whatsapp-setup.md) for the full guide. Quick start:

```bash
# Start Evolution API
docker compose up -d

# Create the WhatsApp instance
curl -X POST http://localhost:8080/instance/create \
  -H "apikey: change-this-evolution-key" \
  -H "Content-Type: application/json" \
  -d '{"instanceName":"lookmenu","qrcode":true}'
```

Then set in `.env`:

```env
WHATSAPP_ENABLED="true"
EVOLUTION_API_URL="http://localhost:8080"
EVOLUTION_API_KEY="change-this-evolution-key"
EVOLUTION_INSTANCE="lookmenu"
```

Scan the QR code at `/painel/whatsapp` in the admin panel.

## File Uploads

By default, files are saved to `web/public/uploads/` (local storage). To use Supabase Storage:

```env
STORAGE_PROVIDER="supabase"
SUPABASE_URL="https://xxxx.supabase.co"
SUPABASE_SERVICE_KEY="eyJ..."
SUPABASE_BUCKET="lookmenu"
```

## Architecture

See [`docs/architecture.md`](./docs/architecture.md).

## Key Routes

| Route | Description |
|---|---|
| `/{slug}` | Public digital menu |
| `/{slug}/checkout` | Checkout |
| `/{slug}/atendimento` | Waiter login |
| `/{slug}/atendimento/mesas` | Table management |
| `/{slug}/atendimento/bar` | Bar screen |
| `/painel` | Lojista admin panel |
| `/painel/pedidos` | KDS / Orders board |
| `/painel/financeiro` | Financial reports |
| `/painel/aparencia` | Appearance editor with live preview |
| `/painel/adicionais` | Product add-ons management |
| `/painel/whatsapp` | WhatsApp connection |
| `/admin` | Super-admin panel |

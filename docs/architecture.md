# LookMenu — Architecture

## Stack

| Layer | Technology |
|---|---|
| Runtime | Bun |
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS + shadcn/ui |
| ORM | Prisma 7 |
| Database | PostgreSQL |
| Auth | JWT via `jose` (HTTP-only cookie) |
| Storage | Local filesystem or Supabase Storage |
| Notifications | Evolution API (WhatsApp) |

## Project Structure

```
lookmenu/
├── prisma/
│   ├── schema.prisma        # Prisma schema
│   └── seed.ts              # Seed script
├── web/                     # Next.js app
│   └── src/
│       ├── app/
│       │   ├── [slug]/      # Public cardápio + checkout + atendimento
│       │   ├── painel/      # Lojista admin panel
│       │   ├── admin/       # Super-admin panel
│       │   └── api/         # API routes (upload, auth)
│       ├── components/      # Shared UI components
│       └── lib/             # Utilities (auth, prisma, storage, notifications)
├── docs/                    # Documentation
└── docker-compose.yml       # Evolution API local dev
```

## Multi-Tenancy

Each `Loja` (store) has a unique `slug`. All data (products, orders, employees, tables, etc.) is scoped by `lojaId`. Routes under `[slug]/` serve the public cardápio and waiter screens for that specific store.

## Authentication & Authorization

| Role | Scope | Mechanism |
|---|---|---|
| `SUPER_ADMIN` | All lojas | JWT cookie (`AUTH_SECRET`) |
| `LOJISTA` | Own loja | JWT cookie (`AUTH_SECRET`) |
| Garçom/Atendente | Atendimento screens | `atendimento_session` cookie (JWT, scoped to loja) |

## Features

### Cardápio (Public)

- Three visual templates: **Clássico**, **Moderno**, **Dark**
- Configurable primary color, palette presets, textures, and font
- Live preview in the admin panel (via `?_preview=1` query params)
- Cart with quantity management
- Checkout flow with configurable payment methods per store (PIX, card, cash)
- PIX is simulated (marks order as PAGO without a real gateway)

### Configurações de Pagamento

- Per-store toggles: `aceitaPixSite`, `aceitaCartaoEntrega`, `aceitaDinheiroEntrega`
- Toggle `pagamentoNaMesa` controls whether waiters can select payment method

### Salão (Dining Room)

Full table service flow:
1. Waiter logs in with PIN (bcrypt-hashed)
2. Selects a table — sees open comanda if one exists
3. Adds items to the comanda (creates new or accumulates into existing open order)
4. Kitchen Display System (KDS) receives the order, advances it through `NOVO → EM_PREPARACAO → PRONTO`
5. For `SALAO_MESA` orders, KDS stops at `PRONTO`; the waiter closes the bill
6. Waiter closes the bill via "Fechar conta" modal, selects payment method → order becomes `CONCLUIDO + PAGO`

**Bar screen:** Separate view showing `PRONTO` orders with bar items. Waiter can mark individual orders as "Entregue" (`entregueBarEm DateTime?` field), removing them from the queue.

### Financeiro

- Date range, tipo (Delivery/Balcão/Salão), forma de pagamento, status, categoria, product name filters
- "Só concluídos/pagos" toggle
- Metrics cards: total sold, order count, breakdown by payment method, breakdown by channel (Delivery/Balcão/Salão)
- Daily revenue chart
- Orders table
- CSV export of filtered orders

### Horário de Funcionamento

- `HorarioFuncionamento` model: 7 registros por loja (0=dom … 6=sáb), com `abreAs`/`fechaAs` (formato HH:MM) e flag `fechado`.
- `Loja.timezone` (padrão `America/Sao_Paulo`) determina o fuso usado nas comparações.
- `web/src/lib/loja-config.ts` exporta `lojaEstaAberta()` — avalia se a loja está aberta dado o instante atual no fuso da loja, retornando `{ aberta, mensagem, proximaAbertura? }`.
- **Limitação:** horários que cruzam meia-noite (ex: 22:00–02:00) não são suportados; divida em dois registros se necessário.
- **Cardápio público (`[slug]/page.tsx`):** carrega horários, chama `lojaEstaAberta`, passa `lojaFechada`/`mensagemFechada`/`proximaAbertura` para todos os templates. Quando fechada, exibe banner âmbar e desabilita o botão "Adicionar" nos três templates (Clássico, Moderno, Dark).
- **Checkout (`[slug]/checkout/actions.ts`):** valida `lojaEstaAberta` no servidor antes de criar o pedido; retorna erro claro se fechada.
- **Painel (`/painel/configuracoes`):** seção "Horário de funcionamento" com grade de 7 dias, toggle Aberto/Fechado e inputs `type="time"`. Persistido via `updateHorariosAction`.

### Cupons e Promoções (Fase 4)

- **Modelo `Cupom`** (scoped por `lojaId`): `codigo` (único por loja, case-insensitive), `tipo` (`PERCENTUAL` | `VALOR_FIXO`), `valor`, `pedidoMinimo?`, `maxUsos?`, `usosAtuais`, `validoDe?`, `validoAte?`, `ativo`.
- **`Pedido`** agora persiste `desconto` e `cupomId` (FK → Cupom).
- **`lib/planos.ts`**: stub `canUseCupons(lojaId)` retorna `true` (TODO Fase 5: integrar billing).
- **Painel (`/painel/cupons`)**: CRUD completo — criar, editar, toggle ativo/inativo, excluir. Mostra usos restantes, validade e estado (Ativo / Inativo / Esgotado / Expirado). Nav item "Cupons" adicionado.
- **Server actions em `painel/actions.ts`**: `createCupomAction`, `updateCupomAction`, `toggleCupomAction`, `deleteCupomAction`.
- **Checkout público (`[slug]/checkout`)**:
  - `validarCupomAction(slug, codigo, subtotal)` em `checkout/actions.ts` — valida `ativo`, validade, `maxUsos`, `pedidoMinimo`; calcula desconto (percentual capped no subtotal); sem side-effects (não incrementa usos).
  - `CheckoutForm` exibe campo "Cupom de desconto" com botão Aplicar; linha "Desconto (CODIGO)" em verde no breakdown; botão Remover.
  - `criarPedidoAction` revalida cupom server-side, aplica desconto em `calcularTotaisPedido`, usa `prisma.$transaction` para criar pedido + `usosAtuais++` atomicamente.
- Regras: 1 cupom/pedido, não acumulável, total nunca negativo, todas as queries scopadas por `lojaId`.
- Seed demo: cupom `DEMO10` — 10% OFF, pedido mínimo R$ 30, 100 usos máximos.

### Taxa de Entrega Configurável (Fase 2)

- Três campos opcionais em `Loja`: `pedidoMinimo`, `taxaEntregaFixa`, `freteGratisAcima` (`Decimal?`).
- `Pedido` persiste `subtotal` e `taxaEntrega` além de `total`.
- `web/src/lib/loja-config.ts` exporta `calcularTotaisPedido({ subtotal, tipoEntrega, … })`:
  - Taxa só aplicada em `DELIVERY`; zerada se `subtotal >= freteGratisAcima`.
  - Retorna `{ subtotal, taxaEntrega, desconto, total }`.
- **Checkout público (`[slug]/checkout`):**
  - `CheckoutForm` exibe breakdown Subtotal / Taxa de entrega / Total de forma reativa ao `tipoEntrega`.
  - Banner "Frete grátis em pedidos acima de …" quando aplicável.
  - Botão desabilitado se abaixo do pedido mínimo.
  - `criarPedidoAction` recalcula totais server-side, valida `pedidoMinimo` e persiste `subtotal`, `taxaEntrega`, `total`.
- **Painel (`/painel/configuracoes`):** seção "Entrega" com `EntregaForm` → `updateEntregaAction`.
- Seed demo: `pedidoMinimo=25`, `taxaEntregaFixa=8`, `freteGratisAcima=80`.

### Gerador de QR Code (Fase 3)

- Dependência server-side: `qrcode` (PNG base64 via `QRCode.toDataURL`).
- Nova rota `/painel/qrcode`:
  - QR do cardápio completo → `${APP_URL}/${slug}`.
  - Grid de QRs por mesa ativa → `${APP_URL}/${slug}?mesa=${numero}`.
  - Cada card: preview PNG + botão **Baixar PNG** + botão **Copiar link**.
- `gerarQRCodeAction(url)` em `painel/qrcode/actions.ts` (server action pura).
- `APP_URL` lido de `process.env.APP_URL` (servidor).
- Nav item "QR Codes" adicionado a `PAINEL_NAV`.

### Adicionais de Produto (B1)

- `Adicional` model (scoped per loja): name, price, availability
- `ProdutoAdicional` join table: links adicionais to products
- `ItemPedidoAdicional`: records which adicionais were selected per order item (foundation for checkout integration)
- Admin CRUD at `/painel/adicionais` with product linking UI

### WhatsApp Notifications

- Integration via [Evolution API](https://doc.evolution-api.com/)
- Messages sent on order `CRIADO` and status changes
- Feature-gated via `WHATSAPP_ENABLED=true` environment variable
- Admin connection management (QR code, status) at `/painel/whatsapp`
- See `docs/whatsapp-setup.md` for local setup instructions

### File Storage

- Abstracted via `lib/storage.ts`
- `STORAGE_PROVIDER=local` → saves to `public/uploads/`
- `STORAGE_PROVIDER=supabase` → uploads to Supabase Storage bucket
- Used for product images and loja logo uploads
- Upload endpoint: `POST /api/upload`

## Data Models (Simplified)

```
Loja  (+ pedidoMinimo?, taxaEntregaFixa?, freteGratisAcima?)
 ├── Categoria[]
 │    └── Produto[]
 │         └── ProdutoAdicional[] → Adicional
 ├── Pedido[]  (+ subtotal?, taxaEntrega?, desconto?, cupomId?)
 │    ├── ItemPedido[]
 │    │    └── ItemPedidoAdicional[] → Adicional
 │    ├── Mesa?
 │    ├── Funcionario?
 │    └── Cupom?
 ├── HorarioFuncionamento[]   ← 7 registros (um por dia da semana)
 ├── Mesa[]
 ├── Funcionario[]
 ├── Adicional[]
 ├── Cupom[]
 └── Usuario[]
```

## Environment Variables

See `.env.example` for all required variables:

- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET` — JWT secret (32+ chars)
- `APP_URL` — Base URL da aplicação (ex: `https://lookmenu.com`). Usado pelo gerador de QR Code.
- `WHATSAPP_ENABLED`, `EVOLUTION_API_URL`, `EVOLUTION_API_KEY`, `EVOLUTION_INSTANCE`
- `STORAGE_PROVIDER`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_BUCKET`

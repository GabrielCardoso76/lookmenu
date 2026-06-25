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

### Captação & Auto-cadastro (Fase A)

- Campos novos em `Loja`: `trialExpiraEm DateTime?`, `planoInteresse String?` (`"START" | "PLUS"`).
- **Rota pública `/comecar`**: formulário de auto-cadastro (nome do estabelecimento, slug auto-gerado/editável e único, responsável, email, senha ≥6, WhatsApp da loja, plano START/PLUS — `?plano=plus` pré-seleciona).
- **`cadastrarLojaPublicaAction`** (`/comecar/actions.ts`): valida unicidade de slug/email; em `$transaction` cria `Loja` (ativa, cor `#F59E0B`, trial = now+14d, `planoInteresse`) + `Usuario` LOJISTA + 7 horários default (11:00–23:00); faz auto-login (`createSession`) e redireciona para `/painel?bemvindo=1`. Mensagem clara se o email já existe ("Faça login").
- **`lib/planos.ts`**: `getTrialStatus(lojaId)` → `{ temTrial, ativo, expirado, expiraEm, diasRestantes }`. Stubs `canUseRecuperador`/`canUseIfood` retornam `true`.
- **Banner de trial** no `/painel`: ativo ("Trial até DD/MM") ou expirado (aviso âmbar — não bloqueia no MVP). Banner de boas-vindas quando `?bemvindo=1`.
- **CTAs da landing** apontam para `/comecar`: hero, pricing (por plano via `?plano=`), support, header (desktop + mobile), e link "Criar minha loja grátis" no `/login`. O formulário de contato permanece em `POST /api/contato` (inalterado).
- **Admin (`/admin`)**: coluna "Plano / Trial" mostrando `planoInteresse` e `trialExpiraEm`.

### Recuperador de Vendas / Carrinho Abandonado (Fase B)

- **Modelo `CarrinhoAbandonado`** (scoped por `lojaId`): `telefone?`, `nomeCliente?`, `itensJson` (Json), `subtotal`, `recuperacaoEnviadaEm?`, `recuperadoEm?`, `pedidoRecuperadoId?` (unique), timestamps. Unique `[lojaId, telefone]` para upsert; index `[lojaId, criadoEm]`.
- **`Loja`**: `recuperadorAtivo Boolean @default(true)`, `recuperadorMinutos Int @default(15)`.
- **Captura** (`[slug]/checkout/checkout-form.tsx`): ao preencher o telefone (debounce + onBlur) chama `registrarCarrinhoAbandonadoAction(slug, telefone, nome, items)` → upsert por `lojaId+telefone` atualizando `itensJson`/`subtotal`. Fire-and-forget, nunca quebra o checkout.
- **Recuperação automática** (`criarPedidoAction`): ao criar pedido, se houver carrinho aberto para o telefone, marca `recuperadoEm` + `pedidoRecuperadoId`.
- **`lib/recuperador.ts` → `processarRecuperacoesPendentes()`**: seleciona carrinhos com telefone, sem mensagem enviada, ociosos há mais de `recuperadorMinutos`, criados nas últimas 24h, loja com `recuperadorAtivo` e `WHATSAPP_ENABLED=true`. Envia WhatsApp (via `enviarMensagemWhatsApp`) com link `APP_URL/{slug}/checkout`; marca `recuperacaoEnviadaEm` **antes** do envio (idempotente).
- **Cron**: `POST /api/cron/recuperador` protegido por `Authorization: Bearer CRON_SECRET`. Agende a cada ~5 min em produção.
- **Painel (`/painel/recuperador`)**: nav item "Recuperador"; toggle ativo + minutos (`updateRecuperadorAction`); cards de métricas 7d (abandonados / enviados / recuperados + conversão); tabela dos últimos 50 carrinhos. Gate `canUseRecuperador(lojaId)` (stub).

### iFood Entrega Fácil (Fase C)

- **`Loja`**: `ifoodEntregaFacilAtivo`, `ifoodMerchantId?`, `ifoodAccessToken? @db.Text`, `ifoodRefreshToken? @db.Text`, `ifoodTokenExpiraEm?`.
- **`Pedido`**: `ifoodEntregaId?`, `ifoodEntregaStatus?`, `ifoodEntregaSolicitadaEm?`.
- **`lib/ifood-entrega.ts`**: integração com a API de Shipping (pedidos fora da plataforma). `obterAccessTokenValido` (OAuth2 client_credentials, com refresh e persistência do token por loja), `solicitarEntrega(pedidoId)` (`POST /shipping/v1.0/merchants/{merchantId}/orders`, só DELIVERY com endereço, idempotente), `syncStatus(pedidoId)`, `testarConexao`/`refreshToken`. Todas retornam `{ ok, error?, data? }` e **nunca lançam** — sem credenciais a UI aparece "desconectada".
- **Config (`/painel/configuracoes`)**: seção "iFood Entrega Fácil" (toggle + Merchant ID + "Testar conexão"). Gate `canUseIfood(lojaId)` (stub).
- **KDS**: em cards DELIVERY, botão "Solicitar entregador iFood" (quando ativo e sem `ifoodEntregaId`) e badge de status + sincronizar. Actions `solicitarEntregaIfoodAction` / `syncEntregaIfoodAction`.
- **Webhook**: `POST /api/webhooks/ifood/entrega` (header `x-ifood-webhook-secret` ou `?secret=` = `IFOOD_WEBHOOK_SECRET`). Casa pelo `ifoodEntregaId`, atualiza status; `DELIVERED` → `CONCLUIDO`, em rota → `EM_ENTREGA`.
- Setup completo em [`docs/ifood-entrega-facil-setup.md`](./ifood-entrega-facil-setup.md).

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
Loja  (+ pedidoMinimo?, taxaEntregaFixa?, freteGratisAcima?,
        trialExpiraEm?, planoInteresse?,
        recuperadorAtivo, recuperadorMinutos,
        ifoodEntregaFacilAtivo, ifoodMerchantId?, ifoodAccessToken?, ifoodRefreshToken?, ifoodTokenExpiraEm?)
 ├── Categoria[]
 │    └── Produto[]
 │         └── ProdutoAdicional[] → Adicional
 ├── Pedido[]  (+ subtotal?, taxaEntrega?, desconto?, cupomId?,
 │              ifoodEntregaId?, ifoodEntregaStatus?, ifoodEntregaSolicitadaEm?)
 │    ├── ItemPedido[]
 │    │    └── ItemPedidoAdicional[] → Adicional
 │    ├── Mesa?
 │    ├── Funcionario?
 │    ├── Cupom?
 │    └── CarrinhoAbandonado?  (recuperado → pedidoRecuperadoId)
 ├── HorarioFuncionamento[]   ← 7 registros (um por dia da semana)
 ├── Mesa[]
 ├── Funcionario[]
 ├── Adicional[]
 ├── Cupom[]
 ├── CarrinhoAbandonado[]      ← recuperador de vendas (unique lojaId+telefone)
 └── Usuario[]
```

## Environment Variables

See `.env.example` for all required variables:

- `DATABASE_URL` — PostgreSQL connection string
- `DIRECT_URL` — conexão direta Supabase (porta 5432) para `db push` em produção
- `AUTH_SECRET` — JWT secret (32+ chars)
- `CRON_SECRET` — protege `POST /api/cron/recuperador`
- `APP_URL` — Base URL da aplicação (ex: `https://lookmenu.onrender.com`). Usado pelo gerador de QR Code.
- `WHATSAPP_ENABLED`, `EVOLUTION_API_URL`, `EVOLUTION_API_KEY`, `EVOLUTION_INSTANCE`
- `SUPPORT_WHATSAPP` — número de suporte (formato internacional sem +)
- `IFOOD_CLIENT_ID`, `IFOOD_CLIENT_SECRET`, `IFOOD_API_URL`, `IFOOD_WEBHOOK_SECRET` — iFood Entrega Fácil (ver [`docs/ifood-entrega-facil-setup.md`](./ifood-entrega-facil-setup.md))
- `STORAGE_PROVIDER`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_BUCKET`

Deploy gratuito (Supabase + Render): ver [`docs/DEPLOY.md`](./DEPLOY.md).

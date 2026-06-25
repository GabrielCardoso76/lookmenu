# iFood Entrega Fácil — Setup (MVP)

Integração com a **API de Shipping** do iFood para solicitar entregadores iFood
("Entrega Fácil") para pedidos delivery criados no LookMenu (pedidos *fora da
plataforma* iFood).

> Status: **MVP**. O fluxo de autenticação, solicitação de entrega, sincronização
> de status e webhook estão implementados de forma defensiva. Sem credenciais a
> UI mostra "desconectado" e nada quebra. Não há cobrança de plano (stub
> `canUseIfood` sempre retorna `true`).

## Visão geral do fluxo

1. **Autenticação** — OAuth2 `client_credentials`
   `POST https://merchant-api.ifood.com.br/authentication/v1.0/oauth/token`
   (form-urlencoded: `grantType`, `clientId`, `clientSecret`, opcional `refreshToken`).
   O token e a expiração são salvos por loja (`ifoodAccessToken`, `ifoodTokenExpiraEm`).
2. **Solicitar entregador** — `POST /shipping/v1.0/merchants/{merchantId}/orders`
   (somente pedidos `DELIVERY` com endereço de entrega).
3. **Status** — atualizado via webhook (`/api/webhooks/ifood/entrega`) e/ou
   sincronização sob demanda no KDS (`GET /shipping/v1.0/orders/{orderId}`).

Referências:
- https://developer.ifood.com.br/en-US/docs/guides/modules/shipping/outside
- https://developer.ifood.com.br/pt-BR/docs/guides/modules/authentication/intro

## Variáveis de ambiente

```env
IFOOD_CLIENT_ID=""
IFOOD_CLIENT_SECRET=""
IFOOD_API_URL="https://merchant-api.ifood.com.br"
IFOOD_WEBHOOK_SECRET="um-segredo-forte"
APP_URL="https://seu-dominio.com"   # usado em links de cliente
```

- `IFOOD_CLIENT_ID` / `IFOOD_CLIENT_SECRET`: credenciais da sua aplicação no
  Portal do Desenvolvedor iFood. **Ausentes ⇒ integração "desconectada"**.
- `IFOOD_API_URL`: base da Merchant API (raramente precisa mudar).
- `IFOOD_WEBHOOK_SECRET`: valida o webhook (header `x-ifood-webhook-secret` ou `?secret=`).

## Configuração no painel

1. Acesse **Painel → Configurações → iFood Entrega Fácil**.
2. Informe o **Merchant ID** (identificador da loja no iFood, do Portal do Parceiro).
3. Ative o toggle e clique em **Salvar**.
4. Clique em **Testar conexão** para validar a autenticação.

Por loja persistimos: `ifoodEntregaFacilAtivo`, `ifoodMerchantId`,
`ifoodAccessToken`, `ifoodRefreshToken`, `ifoodTokenExpiraEm`.

## Uso no KDS

Em pedidos **DELIVERY**, com a integração ativa, o card mostra:
- Botão **"Solicitar entregador iFood"** (quando ainda não solicitado).
- Badge com o status atual + botão de **sincronizar** (quando já solicitado).

Os pedidos guardam: `ifoodEntregaId`, `ifoodEntregaStatus`, `ifoodEntregaSolicitadaEm`.

## Webhook de status

`POST /api/webhooks/ifood/entrega`

- Autenticação: header `x-ifood-webhook-secret: <IFOOD_WEBHOOK_SECRET>` (ou `?secret=`).
- Casa o evento pelo `ifoodEntregaId` (campos aceitos: `orderId`, `id` ou `deliveryId`).
- Regra simples de status:
  - `DISPATCHED` / `GOING_TO_DESTINATION` / `ASSIGN_DRIVER` / `ARRIVED` → pedido `EM_ENTREGA`
  - `DELIVERED` / `CONCLUDED` / `COMPLETED` → pedido `CONCLUIDO`

Teste manual (PowerShell):

```powershell
curl -Method POST "http://localhost:3000/api/webhooks/ifood/entrega" `
  -Headers @{ "x-ifood-webhook-secret" = "um-segredo-forte"; "Content-Type" = "application/json" } `
  -Body '{ "orderId": "ID_DA_ENTREGA", "status": "DELIVERED" }'
```

## Limitações conhecidas (MVP)

- O corpo enviado em `POST /orders` é mínimo. A homologação real do iFood exige
  dados completos de origem/destino (lat/long, janela de entrega, etc.). Ajustar
  conforme o contrato e a homologação da conta.
- Não há *event polling* — dependemos do webhook + sincronização manual.
- Não há cobrança/gate de plano (stub `canUseIfood`).
- Sem fluxos de confirmação/alteração de endereço (`userConfirmAddress`,
  `deliveryAddressChangeRequest`).

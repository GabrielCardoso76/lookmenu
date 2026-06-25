import { prisma } from "@/lib/prisma"

/**
 * Integração com o iFood Entrega Fácil (API de Shipping — pedidos fora da plataforma).
 *
 * Docs: https://developer.ifood.com.br/en-US/docs/guides/modules/shipping/outside
 *
 * Fluxo (MVP):
 * - Autenticação OAuth2 (client_credentials) → token Bearer salvo por loja.
 * - Solicitar entregador: POST /shipping/v1.0/merchants/{merchantId}/orders
 * - Status: webhook + sync sob demanda.
 *
 * Defensivo: se as credenciais (IFOOD_CLIENT_ID / IFOOD_CLIENT_SECRET) ou o merchantId
 * estiverem ausentes, as funções retornam { ok: false, error } sem lançar exceções —
 * a UI mostra estado "desconectado".
 */

const IFOOD_API = (process.env.IFOOD_API_URL ?? "https://merchant-api.ifood.com.br").replace(/\/$/, "")
const TIMEOUT_MS = 10000

export type IfoodResult<T = unknown> = {
  ok: boolean
  error?: string
  data?: T
}

function credenciaisApp() {
  return {
    clientId: process.env.IFOOD_CLIENT_ID,
    clientSecret: process.env.IFOOD_CLIENT_SECRET,
  }
}

/** Indica se as credenciais de aplicação do iFood estão configuradas no ambiente. */
export function ifoodAppConfigurado(): boolean {
  const { clientId, clientSecret } = credenciaisApp()
  return Boolean(clientId && clientSecret)
}

type LojaIfood = {
  id: string
  ifoodEntregaFacilAtivo: boolean
  ifoodMerchantId: string | null
  ifoodAccessToken: string | null
  ifoodRefreshToken: string | null
  ifoodTokenExpiraEm: Date | null
}

async function carregarLoja(lojaId: string): Promise<LojaIfood | null> {
  return prisma.loja.findUnique({
    where: { id: lojaId },
    select: {
      id: true,
      ifoodEntregaFacilAtivo: true,
      ifoodMerchantId: true,
      ifoodAccessToken: true,
      ifoodRefreshToken: true,
      ifoodTokenExpiraEm: true,
    },
  })
}

/**
 * Garante um access_token válido para a loja, renovando via OAuth2 quando necessário.
 * Persiste o token e a expiração no registro da loja.
 */
export async function obterAccessTokenValido(loja: LojaIfood): Promise<IfoodResult<string>> {
  const { clientId, clientSecret } = credenciaisApp()
  if (!clientId || !clientSecret) {
    return { ok: false, error: "Credenciais do iFood não configuradas (IFOOD_CLIENT_ID / IFOOD_CLIENT_SECRET)." }
  }

  const agora = Date.now()
  if (loja.ifoodAccessToken && loja.ifoodTokenExpiraEm && loja.ifoodTokenExpiraEm.getTime() > agora + 60_000) {
    return { ok: true, data: loja.ifoodAccessToken }
  }

  const body = new URLSearchParams()
  body.set("clientId", clientId)
  body.set("clientSecret", clientSecret)
  if (loja.ifoodRefreshToken) {
    body.set("grantType", "refresh_token")
    body.set("refreshToken", loja.ifoodRefreshToken)
  } else {
    body.set("grantType", "client_credentials")
  }

  try {
    const res = await fetch(`${IFOOD_API}/authentication/v1.0/oauth/token`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })

    if (!res.ok) {
      const txt = await res.text()
      return { ok: false, error: `Falha na autenticação iFood (${res.status}): ${txt.slice(0, 200)}` }
    }

    const json = (await res.json()) as {
      accessToken?: string
      access_token?: string
      refreshToken?: string
      refresh_token?: string
      expiresIn?: number
      expires_in?: number
    }

    const accessToken = json.accessToken ?? json.access_token
    const refreshTokenNovo = json.refreshToken ?? json.refresh_token ?? loja.ifoodRefreshToken
    const expiresIn = json.expiresIn ?? json.expires_in ?? 3600

    if (!accessToken) {
      return { ok: false, error: "Resposta de autenticação do iFood sem access_token." }
    }

    const expiraEm = new Date(Date.now() + expiresIn * 1000)
    await prisma.loja.update({
      where: { id: loja.id },
      data: {
        ifoodAccessToken: accessToken,
        ifoodRefreshToken: refreshTokenNovo ?? null,
        ifoodTokenExpiraEm: expiraEm,
      },
    })

    return { ok: true, data: accessToken }
  } catch (err) {
    return { ok: false, error: `Erro de conexão com o iFood: ${(err as Error).message}` }
  }
}

/** Renova o token explicitamente (atalho usado pelo "Testar conexão"). */
export async function refreshToken(lojaId: string): Promise<IfoodResult<string>> {
  const loja = await carregarLoja(lojaId)
  if (!loja) return { ok: false, error: "Loja não encontrada." }
  return obterAccessTokenValido(loja)
}

/** Testa a conexão com o iFood (autenticação). */
export async function testarConexao(lojaId: string): Promise<IfoodResult> {
  const loja = await carregarLoja(lojaId)
  if (!loja) return { ok: false, error: "Loja não encontrada." }
  if (!loja.ifoodMerchantId) return { ok: false, error: "Informe o Merchant ID do iFood antes de testar." }
  const token = await obterAccessTokenValido(loja)
  if (!token.ok) return token
  return { ok: true }
}

/**
 * Solicita um entregador iFood para um pedido DELIVERY com endereço de entrega.
 * Idempotente: se já houver `ifoodEntregaId`, não solicita novamente.
 */
export async function solicitarEntrega(pedidoId: string): Promise<IfoodResult> {
  const pedido = await prisma.pedido.findUnique({
    where: { id: pedidoId },
    select: {
      id: true,
      lojaId: true,
      tipoEntrega: true,
      total: true,
      nomeCliente: true,
      ifoodEntregaId: true,
      enderecoEntrega: {
        select: { rua: true, numero: true, bairro: true, cidade: true, pontoReferencia: true },
      },
      cliente: { select: { telefone: true, nome: true } },
    },
  })

  if (!pedido) return { ok: false, error: "Pedido não encontrado." }
  if (pedido.ifoodEntregaId) {
    return { ok: true, data: { ifoodEntregaId: pedido.ifoodEntregaId, jaSolicitado: true } }
  }
  if (pedido.tipoEntrega !== "DELIVERY") {
    return { ok: false, error: "iFood Entrega Fácil é apenas para pedidos delivery." }
  }
  if (!pedido.enderecoEntrega) {
    return { ok: false, error: "Pedido sem endereço de entrega." }
  }

  const loja = await carregarLoja(pedido.lojaId)
  if (!loja) return { ok: false, error: "Loja não encontrada." }
  if (!loja.ifoodEntregaFacilAtivo) {
    return { ok: false, error: "iFood Entrega Fácil não está ativo para esta loja." }
  }
  if (!loja.ifoodMerchantId) {
    return { ok: false, error: "Merchant ID do iFood não configurado." }
  }

  const tokenRes = await obterAccessTokenValido(loja)
  if (!tokenRes.ok || !tokenRes.data) return { ok: false, error: tokenRes.error ?? "Sem token de acesso." }

  const e = pedido.enderecoEntrega
  const payload = {
    externalOrderId: pedido.id,
    customer: {
      name: pedido.cliente?.nome ?? pedido.nomeCliente ?? "Cliente",
      phone: pedido.cliente?.telefone ?? undefined,
    },
    deliveryAddress: {
      streetName: e.rua,
      streetNumber: e.numero,
      neighborhood: e.bairro,
      city: e.cidade,
      reference: e.pontoReferencia ?? undefined,
    },
    orderAmount: Number(pedido.total),
  }

  try {
    const res = await fetch(`${IFOOD_API}/shipping/v1.0/merchants/${loja.ifoodMerchantId}/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenRes.data}`,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })

    if (!res.ok) {
      const txt = await res.text()
      return { ok: false, error: `iFood recusou a solicitação (${res.status}): ${txt.slice(0, 300)}` }
    }

    const json = (await res.json()) as { id?: string; orderId?: string; status?: string }
    const ifoodEntregaId = json.id ?? json.orderId ?? null
    const status = json.status ?? "REQUESTED"

    await prisma.pedido.update({
      where: { id: pedido.id },
      data: {
        ifoodEntregaId,
        ifoodEntregaStatus: status,
        ifoodEntregaSolicitadaEm: new Date(),
      },
    })

    return { ok: true, data: { ifoodEntregaId, status } }
  } catch (err) {
    return { ok: false, error: `Erro de conexão com o iFood: ${(err as Error).message}` }
  }
}

/** Consulta o status atual da entrega no iFood e atualiza o pedido. */
export async function syncStatus(pedidoId: string): Promise<IfoodResult<{ status: string | null }>> {
  const pedido = await prisma.pedido.findUnique({
    where: { id: pedidoId },
    select: { id: true, lojaId: true, ifoodEntregaId: true },
  })
  if (!pedido) return { ok: false, error: "Pedido não encontrado." }
  if (!pedido.ifoodEntregaId) return { ok: false, error: "Pedido sem entrega iFood solicitada." }

  const loja = await carregarLoja(pedido.lojaId)
  if (!loja) return { ok: false, error: "Loja não encontrada." }

  const tokenRes = await obterAccessTokenValido(loja)
  if (!tokenRes.ok || !tokenRes.data) return { ok: false, error: tokenRes.error ?? "Sem token de acesso." }

  try {
    const res = await fetch(`${IFOOD_API}/shipping/v1.0/orders/${pedido.ifoodEntregaId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokenRes.data}`,
        accept: "application/json",
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })

    if (!res.ok) {
      const txt = await res.text()
      return { ok: false, error: `Não foi possível consultar status (${res.status}): ${txt.slice(0, 200)}` }
    }

    const json = (await res.json()) as { status?: string }
    const status = json.status ?? null

    if (status) {
      await prisma.pedido.update({
        where: { id: pedido.id },
        data: { ifoodEntregaStatus: status },
      })
    }

    return { ok: true, data: { status } }
  } catch (err) {
    return { ok: false, error: `Erro de conexão com o iFood: ${(err as Error).message}` }
  }
}

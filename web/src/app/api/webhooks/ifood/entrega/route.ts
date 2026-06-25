import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

/**
 * Webhook do iFood Entrega Fácil — recebe atualizações de status da entrega.
 *
 * Autenticação (MVP): compara o segredo enviado no header `x-ifood-webhook-secret`
 * (ou query `?secret=`) com IFOOD_WEBHOOK_SECRET.
 *
 * Regra de status (simples):
 * - DISPATCHED / GOING_TO_DESTINATION / ASSIGN_DRIVER / ARRIVED  → pedido EM_ENTREGA
 * - DELIVERED / CONCLUDED / COMPLETED                            → pedido CONCLUIDO
 */

const STATUS_EM_ENTREGA = ["DISPATCHED", "GOING_TO_DESTINATION", "ASSIGN_DRIVER", "ARRIVED", "ARRIVED_AT_DESTINATION"]
const STATUS_CONCLUIDO = ["DELIVERED", "CONCLUDED", "COMPLETED"]

export async function POST(req: NextRequest) {
  const secret = process.env.IFOOD_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ error: "IFOOD_WEBHOOK_SECRET não configurado." }, { status: 500 })
  }

  const enviado = req.headers.get("x-ifood-webhook-secret") ?? req.nextUrl.searchParams.get("secret")
  if (enviado !== secret) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 })
  }

  // Aceita diferentes formatos de payload
  const entregaId =
    (body.orderId as string | undefined) ??
    (body.id as string | undefined) ??
    (body.deliveryId as string | undefined)
  const statusRaw =
    (body.status as string | undefined) ??
    (body.fullCode as string | undefined) ??
    (body.code as string | undefined)

  if (!entregaId) {
    return NextResponse.json({ error: "Identificador da entrega ausente." }, { status: 400 })
  }

  const pedido = await prisma.pedido.findFirst({
    where: { ifoodEntregaId: entregaId },
    select: { id: true, estadoPedido: true },
  })

  if (!pedido) {
    // 200 para o iFood não reenviar indefinidamente um evento de pedido desconhecido.
    return NextResponse.json({ ok: true, ignored: true })
  }

  const status = (statusRaw ?? "").toUpperCase()
  const data: { ifoodEntregaStatus: string | null; estadoPedido?: "EM_ENTREGA" | "CONCLUIDO" } = {
    ifoodEntregaStatus: statusRaw ?? pedido.estadoPedido,
  }

  if (STATUS_CONCLUIDO.includes(status) && pedido.estadoPedido !== "CANCELADO") {
    data.estadoPedido = "CONCLUIDO"
  } else if (STATUS_EM_ENTREGA.includes(status) && pedido.estadoPedido !== "CANCELADO") {
    data.estadoPedido = "EM_ENTREGA"
  }

  await prisma.pedido.update({ where: { id: pedido.id }, data })

  return NextResponse.json({ ok: true })
}

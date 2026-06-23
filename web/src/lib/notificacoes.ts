import { prisma } from "@/lib/prisma"

// ─── Evolution API helpers ─────────────────────────────────────────────────────

function evolutionConfig() {
  const url = process.env.EVOLUTION_API_URL?.replace(/\/$/, "")
  const key = process.env.EVOLUTION_API_KEY
  const instance = process.env.EVOLUTION_INSTANCE
  return { url, key, instance }
}

export async function enviarMensagemWhatsApp(telefone: string, texto: string): Promise<void> {
  const { url, key, instance } = evolutionConfig()
  if (!url || !key || !instance) {
    console.warn("[notificacoes] Evolution API não configurada (EVOLUTION_API_URL/KEY/INSTANCE ausentes).")
    return
  }

  // Normalizar para E.164 sem o "+" (Evolution API aceita DDD+número com código país)
  const numero = telefone.replace(/\D/g, "")

  try {
    const res = await fetch(`${url}/message/sendText/${instance}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
      },
      body: JSON.stringify({ number: numero, text: texto }),
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) {
      const body = await res.text()
      console.error("[notificacoes] Falha ao enviar WhatsApp:", res.status, body)
    }
  } catch (err) {
    console.error("[notificacoes] Erro ao chamar Evolution API:", err)
  }
}

// ─── Construção das mensagens ──────────────────────────────────────────────────

type EstadoPedido = "NOVO" | "EM_PREPARACAO" | "PRONTO" | "EM_ENTREGA" | "CONCLUIDO"

function buildMensagemCriado(params: {
  nomeCliente: string
  pedidoCurto: string
  nomeLoja: string
  itensSummary: string
  tipoEntrega: string
  totalFormatado: string
}): string {
  const tipoLabel: Record<string, string> = {
    DELIVERY: "delivery 🛵",
    RETIRADA_BALCAO: "retirada no balcão",
    SALAO_MESA: "mesa",
  }
  return [
    `*${params.nomeLoja}* — Pedido confirmado! 🎉`,
    ``,
    `Olá, *${params.nomeCliente}*!`,
    `Recebemos seu pedido *#${params.pedidoCurto}*.`,
    ``,
    `📋 *Itens:*`,
    params.itensSummary,
    ``,
    `💰 *Total:* ${params.totalFormatado}`,
    `📦 *Tipo:* ${tipoLabel[params.tipoEntrega] ?? params.tipoEntrega}`,
    ``,
    `Em breve você receberá uma atualização do status. Obrigado! 🙏`,
  ].join("\n")
}

function buildMensagemStatus(params: {
  nomeCliente: string
  pedidoCurto: string
  nomeLoja: string
  estado: EstadoPedido
  tipoEntrega: string
}): string | null {
  const { estado, tipoEntrega } = params

  const mensagens: Partial<Record<EstadoPedido, string>> = {
    EM_PREPARACAO: `*${params.nomeLoja}* — Seu pedido *#${params.pedidoCurto}* está sendo preparado! 👨‍🍳\n\nOlá, *${params.nomeCliente}*! A cozinha já está trabalhando no seu pedido. 🔥`,
    PRONTO: tipoEntrega === "DELIVERY"
      ? `*${params.nomeLoja}* — Seu pedido *#${params.pedidoCurto}* está pronto! ✅\n\nOlá, *${params.nomeCliente}*! Seu pedido saiu da cozinha e em breve será entregue. 📦`
      : tipoEntrega === "RETIRADA_BALCAO"
        ? `*${params.nomeLoja}* — Seu pedido *#${params.pedidoCurto}* está pronto para retirada! ✅\n\nOlá, *${params.nomeCliente}*! Pode vir buscar no balcão. 😊`
        : `*${params.nomeLoja}* — Pedido *#${params.pedidoCurto}* pronto! ✅\n\nOlá, *${params.nomeCliente}*! Os itens estão prontos.`,
    EM_ENTREGA: `*${params.nomeLoja}* — Seu pedido *#${params.pedidoCurto}* saiu para entrega! 🛵\n\nOlá, *${params.nomeCliente}*! O entregador está a caminho. Fique de olho!`,
    CONCLUIDO: `*${params.nomeLoja}* — Pedido *#${params.pedidoCurto}* concluído! 🙏\n\nObrigado pela preferência, *${params.nomeCliente}*! Esperamos te ver em breve. ⭐`,
  }

  return mensagens[estado] ?? null
}

// ─── Entry point ──────────────────────────────────────────────────────────────

export async function notificarClientePedido(
  evento: "CRIADO" | "STATUS",
  pedidoId: string,
): Promise<void> {
  if (process.env.WHATSAPP_ENABLED !== "true") return

  let pedido: {
    id: string
    estadoPedido: string
    tipoEntrega: string
    total: import("@prisma/client").Prisma.Decimal
    nomeCliente: string | null
    cliente: { telefone: string; nome: string | null } | null
    loja: { nome: string; slug: string }
    itens: { quantidade: number; produto: { nome: string } }[]
  } | null

  try {
    pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      select: {
        id: true,
        estadoPedido: true,
        tipoEntrega: true,
        total: true,
        nomeCliente: true,
        cliente: { select: { telefone: true, nome: true } },
        loja: { select: { nome: true, slug: true } },
        itens: {
          select: {
            quantidade: true,
            produto: { select: { nome: true } },
          },
          take: 5,
        },
      },
    })
  } catch (err) {
    console.error("[notificacoes] Erro ao buscar pedido:", err)
    return
  }

  if (!pedido) return

  // Pedidos de mesa sem cliente cadastrado → sem telefone, pular silenciosamente
  const telefone = pedido.cliente?.telefone
  if (!telefone) return

  const nomeCliente = pedido.cliente?.nome ?? pedido.nomeCliente ?? "Cliente"
  const pedidoCurto = pedido.id.slice(-6).toUpperCase()
  const totalFormatado = Number(pedido.total).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
  const itensSummary = pedido.itens
    .map((i) => `  • ${i.quantidade}× ${i.produto.nome}`)
    .join("\n")

  let texto: string | null = null

  if (evento === "CRIADO") {
    texto = buildMensagemCriado({
      nomeCliente,
      pedidoCurto,
      nomeLoja: pedido.loja.nome,
      itensSummary,
      tipoEntrega: pedido.tipoEntrega,
      totalFormatado,
    })
  } else {
    texto = buildMensagemStatus({
      nomeCliente,
      pedidoCurto,
      nomeLoja: pedido.loja.nome,
      estado: pedido.estadoPedido as EstadoPedido,
      tipoEntrega: pedido.tipoEntrega,
    })
  }

  if (!texto) return

  await enviarMensagemWhatsApp(telefone, texto)
}

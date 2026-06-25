import { prisma } from "@/lib/prisma"
import { enviarMensagemWhatsApp } from "@/lib/notificacoes"

export type RecuperacaoResultado = {
  /** Carrinhos avaliados nesta execução. */
  candidatos: number
  /** Mensagens de recuperação efetivamente enviadas. */
  enviados: number
  /** Carrinhos pulados (ainda dentro do tempo de espera ou já tratados). */
  pulados: number
}

/**
 * Processa carrinhos abandonados pendentes e dispara mensagens de recuperação via WhatsApp.
 *
 * Regras:
 * - Apenas carrinhos com telefone, sem recuperação enviada e sem recuperação concluída.
 * - Ociosos há mais de `loja.recuperadorMinutos`.
 * - Criados nas últimas 24h (não incomodar com carrinhos antigos).
 * - Loja com `recuperadorAtivo = true`.
 * - Só roda se `WHATSAPP_ENABLED = "true"`.
 *
 * Idempotente: marca `recuperacaoEnviadaEm` antes de enviar, evitando duplicidade em
 * execuções concorrentes/repetidas.
 */
export async function processarRecuperacoesPendentes(): Promise<RecuperacaoResultado> {
  if (process.env.WHATSAPP_ENABLED !== "true") {
    return { candidatos: 0, enviados: 0, pulados: 0 }
  }

  const agora = new Date()
  const limite24h = new Date(agora.getTime() - 24 * 60 * 60 * 1000)

  const candidatos = await prisma.carrinhoAbandonado.findMany({
    where: {
      recuperacaoEnviadaEm: null,
      recuperadoEm: null,
      telefone: { not: null },
      criadoEm: { gte: limite24h },
      loja: { recuperadorAtivo: true },
    },
    select: {
      id: true,
      telefone: true,
      nomeCliente: true,
      subtotal: true,
      atualizadoEm: true,
      loja: { select: { nome: true, slug: true, recuperadorMinutos: true } },
    },
    take: 100,
  })

  const appUrl = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "")
  let enviados = 0
  let pulados = 0

  for (const c of candidatos) {
    const idleMs = agora.getTime() - c.atualizadoEm.getTime()
    if (!c.telefone || idleMs < c.loja.recuperadorMinutos * 60 * 1000) {
      pulados++
      continue
    }

    // Idempotência: tenta "reservar" o envio antes de chamar a API externa.
    const reserva = await prisma.carrinhoAbandonado.updateMany({
      where: { id: c.id, recuperacaoEnviadaEm: null, recuperadoEm: null },
      data: { recuperacaoEnviadaEm: agora },
    })
    if (reserva.count === 0) {
      pulados++
      continue
    }

    const nome = c.nomeCliente?.trim() || "tudo bem"
    const subtotalFmt = Number(c.subtotal).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
    const link = `${appUrl}/${c.loja.slug}/checkout`
    const texto = [
      `Oi, ${nome}! 👋`,
      ``,
      `Vimos que você deixou um pedido pela metade na *${c.loja.nome}*.`,
      `Seu carrinho está guardado (${subtotalFmt}) — é só finalizar por aqui:`,
      ``,
      link,
      ``,
      `Estamos te esperando! 🍔`,
    ].join("\n")

    await enviarMensagemWhatsApp(c.telefone, texto)
    enviados++
  }

  return { candidatos: candidatos.length, enviados, pulados }
}

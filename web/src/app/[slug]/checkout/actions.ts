"use server"

import { redirect } from "next/navigation"

import { prisma } from "@/lib/prisma"
import { lojaEstaAberta, calcularTotaisPedido } from "@/lib/loja-config"
import { notificarClientePedido } from "@/lib/notificacoes"
import { ajustarEstoque } from "@/lib/estoque"

export type CheckoutState = {
  error?: string
}

export type ItemCheckout = {
  produtoId: string
  quantidade: number
  precoUnitario: number
  nome: string
}

export type ItemCarrinhoAbandonado = {
  id: string
  nome: string
  preco: number
  quantidade: number
}

/**
 * Registra/atualiza um carrinho abandonado para a loja, indexado por telefone.
 * Fire-and-forget: chamado do checkout enquanto o cliente preenche os dados.
 * Nunca lança — falhas são silenciosas para não atrapalhar o checkout.
 */
export async function registrarCarrinhoAbandonadoAction(
  slug: string,
  telefone: string,
  nomeCliente: string,
  items: ItemCarrinhoAbandonado[],
): Promise<void> {
  try {
    const telefoneDigits = (telefone ?? "").replace(/\D/g, "")
    if (telefoneDigits.length < 10) return
    if (!Array.isArray(items) || items.length === 0) return

    const loja = await prisma.loja.findFirst({
      where: { slug, ativa: true },
      select: { id: true, recuperadorAtivo: true },
    })
    if (!loja || !loja.recuperadorAtivo) return

    const subtotal = items.reduce((s, i) => s + i.preco * i.quantidade, 0)
    const nome = nomeCliente.trim() || null

    await prisma.carrinhoAbandonado.upsert({
      where: { lojaId_telefone: { lojaId: loja.id, telefone: telefoneDigits } },
      create: {
        lojaId: loja.id,
        telefone: telefoneDigits,
        nomeCliente: nome,
        itensJson: items,
        subtotal,
      },
      update: {
        nomeCliente: nome,
        itensJson: items,
        subtotal,
      },
    })
  } catch {
    // silencioso
  }
}

export type ValidarCupomResult = {
  desconto?: number
  cupomId?: string
  codigo?: string
  mensagem?: string
  error?: string
}

/**
 * Valida um cupom para a loja/slug e subtotal informados.
 * Retorna o desconto calculado ou um erro descritivo.
 * Não incrementa usosAtuais — isso ocorre apenas ao criar o pedido.
 */
export async function validarCupomAction(
  slug: string,
  codigo: string,
  subtotal: number,
): Promise<ValidarCupomResult> {
  if (!codigo.trim()) return { error: "Informe um código de cupom." }

  const loja = await prisma.loja.findFirst({
    where: { slug, ativa: true },
    select: { id: true },
  })
  if (!loja) return { error: "Loja não encontrada." }

  const cupom = await prisma.cupom.findFirst({
    where: { lojaId: loja.id, codigo: codigo.trim().toUpperCase() },
  })

  if (!cupom) return { error: "Cupom inválido." }
  if (!cupom.ativo) return { error: "Este cupom está inativo." }

  const agora = new Date()
  if (cupom.validoDe && agora < cupom.validoDe) {
    return { error: "Este cupom ainda não é válido." }
  }
  if (cupom.validoAte && agora > cupom.validoAte) {
    return { error: "Este cupom expirou." }
  }
  if (cupom.maxUsos != null && cupom.usosAtuais >= cupom.maxUsos) {
    return { error: "Este cupom atingiu o limite de usos." }
  }
  if (cupom.pedidoMinimo != null && subtotal < Number(cupom.pedidoMinimo)) {
    return {
      error: `Pedido mínimo para este cupom: R$ ${Number(cupom.pedidoMinimo).toFixed(2).replace(".", ",")}.`,
    }
  }

  let desconto: number
  if (cupom.tipo === "PERCENTUAL") {
    desconto = Math.min(subtotal, (subtotal * Number(cupom.valor)) / 100)
  } else {
    desconto = Math.min(subtotal, Number(cupom.valor))
  }
  desconto = Math.round(desconto * 100) / 100

  const mensagem =
    cupom.tipo === "PERCENTUAL"
      ? `${Number(cupom.valor)}% de desconto aplicado`
      : `R$ ${desconto.toFixed(2).replace(".", ",")} de desconto aplicado`

  return { desconto, cupomId: cupom.id, codigo: cupom.codigo, mensagem }
}

export async function criarPedidoAction(
  slug: string,
  itens: ItemCheckout[],
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const loja = await prisma.loja.findFirst({
    where: { slug, ativa: true },
    select: {
      id: true,
      aceitaPixSite: true,
      aceitaCartaoEntrega: true,
      aceitaDinheiroEntrega: true,
      pagamentoNoSite: true,
      timezone: true,
      pedidoMinimo: true,
      taxaEntregaFixa: true,
      freteGratisAcima: true,
      horarios: { select: { diaSemana: true, abreAs: true, fechaAs: true, fechado: true } },
    },
  })

  if (!loja) {
    return { error: "Loja não encontrada." }
  }

  const statusLoja = lojaEstaAberta({ timezone: loja.timezone, horarios: loja.horarios })
  if (!statusLoja.aberta) {
    return { error: `Não é possível fazer pedidos agora. ${statusLoja.mensagem}` }
  }

  if (!itens || itens.length === 0) {
    return { error: "O carrinho está vazio." }
  }

  const nome = String(formData.get("nome") ?? "").trim()
  const telefone = String(formData.get("telefone") ?? "").trim()
  const tipoEntrega = String(formData.get("tipoEntrega") ?? "") as "DELIVERY" | "RETIRADA_BALCAO"
  const metodoPagamento = String(formData.get("metodoPagamento") ?? "") as "PIX_ONLINE" | "DINHEIRO_ENTREGA" | "CARTAO_ENTREGA"

  if (!nome || !telefone || !tipoEntrega || !metodoPagamento) {
    return { error: "Preencha todos os campos obrigatórios." }
  }

  const telefoneDigits = telefone.replace(/\D/g, "")
  if (telefoneDigits.length < 10) {
    return { error: "Telefone inválido." }
  }

  // Upsert cliente por telefone
  const cliente = await prisma.cliente.upsert({
    where: { telefone: telefoneDigits },
    update: { nome },
    create: { telefone: telefoneDigits, nome },
  })

  // Endereço de entrega
  let enderecoId: string | null = null
  if (tipoEntrega === "DELIVERY") {
    const rua = String(formData.get("rua") ?? "").trim()
    const numero = String(formData.get("numero") ?? "").trim()
    const bairro = String(formData.get("bairro") ?? "").trim()
    const cidade = String(formData.get("cidade") ?? "").trim()
    const pontoReferencia = String(formData.get("pontoReferencia") ?? "").trim() || null

    if (!rua || !numero || !bairro || !cidade) {
      return { error: "Preencha o endereço de entrega." }
    }

    const endereco = await prisma.endereco.create({
      data: { clienteId: cliente.id, rua, numero, bairro, cidade, pontoReferencia },
    })
    enderecoId = endereco.id
  }

  // Verificar produtos e calcular total
  const produtoIds = itens.map((i) => i.produtoId)
  const produtos = await prisma.produto.findMany({
    where: { id: { in: produtoIds }, lojaId: loja.id, disponivel: true },
    select: { id: true, preco: true, controlaEstoque: true },
  })

  if (produtos.length !== produtoIds.length) {
    return { error: "Algum produto não está disponível." }
  }

  const precoMap = new Map(produtos.map((p) => [p.id, Number(p.preco)]))
  const subtotalCalculado = itens.reduce((s, i) => {
    const preco = precoMap.get(i.produtoId) ?? i.precoUnitario
    return s + preco * i.quantidade
  }, 0)

  if (
    tipoEntrega === "DELIVERY" &&
    loja.pedidoMinimo != null &&
    subtotalCalculado < Number(loja.pedidoMinimo)
  ) {
    return {
      error: `Pedido mínimo para delivery é R$ ${Number(loja.pedidoMinimo).toFixed(2).replace(".", ",")}.`,
    }
  }

  // Revalidar cupom server-side (nunca confiar no cliente)
  const cupomCodigo = String(formData.get("cupomCodigo") ?? "").trim().toUpperCase()
  let descontoFinal = 0
  let cupomIdFinal: string | null = null

  if (cupomCodigo) {
    const resultCupom = await validarCupomAction(slug, cupomCodigo, subtotalCalculado)
    if (resultCupom.error) {
      return { error: `Cupom inválido: ${resultCupom.error}` }
    }
    descontoFinal = resultCupom.desconto ?? 0
    cupomIdFinal = resultCupom.cupomId ?? null
  }

  const totais = calcularTotaisPedido({
    subtotal: subtotalCalculado,
    tipoEntrega,
    pedidoMinimo: loja.pedidoMinimo ? Number(loja.pedidoMinimo) : null,
    taxaEntregaFixa: loja.taxaEntregaFixa ? Number(loja.taxaEntregaFixa) : null,
    freteGratisAcima: loja.freteGratisAcima ? Number(loja.freteGratisAcima) : null,
    desconto: descontoFinal,
  })

  const total = totais.total

  // Validar método contra config da loja
  const metodosPermitidos: string[] = []
  if (loja.aceitaPixSite && loja.pagamentoNoSite) metodosPermitidos.push("PIX_ONLINE")
  if (loja.aceitaDinheiroEntrega && !loja.pagamentoNoSite) metodosPermitidos.push("DINHEIRO_ENTREGA")
  if (loja.aceitaCartaoEntrega && !loja.pagamentoNoSite) metodosPermitidos.push("CARTAO_ENTREGA")

  if (metodosPermitidos.length > 0 && !metodosPermitidos.includes(metodoPagamento)) {
    return { error: "Método de pagamento não aceito por esta loja." }
  }

  // PIX simulado → PAGO imediatamente; demais → PENDENTE
  const estadoPagamento = metodoPagamento === "PIX_ONLINE" ? "PAGO" : "PENDENTE"

  // Criar pedido + incrementar usosAtuais em transação atômica
  const pedido = await prisma.$transaction(async (tx) => {
    const p = await tx.pedido.create({
      data: {
        lojaId: loja.id,
        clienteId: cliente.id,
        estadoPedido: "NOVO",
        tipoEntrega: tipoEntrega,
        enderecoEntregaId: enderecoId,
        subtotal: totais.subtotal,
        taxaEntrega: totais.taxaEntrega,
        desconto: totais.desconto > 0 ? totais.desconto : null,
        cupomId: cupomIdFinal,
        total,
        estadoPagamento,
        metodoPagamento,
        nomeCliente: nome,
        itens: {
          create: itens.map((item) => ({
            produtoId: item.produtoId,
            quantidade: item.quantidade,
            precoUnitario: precoMap.get(item.produtoId) ?? item.precoUnitario,
          })),
        },
      },
    })

    if (cupomIdFinal) {
      await tx.cupom.update({
        where: { id: cupomIdFinal },
        data: { usosAtuais: { increment: 1 } },
      })
    }

    for (const item of itens) {
      const produto = produtos.find((pr) => pr.id === item.produtoId)
      if (produto?.controlaEstoque) {
        await ajustarEstoque(tx, {
          produtoId: item.produtoId,
          lojaId: loja.id,
          delta: item.quantidade,
          tipo: "VENDA",
          pedidoId: p.id,
        })
      }
    }

    return p
  })

  // Marca carrinho abandonado como recuperado (se houver um aberto para este telefone)
  try {
    await prisma.carrinhoAbandonado.updateMany({
      where: { lojaId: loja.id, telefone: telefoneDigits, recuperadoEm: null },
      data: { recuperadoEm: new Date(), pedidoRecuperadoId: pedido.id },
    })
  } catch {
    // não bloquear o pedido por causa do recuperador
  }

  void notificarClientePedido("CRIADO", pedido.id)

  redirect(`/${slug}/pedido/${pedido.id}`)
}

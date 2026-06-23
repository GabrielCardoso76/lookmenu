"use server"

import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"

import { prisma } from "@/lib/prisma"
import { createAtendimentoSession, destroyAtendimentoSession } from "@/lib/atendimento-session"
import { notificarClientePedido } from "@/lib/notificacoes"

export type AtendimentoLoginState = {
  error?: string
}

export async function loginFuncionarioAction(
  slug: string,
  _prev: AtendimentoLoginState,
  formData: FormData,
): Promise<AtendimentoLoginState> {
  const funcionarioId = String(formData.get("funcionarioId") ?? "").trim()
  const pin = String(formData.get("pin") ?? "").trim()

  if (!funcionarioId || !pin) {
    return { error: "Selecione um funcionário e informe o PIN." }
  }

  const loja = await prisma.loja.findFirst({
    where: { slug, ativa: true },
    select: { id: true, slug: true },
  })

  if (!loja) return { error: "Loja não encontrada." }

  const funcionario = await prisma.funcionario.findFirst({
    where: { id: funcionarioId, lojaId: loja.id, ativo: true },
  })

  if (!funcionario) return { error: "Funcionário não encontrado." }

  const pinValido = await bcrypt.compare(pin, funcionario.pin)
  if (!pinValido) return { error: "PIN incorreto." }

  await createAtendimentoSession({
    funcionarioId: funcionario.id,
    funcionarioNome: funcionario.nome,
    lojaId: loja.id,
    lojaSlug: slug,
  })

  redirect(`/${slug}/atendimento/mesas`)
}

export async function logoutFuncionarioAction(slug: string) {
  await destroyAtendimentoSession()
  redirect(`/${slug}/atendimento`)
}

export type PedidoMesaState = {
  error?: string
  pedidoId?: string
}

export type ItemMesa = {
  produtoId: string
  quantidade: number
  precoUnitario: number
  observacao?: string
}

export async function criarPedidoMesaAction(
  slug: string,
  mesaId: string,
  funcionarioId: string,
  itens: ItemMesa[],
  metodoPagamentoParam: "DINHEIRO_ENTREGA" | "CARTAO_ENTREGA" | null,
  _prev: PedidoMesaState,
  _formData: FormData,
): Promise<PedidoMesaState> {
  if (!itens || itens.length === 0) {
    return { error: "Adicione ao menos um item ao pedido." }
  }

  const loja = await prisma.loja.findFirst({
    where: { slug, ativa: true },
    select: {
      id: true,
      aceitaCartaoEntrega: true,
      aceitaDinheiroEntrega: true,
      pagamentoNaMesa: true,
    },
  })
  if (!loja) return { error: "Loja não encontrada." }

  const mesa = await prisma.mesa.findFirst({
    where: { id: mesaId, lojaId: loja.id, ativa: true },
  })
  if (!mesa) return { error: "Mesa não encontrada ou inativa." }

  const funcionario = await prisma.funcionario.findFirst({
    where: { id: funcionarioId, lojaId: loja.id, ativo: true },
  })
  if (!funcionario) return { error: "Funcionário inválido." }

  const produtoIds = itens.map((i) => i.produtoId)
  const produtos = await prisma.produto.findMany({
    where: { id: { in: produtoIds }, lojaId: loja.id, disponivel: true },
    select: { id: true, preco: true },
  })

  if (produtos.length !== produtoIds.length) {
    return { error: "Algum produto não está disponível." }
  }

  const precoMap = new Map(produtos.map((p) => [p.id, Number(p.preco)]))
  const totalNovos = itens.reduce((s, i) => s + (precoMap.get(i.produtoId) ?? i.precoUnitario) * i.quantidade, 0)

  // Determinar método de pagamento conforme config da loja
  let metodoPagamento: "DINHEIRO_ENTREGA" | "CARTAO_ENTREGA"
  if (!loja.pagamentoNaMesa) {
    metodoPagamento = "DINHEIRO_ENTREGA"
  } else if (metodoPagamentoParam === "CARTAO_ENTREGA" && loja.aceitaCartaoEntrega) {
    metodoPagamento = "CARTAO_ENTREGA"
  } else {
    metodoPagamento = "DINHEIRO_ENTREGA"
  }

  // Verificar se já existe comanda aberta para esta mesa
  const pedidoAberto = await prisma.pedido.findFirst({
    where: {
      mesaId: mesa.id,
      lojaId: loja.id,
      tipoEntrega: "SALAO_MESA",
      estadoPedido: { notIn: ["CONCLUIDO", "CANCELADO"] },
    },
    select: { id: true, total: true },
  })

  let pedidoId: string

  if (pedidoAberto) {
    // Acumular itens na comanda existente
    await prisma.itemPedido.createMany({
      data: itens.map((item) => ({
        pedidoId: pedidoAberto.id,
        produtoId: item.produtoId,
        quantidade: item.quantidade,
        precoUnitario: precoMap.get(item.produtoId) ?? item.precoUnitario,
        observacao: item.observacao || null,
      })),
    })
    await prisma.pedido.update({
      where: { id: pedidoAberto.id },
      data: { total: Number(pedidoAberto.total) + totalNovos },
    })
    pedidoId = pedidoAberto.id
  } else {
    // Criar nova comanda
    const pedido = await prisma.pedido.create({
      data: {
        lojaId: loja.id,
        estadoPedido: "NOVO",
        tipoEntrega: "SALAO_MESA",
        total: totalNovos,
        estadoPagamento: "PENDENTE",
        metodoPagamento,
        mesaId: mesa.id,
        funcionarioId: funcionario.id,
        nomeCliente: `Mesa ${mesa.numero}`,
        itens: {
          create: itens.map((item) => ({
            produtoId: item.produtoId,
            quantidade: item.quantidade,
            precoUnitario: precoMap.get(item.produtoId) ?? item.precoUnitario,
            observacao: item.observacao || null,
          })),
        },
      },
    })
    pedidoId = pedido.id
  }

  await notificarClientePedido("CRIADO", pedidoId)

  redirect(`/${slug}/atendimento/mesas?pedido=${pedidoId}&mesa=${mesa.numero}`)
}

// ─── Fechar Conta ─────────────────────────────────────────────────────────────

export type FecharContaState = {
  error?: string
}

export async function fecharContaMesaAction(
  slug: string,
  mesaId: string,
  metodoPagamento: "DINHEIRO_ENTREGA" | "CARTAO_ENTREGA",
  _prev: FecharContaState,
  _formData: FormData,
): Promise<FecharContaState> {
  const loja = await prisma.loja.findFirst({
    where: { slug, ativa: true },
    select: {
      id: true,
      aceitaCartaoEntrega: true,
      aceitaDinheiroEntrega: true,
      pagamentoNaMesa: true,
    },
  })
  if (!loja) return { error: "Loja não encontrada." }

  if (metodoPagamento === "CARTAO_ENTREGA" && !loja.aceitaCartaoEntrega) {
    return { error: "Pagamento em cartão não habilitado para esta loja." }
  }
  if (metodoPagamento === "DINHEIRO_ENTREGA" && !loja.aceitaDinheiroEntrega) {
    return { error: "Pagamento em dinheiro não habilitado para esta loja." }
  }

  const mesa = await prisma.mesa.findFirst({
    where: { id: mesaId, lojaId: loja.id, ativa: true },
  })
  if (!mesa) return { error: "Mesa não encontrada." }

  const pedidoAberto = await prisma.pedido.findFirst({
    where: {
      mesaId: mesa.id,
      lojaId: loja.id,
      tipoEntrega: "SALAO_MESA",
      estadoPedido: { notIn: ["CONCLUIDO", "CANCELADO"] },
    },
  })
  if (!pedidoAberto) return { error: "Nenhuma comanda aberta para esta mesa." }

  await prisma.pedido.update({
    where: { id: pedidoAberto.id },
    data: {
      estadoPedido: "CONCLUIDO",
      estadoPagamento: "PAGO",
      metodoPagamento,
    },
  })

  await notificarClientePedido("STATUS", pedidoAberto.id)

  redirect(`/${slug}/atendimento/mesas?fechou=${mesa.numero}`)
}

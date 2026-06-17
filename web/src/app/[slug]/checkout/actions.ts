"use server"

import { redirect } from "next/navigation"

import { prisma } from "@/lib/prisma"

export type CheckoutState = {
  error?: string
}

export type ItemCheckout = {
  produtoId: string
  quantidade: number
  precoUnitario: number
  nome: string
}

export async function criarPedidoAction(
  slug: string,
  itens: ItemCheckout[],
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const loja = await prisma.loja.findFirst({
    where: { slug, ativa: true },
    select: { id: true },
  })

  if (!loja) {
    return { error: "Loja não encontrada." }
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
    select: { id: true, preco: true },
  })

  if (produtos.length !== produtoIds.length) {
    return { error: "Algum produto não está disponível." }
  }

  const precoMap = new Map(produtos.map((p) => [p.id, Number(p.preco)]))
  const total = itens.reduce((s, i) => {
    const preco = precoMap.get(i.produtoId) ?? i.precoUnitario
    return s + preco * i.quantidade
  }, 0)

  const estadoPagamento = metodoPagamento === "PIX_ONLINE" ? "PAGO" : "PENDENTE"

  const pedido = await prisma.pedido.create({
    data: {
      lojaId: loja.id,
      clienteId: cliente.id,
      estadoPedido: "NOVO",
      tipoEntrega: tipoEntrega,
      enderecoEntregaId: enderecoId,
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

  redirect(`/${slug}/pedido/${pedido.id}`)
}

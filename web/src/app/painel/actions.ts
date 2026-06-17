"use server"

import { revalidatePath } from "next/cache"

import { requireLojista } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export type ActionState = {
  error?: string
  success?: string
}

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim()
}

async function getLojaIdFromSession() {
  const session = await requireLojista()
  return session.lojaId
}

export async function updateAparenciaAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let lojaId: string
  try {
    lojaId = await getLojaIdFromSession()
  } catch {
    return { error: "Acesso negado." }
  }

  const nome = getString(formData, "nome")
  const corPrimaria = getString(formData, "corPrimaria")
  const templateCardapio = getString(formData, "templateCardapio") || "CLASSICO"
  const paletaPreset = getString(formData, "paletaPreset") || null
  const texturaFundo = getString(formData, "texturaFundo") || "NENHUMA"

  if (!nome || !corPrimaria) {
    return { error: "Preencha nome e cor primária." }
  }

  const loja = await prisma.loja.update({
    where: { id: lojaId },
    data: {
      nome,
      corPrimaria,
      templateCardapio: templateCardapio as "CLASSICO" | "MODERNO" | "DARK",
      paletaPreset,
      texturaFundo: texturaFundo as "NENHUMA" | "GRAIN" | "DOTS" | "WAVES",
    },
  })

  revalidatePath("/painel")
  revalidatePath("/painel/aparencia")
  revalidatePath(`/${loja.slug}`)
  return { success: "Aparência atualizada." }
}

export async function createCategoriaAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let lojaId: string
  try {
    lojaId = await getLojaIdFromSession()
  } catch {
    return { error: "Acesso negado." }
  }

  const nome = getString(formData, "nome")
  const ordem = Number(formData.get("ordem") ?? 0)

  if (!nome) return { error: "Informe o nome da categoria." }

  await prisma.categoria.create({
    data: { lojaId, nome, ordem: Number.isFinite(ordem) ? ordem : 0 },
  })

  revalidatePath("/painel/categorias")
  return { success: "Categoria criada." }
}

export async function updateCategoriaAction(
  categoriaId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let lojaId: string
  try {
    lojaId = await getLojaIdFromSession()
  } catch {
    return { error: "Acesso negado." }
  }

  const nome = getString(formData, "nome")
  const ordem = Number(formData.get("ordem") ?? 0)

  const categoria = await prisma.categoria.findFirst({
    where: { id: categoriaId, lojaId },
  })
  if (!categoria) return { error: "Categoria não encontrada." }

  await prisma.categoria.update({
    where: { id: categoriaId },
    data: { nome, ordem: Number.isFinite(ordem) ? ordem : 0 },
  })

  revalidatePath("/painel/categorias")
  return { success: "Categoria atualizada." }
}

export async function deleteCategoriaAction(
  categoriaId: string,
  _prev: ActionState = {},
): Promise<ActionState> {
  let lojaId: string
  try {
    lojaId = await getLojaIdFromSession()
  } catch {
    return { error: "Acesso negado." }
  }

  const categoria = await prisma.categoria.findFirst({
    where: { id: categoriaId, lojaId },
    include: { _count: { select: { produtos: true } } },
  })
  if (!categoria) return { error: "Categoria não encontrada." }

  if (categoria._count.produtos > 0) {
    return { error: "Remova ou mova os produtos antes de excluir a categoria." }
  }

  await prisma.categoria.delete({ where: { id: categoriaId } })
  revalidatePath("/painel/categorias")
  return { success: "Categoria excluída." }
}

export async function createProdutoAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let lojaId: string
  try {
    lojaId = await getLojaIdFromSession()
  } catch {
    return { error: "Acesso negado." }
  }

  const nome = getString(formData, "nome")
  const descricao = getString(formData, "descricao")
  const preco = Number(getString(formData, "preco"))
  const categoriaId = getString(formData, "categoriaId")
  const disponivel = formData.get("disponivel") === "on"
  const emDestaque = formData.get("emDestaque") === "on"

  if (!nome || !descricao || !categoriaId || !Number.isFinite(preco) || preco <= 0) {
    return { error: "Preencha todos os campos corretamente." }
  }

  const categoria = await prisma.categoria.findFirst({
    where: { id: categoriaId, lojaId },
  })
  if (!categoria) return { error: "Categoria inválida." }

  const loja = await prisma.loja.findUnique({ where: { id: lojaId }, select: { slug: true } })

  await prisma.produto.create({
    data: { lojaId, categoriaId, nome, descricao, preco, disponivel, emDestaque },
  })

  revalidatePath("/painel/produtos")
  if (loja) revalidatePath(`/${loja.slug}`)
  return { success: "Produto criado." }
}

export async function updateProdutoAction(
  produtoId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let lojaId: string
  try {
    lojaId = await getLojaIdFromSession()
  } catch {
    return { error: "Acesso negado." }
  }

  const nome = getString(formData, "nome")
  const descricao = getString(formData, "descricao")
  const preco = Number(getString(formData, "preco"))
  const categoriaId = getString(formData, "categoriaId")
  const disponivel = formData.get("disponivel") === "on"
  const emDestaque = formData.get("emDestaque") === "on"

  const produto = await prisma.produto.findFirst({
    where: { id: produtoId, lojaId },
  })
  if (!produto) return { error: "Produto não encontrado." }

  const categoria = await prisma.categoria.findFirst({
    where: { id: categoriaId, lojaId },
  })
  if (!categoria) return { error: "Categoria inválida." }

  const loja = await prisma.loja.findUnique({ where: { id: lojaId }, select: { slug: true } })

  await prisma.produto.update({
    where: { id: produtoId },
    data: { nome, descricao, preco, categoriaId, disponivel, emDestaque },
  })

  revalidatePath("/painel/produtos")
  if (loja) revalidatePath(`/${loja.slug}`)
  return { success: "Produto atualizado." }
}

export async function deleteProdutoAction(
  produtoId: string,
  _prev: ActionState = {},
): Promise<ActionState> {
  let lojaId: string
  try {
    lojaId = await getLojaIdFromSession()
  } catch {
    return { error: "Acesso negado." }
  }

  const produto = await prisma.produto.findFirst({
    where: { id: produtoId, lojaId },
  })
  if (!produto) return { error: "Produto não encontrado." }

  const loja = await prisma.loja.findUnique({ where: { id: lojaId }, select: { slug: true } })

  await prisma.produto.delete({ where: { id: produtoId } })

  revalidatePath("/painel/produtos")
  if (loja) revalidatePath(`/${loja.slug}`)
  return { success: "Produto excluído." }
}

// ─── Pedidos (KDS) ────────────────────────────────────────────────────────────

const ESTADOS_ORDENADOS = [
  "NOVO",
  "EM_PREPARACAO",
  "PRONTO",
  "EM_ENTREGA",
  "CONCLUIDO",
  "CANCELADO",
] as const

export async function avancarPedidoAction(pedidoId: string): Promise<void> {
  let lojaId: string
  try {
    lojaId = await getLojaIdFromSession()
  } catch {
    return
  }

  const pedido = await prisma.pedido.findFirst({
    where: { id: pedidoId, lojaId },
  })
  if (!pedido) return

  const idx = ESTADOS_ORDENADOS.indexOf(pedido.estadoPedido as typeof ESTADOS_ORDENADOS[number])
  if (idx === -1 || idx >= ESTADOS_ORDENADOS.length - 2) return

  const proximo = ESTADOS_ORDENADOS[idx + 1]

  await prisma.pedido.update({
    where: { id: pedidoId },
    data: { estadoPedido: proximo },
  })

  revalidatePath("/painel/pedidos")
}

export async function cancelarPedidoAction(pedidoId: string): Promise<void> {
  let lojaId: string
  try {
    lojaId = await getLojaIdFromSession()
  } catch {
    return
  }

  const pedido = await prisma.pedido.findFirst({
    where: { id: pedidoId, lojaId },
  })
  if (!pedido) return

  await prisma.pedido.update({
    where: { id: pedidoId },
    data: { estadoPedido: "CANCELADO" },
  })

  revalidatePath("/painel/pedidos")
}

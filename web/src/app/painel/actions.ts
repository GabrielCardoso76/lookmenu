"use server"

import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

import { requireLojista } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notificarClientePedido } from "@/lib/notificacoes"
import { ajustarEstoque } from "@/lib/estoque"
import { solicitarEntrega, syncStatus, testarConexao, type IfoodResult } from "@/lib/ifood-entrega"

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

// ─── Aparência ────────────────────────────────────────────────────────────────

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
  const logoUrl = getString(formData, "logoUrl") || null
  const fontePreset = getString(formData, "fontePreset") || null
  const subtituloCardapio = getString(formData, "subtituloCardapio") || null
  const tituloAbaRaw = getString(formData, "tituloAba")
  const tituloAba = tituloAbaRaw.trim() || null

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
      texturaFundo: texturaFundo as "NENHUMA" | "GRAIN" | "DOTS" | "WAVES" | "STRIPES" | "CHECKS" | "CIRCLES" | "FOOD",
      logoUrl,
      fontePreset,
      subtituloCardapio,
      tituloAba,
    },
  })

  revalidatePath("/painel")
  revalidatePath("/painel/aparencia")
  revalidatePath(`/${loja.slug}`)
  return { success: "Aparência atualizada." }
}

// ─── Pagamentos ───────────────────────────────────────────────────────────────

export async function updatePagamentosAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let lojaId: string
  try {
    lojaId = await getLojaIdFromSession()
  } catch {
    return { error: "Acesso negado." }
  }

  const aceitaPixSite         = formData.get("aceitaPixSite") === "true"
  const aceitaCartaoEntrega   = formData.get("aceitaCartaoEntrega") === "true"
  const aceitaDinheiroEntrega = formData.get("aceitaDinheiroEntrega") === "true"
  const pagamentoNoSite       = formData.get("pagamentoNoSite") === "true"
  const pagamentoNaMesa       = formData.get("pagamentoNaMesa") === "true"

  // Pelo menos um método de pagamento deve estar habilitado
  if (!aceitaPixSite && !aceitaCartaoEntrega && !aceitaDinheiroEntrega) {
    return { error: "Habilite ao menos um método de pagamento." }
  }

  // Se pagamento obrigatório no site, deve haver ao menos um método aceito online
  if (pagamentoNoSite && !aceitaPixSite) {
    return { error: "Para exigir pagamento no site, o PIX deve estar habilitado." }
  }

  const loja = await prisma.loja.update({
    where: { id: lojaId },
    data: {
      aceitaPixSite,
      aceitaCartaoEntrega,
      aceitaDinheiroEntrega,
      pagamentoNoSite,
      pagamentoNaMesa,
    },
  })

  revalidatePath("/painel/configuracoes")
  revalidatePath(`/${loja.slug}/checkout`)
  revalidatePath(`/${loja.slug}`)
  return { success: "Configurações de pagamento salvas." }
}

// ─── Entrega ──────────────────────────────────────────────────────────────────

export async function updateEntregaAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let lojaId: string
  try {
    lojaId = await getLojaIdFromSession()
  } catch {
    return { error: "Acesso negado." }
  }

  const pedidoMinimoStr = getString(formData, "pedidoMinimo")
  const taxaEntregaFixaStr = getString(formData, "taxaEntregaFixa")
  const freteGratisAcimaStr = getString(formData, "freteGratisAcima")

  const toDecimal = (v: string) => {
    if (!v) return null
    const n = parseFloat(v.replace(",", "."))
    return Number.isFinite(n) && n >= 0 ? n : null
  }

  const pedidoMinimo = toDecimal(pedidoMinimoStr)
  const taxaEntregaFixa = toDecimal(taxaEntregaFixaStr)
  const freteGratisAcima = toDecimal(freteGratisAcimaStr)

  const loja = await prisma.loja.update({
    where: { id: lojaId },
    data: { pedidoMinimo, taxaEntregaFixa, freteGratisAcima },
  })

  revalidatePath("/painel/configuracoes")
  revalidatePath(`/${loja.slug}/checkout`)
  return { success: "Configurações de entrega salvas." }
}

// ─── Categorias ───────────────────────────────────────────────────────────────

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

// ─── Produtos ─────────────────────────────────────────────────────────────────

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
  const destinoPreparo = (getString(formData, "destinoPreparo") || "NENHUM") as "COZINHA" | "BAR" | "NENHUM"
  const imagemUrl = getString(formData, "imagemUrl") || null
  const controlaEstoque = formData.get("controlaEstoque") === "on"
  const quantidadeEstoque = Number(getString(formData, "quantidadeEstoque") || "0")
  const estoqueMinimo = getString(formData, "estoqueMinimo") ? Number(getString(formData, "estoqueMinimo")) : null

  if (!nome || !descricao || !categoriaId || !Number.isFinite(preco) || preco <= 0) {
    return { error: "Preencha todos os campos corretamente." }
  }

  const categoria = await prisma.categoria.findFirst({
    where: { id: categoriaId, lojaId },
  })
  if (!categoria) return { error: "Categoria inválida." }

  const loja = await prisma.loja.findUnique({ where: { id: lojaId }, select: { slug: true } })

  await prisma.produto.create({
    data: {
      lojaId, categoriaId, nome, descricao, preco, disponivel, emDestaque, destinoPreparo, imagemUrl,
      controlaEstoque,
      quantidadeEstoque: Number.isFinite(quantidadeEstoque) && quantidadeEstoque >= 0 ? quantidadeEstoque : 0,
      estoqueMinimo: estoqueMinimo != null && Number.isFinite(estoqueMinimo) && estoqueMinimo >= 0 ? estoqueMinimo : null,
    },
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
  const destinoPreparo = (getString(formData, "destinoPreparo") || "NENHUM") as "COZINHA" | "BAR" | "NENHUM"
  const imagemUrl = getString(formData, "imagemUrl") || null
  const controlaEstoque = formData.get("controlaEstoque") === "on"
  const estoqueMinimo = getString(formData, "estoqueMinimo") ? Number(getString(formData, "estoqueMinimo")) : null

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
    data: {
      nome, descricao, preco, categoriaId, disponivel, emDestaque, destinoPreparo, imagemUrl,
      controlaEstoque,
      estoqueMinimo: estoqueMinimo != null && Number.isFinite(estoqueMinimo) && estoqueMinimo >= 0 ? estoqueMinimo : null,
    },
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

// Para delivery/balcão: avança até CONCLUIDO passando por EM_ENTREGA
const ESTADOS_DELIVERY = ["NOVO", "EM_PREPARACAO", "PRONTO", "EM_ENTREGA", "CONCLUIDO", "CANCELADO"] as const
// Para salão: KDS avança só até PRONTO; CONCLUIDO é exclusivo de fecharContaMesaAction
const ESTADOS_SALAO   = ["NOVO", "EM_PREPARACAO", "PRONTO", "CANCELADO"] as const

type EstadoDelivery = typeof ESTADOS_DELIVERY[number]
type EstadoSalao = typeof ESTADOS_SALAO[number]

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

  const isSalao = pedido.tipoEntrega === "SALAO_MESA"

  let proximo: string
  if (isSalao) {
    const idx = ESTADOS_SALAO.indexOf(pedido.estadoPedido as EstadoSalao)
    if (idx === -1 || idx >= ESTADOS_SALAO.length - 2) return
    proximo = ESTADOS_SALAO[idx + 1]
  } else {
    const idx = ESTADOS_DELIVERY.indexOf(pedido.estadoPedido as EstadoDelivery)
    if (idx === -1 || idx >= ESTADOS_DELIVERY.length - 2) return
    proximo = ESTADOS_DELIVERY[idx + 1]
  }

  await prisma.pedido.update({
    where: { id: pedidoId },
    data: { estadoPedido: proximo as EstadoDelivery },
  })

  await notificarClientePedido("STATUS", pedidoId)
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
    include: {
      itens: {
        select: { produtoId: true, quantidade: true, produto: { select: { controlaEstoque: true } } },
      },
    },
  })
  if (!pedido) return

  await prisma.$transaction(async (tx) => {
    await tx.pedido.update({
      where: { id: pedidoId },
      data: { estadoPedido: "CANCELADO" },
    })

    for (const item of pedido.itens) {
      if (item.produto.controlaEstoque) {
        await ajustarEstoque(tx, {
          produtoId: item.produtoId,
          lojaId,
          delta: item.quantidade,
          tipo: "CANCELAMENTO",
          pedidoId,
          observacao: "Cancelamento de pedido",
        })
      }
    }
  })

  revalidatePath("/painel/pedidos")
  revalidatePath("/painel/estoque")
}

// ─── Mesas ────────────────────────────────────────────────────────────────────

export async function createMesaAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let lojaId: string
  try {
    lojaId = await getLojaIdFromSession()
  } catch {
    return { error: "Acesso negado." }
  }

  const numero = getString(formData, "numero")
  const nome = getString(formData, "nome") || null
  const capacidade = formData.get("capacidade") ? Number(formData.get("capacidade")) : null

  if (!numero) return { error: "Informe o número/identificador da mesa." }

  const exists = await prisma.mesa.findFirst({ where: { lojaId, numero } })
  if (exists) return { error: `Mesa "${numero}" já existe.` }

  await prisma.mesa.create({
    data: { lojaId, numero, nome, capacidade: capacidade && Number.isFinite(capacidade) ? capacidade : null },
  })

  revalidatePath("/painel/mesas")
  return { success: "Mesa criada." }
}

export async function updateMesaAction(
  mesaId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let lojaId: string
  try {
    lojaId = await getLojaIdFromSession()
  } catch {
    return { error: "Acesso negado." }
  }

  const numero = getString(formData, "numero")
  const nome = getString(formData, "nome") || null
  const ativa = formData.get("ativa") === "on"
  const capacidade = formData.get("capacidade") ? Number(formData.get("capacidade")) : null

  const mesa = await prisma.mesa.findFirst({ where: { id: mesaId, lojaId } })
  if (!mesa) return { error: "Mesa não encontrada." }

  const conflict = await prisma.mesa.findFirst({ where: { lojaId, numero, id: { not: mesaId } } })
  if (conflict) return { error: `Mesa "${numero}" já existe.` }

  await prisma.mesa.update({
    where: { id: mesaId },
    data: { numero, nome, ativa, capacidade: capacidade && Number.isFinite(capacidade) ? capacidade : null },
  })

  revalidatePath("/painel/mesas")
  return { success: "Mesa atualizada." }
}

export async function deleteMesaAction(mesaId: string, _prev: ActionState = {}): Promise<ActionState> {
  let lojaId: string
  try {
    lojaId = await getLojaIdFromSession()
  } catch {
    return { error: "Acesso negado." }
  }

  const mesa = await prisma.mesa.findFirst({ where: { id: mesaId, lojaId } })
  if (!mesa) return { error: "Mesa não encontrada." }

  await prisma.mesa.delete({ where: { id: mesaId } })
  revalidatePath("/painel/mesas")
  return { success: "Mesa excluída." }
}

// ─── Funcionários ─────────────────────────────────────────────────────────────

export async function createFuncionarioAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let lojaId: string
  try {
    lojaId = await getLojaIdFromSession()
  } catch {
    return { error: "Acesso negado." }
  }

  const nome = getString(formData, "nome")
  const pin = getString(formData, "pin")

  if (!nome) return { error: "Informe o nome do funcionário." }
  if (!pin || pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
    return { error: "O PIN deve ter 4 a 6 dígitos numéricos." }
  }

  const pinHash = await bcrypt.hash(pin, 10)
  await prisma.funcionario.create({ data: { lojaId, nome, pin: pinHash } })

  revalidatePath("/painel/funcionarios")
  return { success: "Funcionário cadastrado." }
}

export async function updateFuncionarioAction(
  funcionarioId: string,
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
  const pin = getString(formData, "pin")
  const ativo = formData.get("ativo") === "on"

  const func = await prisma.funcionario.findFirst({ where: { id: funcionarioId, lojaId } })
  if (!func) return { error: "Funcionário não encontrado." }

  if (pin && (pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin))) {
    return { error: "O PIN deve ter 4 a 6 dígitos numéricos." }
  }

  const pinHash = pin ? await bcrypt.hash(pin, 10) : undefined
  await prisma.funcionario.update({
    where: { id: funcionarioId },
    data: { nome, ativo, ...(pinHash ? { pin: pinHash } : {}) },
  })

  revalidatePath("/painel/funcionarios")
  return { success: "Funcionário atualizado." }
}

export async function deleteFuncionarioAction(
  funcionarioId: string,
  _prev: ActionState = {},
): Promise<ActionState> {
  let lojaId: string
  try {
    lojaId = await getLojaIdFromSession()
  } catch {
    return { error: "Acesso negado." }
  }

  const func = await prisma.funcionario.findFirst({ where: { id: funcionarioId, lojaId } })
  if (!func) return { error: "Funcionário não encontrado." }

  await prisma.funcionario.delete({ where: { id: funcionarioId } })
  revalidatePath("/painel/funcionarios")
  return { success: "Funcionário excluído." }
}

// ─── Adicionais ──────────────────────────────────────────────────────────────

export async function createAdicionalAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let lojaId: string
  try {
    lojaId = await getLojaIdFromSession()
  } catch {
    return { error: "Acesso negado." }
  }

  const nome = getString(formData, "nome")
  const precoStr = getString(formData, "preco")
  const disponivel = formData.get("disponivel") !== "false"

  if (!nome) return { error: "Nome é obrigatório." }
  const preco = parseFloat(precoStr.replace(",", "."))
  if (isNaN(preco) || preco < 0) return { error: "Preço inválido." }

  await prisma.adicional.create({ data: { lojaId, nome, preco, disponivel } })
  revalidatePath("/painel/adicionais")
  return { success: "Adicional criado." }
}

export async function updateAdicionalAction(
  adicionalId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let lojaId: string
  try {
    lojaId = await getLojaIdFromSession()
  } catch {
    return { error: "Acesso negado." }
  }

  const adicional = await prisma.adicional.findFirst({ where: { id: adicionalId, lojaId } })
  if (!adicional) return { error: "Adicional não encontrado." }

  const nome = getString(formData, "nome")
  const precoStr = getString(formData, "preco")
  const disponivel = formData.get("disponivel") !== "false"

  if (!nome) return { error: "Nome é obrigatório." }
  const preco = parseFloat(precoStr.replace(",", "."))
  if (isNaN(preco) || preco < 0) return { error: "Preço inválido." }

  await prisma.adicional.update({ where: { id: adicionalId }, data: { nome, preco, disponivel } })
  revalidatePath("/painel/adicionais")
  return { success: "Adicional atualizado." }
}

export async function deleteAdicionalAction(
  adicionalId: string,
  _prev: ActionState = {},
): Promise<ActionState> {
  let lojaId: string
  try {
    lojaId = await getLojaIdFromSession()
  } catch {
    return { error: "Acesso negado." }
  }

  const adicional = await prisma.adicional.findFirst({ where: { id: adicionalId, lojaId } })
  if (!adicional) return { error: "Adicional não encontrado." }

  await prisma.adicional.delete({ where: { id: adicionalId } })
  revalidatePath("/painel/adicionais")
  return { success: "Adicional excluído." }
}

export async function toggleProdutoAdicionalAction(
  produtoId: string,
  adicionalId: string,
  linked: boolean,
): Promise<ActionState> {
  let lojaId: string
  try {
    lojaId = await getLojaIdFromSession()
  } catch {
    return { error: "Acesso negado." }
  }

  const produto = await prisma.produto.findFirst({ where: { id: produtoId, lojaId } })
  if (!produto) return { error: "Produto não encontrado." }

  const adicional = await prisma.adicional.findFirst({ where: { id: adicionalId, lojaId } })
  if (!adicional) return { error: "Adicional não encontrado." }

  if (linked) {
    await prisma.produtoAdicional.upsert({
      where: { produtoId_adicionalId: { produtoId, adicionalId } },
      create: { produtoId, adicionalId },
      update: {},
    })
  } else {
    await prisma.produtoAdicional.deleteMany({ where: { produtoId, adicionalId } })
  }

  revalidatePath("/painel/adicionais")
  revalidatePath("/painel/produtos")
  return { success: "Vínculo atualizado." }
}

// ─── Horários de funcionamento ───────────────────────────────────────────────

const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/

export async function updateHorariosAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let lojaId: string
  try {
    lojaId = await getLojaIdFromSession()
  } catch {
    return { error: "Não autorizado." }
  }

  const upserts = []

  for (let dia = 0; dia <= 6; dia++) {
    const fechado = formData.get(`fechado_${dia}`) === "true"
    const abreAs = getString(formData, `abre_${dia}`)
    const fechaAs = getString(formData, `fecha_${dia}`)

    if (!fechado) {
      if (!HORA_REGEX.test(abreAs) || !HORA_REGEX.test(fechaAs)) {
        const nomes = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]
        return { error: `Horário inválido em ${nomes[dia]}. Use o formato HH:MM.` }
      }
    }

    upserts.push(
      prisma.horarioFuncionamento.upsert({
        where: { lojaId_diaSemana: { lojaId, diaSemana: dia } },
        create: {
          lojaId,
          diaSemana: dia,
          abreAs: fechado ? "00:00" : abreAs,
          fechaAs: fechado ? "00:00" : fechaAs,
          fechado,
        },
        update: {
          abreAs: fechado ? "00:00" : abreAs,
          fechaAs: fechado ? "00:00" : fechaAs,
          fechado,
        },
      }),
    )
  }

  await Promise.all(upserts)

  revalidatePath("/painel/configuracoes")
  return { success: "Horários salvos com sucesso." }
}

// ─── Cupons ───────────────────────────────────────────────────────────────────

function parseCupomFormData(formData: FormData) {
  const codigo = getString(formData, "codigo").toUpperCase().replace(/\s/g, "")
  const tipo = getString(formData, "tipo") as "PERCENTUAL" | "VALOR_FIXO"
  const valorStr = getString(formData, "valor")
  const pedidoMinimoStr = getString(formData, "pedidoMinimo")
  const maxUsosStr = getString(formData, "maxUsos")
  const validoDeStr = getString(formData, "validoDe")
  const validoAteStr = getString(formData, "validoAte")
  const ativo = formData.get("ativo") !== "false"

  if (!codigo) return { error: "Código do cupom é obrigatório." }
  if (!["PERCENTUAL", "VALOR_FIXO"].includes(tipo)) return { error: "Tipo inválido." }

  const valor = parseFloat(valorStr.replace(",", "."))
  if (isNaN(valor) || valor <= 0) return { error: "Valor inválido." }
  if (tipo === "PERCENTUAL" && valor > 100) return { error: "Desconto percentual não pode exceder 100%." }

  const pedidoMinimo = pedidoMinimoStr
    ? (() => { const n = parseFloat(pedidoMinimoStr.replace(",", ".")); return Number.isFinite(n) && n >= 0 ? n : null })()
    : null
  const maxUsos = maxUsosStr ? (parseInt(maxUsosStr) || null) : null
  const validoDe = validoDeStr ? new Date(validoDeStr) : null
  const validoAte = validoAteStr ? new Date(validoAteStr) : null

  return { codigo, tipo, valor, pedidoMinimo, maxUsos, validoDe, validoAte, ativo }
}

export async function createCupomAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let lojaId: string
  try {
    lojaId = await getLojaIdFromSession()
  } catch {
    return { error: "Acesso negado." }
  }

  const parsed = parseCupomFormData(formData)
  if ("error" in parsed) return { error: parsed.error }

  const exists = await prisma.cupom.findFirst({ where: { lojaId, codigo: parsed.codigo } })
  if (exists) return { error: `Cupom "${parsed.codigo}" já existe nesta loja.` }

  await prisma.cupom.create({
    data: {
      lojaId,
      codigo: parsed.codigo,
      tipo: parsed.tipo,
      valor: parsed.valor,
      pedidoMinimo: parsed.pedidoMinimo,
      maxUsos: parsed.maxUsos,
      validoDe: parsed.validoDe,
      validoAte: parsed.validoAte,
      ativo: parsed.ativo,
    },
  })

  revalidatePath("/painel/cupons")
  return { success: `Cupom "${parsed.codigo}" criado.` }
}

export async function updateCupomAction(
  cupomId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let lojaId: string
  try {
    lojaId = await getLojaIdFromSession()
  } catch {
    return { error: "Acesso negado." }
  }

  const cupom = await prisma.cupom.findFirst({ where: { id: cupomId, lojaId } })
  if (!cupom) return { error: "Cupom não encontrado." }

  const parsed = parseCupomFormData(formData)
  if ("error" in parsed) return { error: parsed.error }

  const conflict = await prisma.cupom.findFirst({
    where: { lojaId, codigo: parsed.codigo, id: { not: cupomId } },
  })
  if (conflict) return { error: `Código "${parsed.codigo}" já está em uso por outro cupom.` }

  await prisma.cupom.update({
    where: { id: cupomId },
    data: {
      codigo: parsed.codigo,
      tipo: parsed.tipo,
      valor: parsed.valor,
      pedidoMinimo: parsed.pedidoMinimo,
      maxUsos: parsed.maxUsos,
      validoDe: parsed.validoDe,
      validoAte: parsed.validoAte,
      ativo: parsed.ativo,
    },
  })

  revalidatePath("/painel/cupons")
  return { success: "Cupom atualizado." }
}

export async function toggleCupomAction(cupomId: string, ativo: boolean): Promise<ActionState> {
  let lojaId: string
  try {
    lojaId = await getLojaIdFromSession()
  } catch {
    return { error: "Acesso negado." }
  }

  const cupom = await prisma.cupom.findFirst({ where: { id: cupomId, lojaId } })
  if (!cupom) return { error: "Cupom não encontrado." }

  await prisma.cupom.update({ where: { id: cupomId }, data: { ativo } })
  revalidatePath("/painel/cupons")
  return { success: ativo ? "Cupom ativado." : "Cupom desativado." }
}

export async function deleteCupomAction(cupomId: string, _prev: ActionState = {}): Promise<ActionState> {
  let lojaId: string
  try {
    lojaId = await getLojaIdFromSession()
  } catch {
    return { error: "Acesso negado." }
  }

  const cupom = await prisma.cupom.findFirst({ where: { id: cupomId, lojaId } })
  if (!cupom) return { error: "Cupom não encontrado." }

  await prisma.cupom.delete({ where: { id: cupomId } })
  revalidatePath("/painel/cupons")
  return { success: "Cupom excluído." }
}

// ─── Estoque ──────────────────────────────────────────────────────────────────

export async function toggleControlaEstoqueAction(
  produtoId: string,
  controlaEstoque: boolean,
): Promise<ActionState> {
  let lojaId: string
  try {
    lojaId = await getLojaIdFromSession()
  } catch {
    return { error: "Acesso negado." }
  }

  const produto = await prisma.produto.findFirst({ where: { id: produtoId, lojaId } })
  if (!produto) return { error: "Produto não encontrado." }

  await prisma.produto.update({
    where: { id: produtoId },
    data: { controlaEstoque },
  })

  revalidatePath("/painel/estoque")
  revalidatePath("/painel/produtos")
  return { success: controlaEstoque ? "Controle de estoque ativado." : "Controle de estoque desativado." }
}

export async function movimentarEstoqueAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let lojaId: string
  try {
    lojaId = await getLojaIdFromSession()
  } catch {
    return { error: "Acesso negado." }
  }

  const produtoId = getString(formData, "produtoId")
  const tipoRaw = getString(formData, "tipo") as "ENTRADA" | "SAIDA" | "AJUSTE"
  const quantidadeStr = getString(formData, "quantidade")
  const observacao = getString(formData, "observacao") || undefined

  if (!produtoId) return { error: "Produto inválido." }
  if (!["ENTRADA", "SAIDA", "AJUSTE"].includes(tipoRaw)) return { error: "Tipo inválido." }

  const quantidade = parseInt(quantidadeStr)
  if (!Number.isFinite(quantidade) || quantidade <= 0) {
    return { error: "Quantidade deve ser um número positivo." }
  }

  const produto = await prisma.produto.findFirst({
    where: { id: produtoId, lojaId },
    select: { nome: true, controlaEstoque: true },
  })
  if (!produto) return { error: "Produto não encontrado." }
  if (!produto.controlaEstoque) return { error: "Este produto não tem controle de estoque ativo." }

  await prisma.$transaction(async (tx) => {
    await ajustarEstoque(tx, {
      produtoId,
      lojaId,
      delta: quantidade,
      tipo: tipoRaw,
      observacao,
    })
  })

  revalidatePath("/painel/estoque")
  revalidatePath("/painel/produtos")

  const labels = { ENTRADA: "Entrada", SAIDA: "Saída", AJUSTE: "Ajuste" }
  return { success: `${labels[tipoRaw]} de ${quantidade} un. registrada em "${produto.nome}".` }
}

// ─── PDV ──────────────────────────────────────────────────────────────────────

export type PdvActionState = ActionState & { pedidoId?: string }

export async function criarVendaPdvAction(
  _prev: PdvActionState,
  formData: FormData,
): Promise<PdvActionState> {
  let session: { lojaId: string }
  try {
    session = await requireLojista()
  } catch {
    return { error: "Acesso negado." }
  }

  const lojaId = session.lojaId
  const itensJson = getString(formData, "itens")
  const metodoPagamento = getString(formData, "metodoPagamento") as "DINHEIRO_ENTREGA" | "CARTAO_ENTREGA"
  const nomeCliente = getString(formData, "nomeCliente") || "Balcão"

  if (!itensJson) return { error: "Carrinho vazio." }
  if (!["DINHEIRO_ENTREGA", "CARTAO_ENTREGA"].includes(metodoPagamento)) {
    return { error: "Método de pagamento inválido." }
  }

  type ItemPdv = { produtoId: string; quantidade: number; precoUnitario: number }
  let itens: ItemPdv[]
  try {
    itens = JSON.parse(itensJson) as ItemPdv[]
    if (!Array.isArray(itens) || itens.length === 0) throw new Error()
  } catch {
    return { error: "Carrinho inválido." }
  }

  const produtoIds = itens.map((i) => i.produtoId)
  const produtos = await prisma.produto.findMany({
    where: { id: { in: produtoIds }, lojaId, disponivel: true },
    select: { id: true, preco: true, controlaEstoque: true },
  })

  if (produtos.length !== produtoIds.length) {
    return { error: "Algum produto não está disponível." }
  }

  const precoMap = new Map(produtos.map((p) => [p.id, Number(p.preco)]))
  const total = itens.reduce(
    (s, i) => s + (precoMap.get(i.produtoId) ?? i.precoUnitario) * i.quantidade,
    0,
  )

  const pedido = await prisma.$transaction(async (tx) => {
    const p = await tx.pedido.create({
      data: {
        lojaId,
        estadoPedido: "NOVO",
        tipoEntrega: "RETIRADA_BALCAO",
        subtotal: total,
        total,
        estadoPagamento: "PAGO",
        metodoPagamento,
        nomeCliente,
        itens: {
          create: itens.map((item) => ({
            produtoId: item.produtoId,
            quantidade: item.quantidade,
            precoUnitario: precoMap.get(item.produtoId) ?? item.precoUnitario,
          })),
        },
      },
    })

    for (const item of itens) {
      await ajustarEstoque(tx, {
        produtoId: item.produtoId,
        lojaId,
        delta: item.quantidade,
        tipo: "VENDA",
        pedidoId: p.id,
        observacao: `PDV — ${nomeCliente}`,
      })
    }

    return p
  })

  revalidatePath("/painel/pedidos")
  revalidatePath("/painel/estoque")
  revalidatePath("/painel/pdv")
  revalidatePath("/painel")

  return {
    success: `Venda #${pedido.id.slice(-6).toUpperCase()} registrada com sucesso!`,
    pedidoId: pedido.id,
  }
}

// ─── Onboarding ───────────────────────────────────────────────────────────────

export async function dismissOnboardingAction(_formData: FormData): Promise<void> {
  let lojaId: string
  try {
    lojaId = await getLojaIdFromSession()
  } catch {
    return
  }

  await prisma.loja.update({
    where: { id: lojaId },
    data: { onboardingDismissedEm: new Date() },
  })

  revalidatePath("/painel")
}

// ─── Recuperador de vendas ──────────────────────────────────────────────────

export async function updateRecuperadorAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let lojaId: string
  try {
    lojaId = await getLojaIdFromSession()
  } catch {
    return { error: "Acesso negado." }
  }

  const recuperadorAtivo = formData.get("recuperadorAtivo") === "true"
  const minutosRaw = parseInt(getString(formData, "recuperadorMinutos"), 10)
  const recuperadorMinutos = Number.isFinite(minutosRaw) ? Math.min(1440, Math.max(5, minutosRaw)) : 15

  await prisma.loja.update({
    where: { id: lojaId },
    data: { recuperadorAtivo, recuperadorMinutos },
  })

  revalidatePath("/painel/recuperador")
  return { success: "Configurações do recuperador salvas." }
}

// ─── iFood Entrega Fácil ────────────────────────────────────────────────────

export async function updateIfoodAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let lojaId: string
  try {
    lojaId = await getLojaIdFromSession()
  } catch {
    return { error: "Acesso negado." }
  }

  const ifoodEntregaFacilAtivo = formData.get("ifoodEntregaFacilAtivo") === "true"
  const ifoodMerchantId = getString(formData, "ifoodMerchantId") || null

  if (ifoodEntregaFacilAtivo && !ifoodMerchantId) {
    return { error: "Informe o Merchant ID do iFood para ativar a integração." }
  }

  await prisma.loja.update({
    where: { id: lojaId },
    data: { ifoodEntregaFacilAtivo, ifoodMerchantId },
  })

  revalidatePath("/painel/configuracoes")
  revalidatePath("/painel/pedidos")
  return { success: "Configurações do iFood Entrega Fácil salvas." }
}

export async function testarConexaoIfoodAction(): Promise<ActionState> {
  let lojaId: string
  try {
    lojaId = await getLojaIdFromSession()
  } catch {
    return { error: "Acesso negado." }
  }

  const res = await testarConexao(lojaId)
  return res.ok ? { success: "Conexão com o iFood estabelecida." } : { error: res.error ?? "Falha na conexão." }
}

export async function solicitarEntregaIfoodAction(pedidoId: string): Promise<IfoodResult> {
  let lojaId: string
  try {
    lojaId = await getLojaIdFromSession()
  } catch {
    return { ok: false, error: "Acesso negado." }
  }

  const pedido = await prisma.pedido.findFirst({ where: { id: pedidoId, lojaId }, select: { id: true } })
  if (!pedido) return { ok: false, error: "Pedido não encontrado." }

  const res = await solicitarEntrega(pedidoId)
  revalidatePath("/painel/pedidos")
  return res
}

export async function syncEntregaIfoodAction(pedidoId: string): Promise<IfoodResult> {
  let lojaId: string
  try {
    lojaId = await getLojaIdFromSession()
  } catch {
    return { ok: false, error: "Acesso negado." }
  }

  const pedido = await prisma.pedido.findFirst({ where: { id: pedidoId, lojaId }, select: { id: true } })
  if (!pedido) return { ok: false, error: "Pedido não encontrado." }

  const res = await syncStatus(pedidoId)
  revalidatePath("/painel/pedidos")
  return res
}

// ─── Suporte ──────────────────────────────────────────────────────────────────

export async function criarTicketSuporteAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let session: Awaited<ReturnType<typeof requireLojista>>
  try {
    session = await requireLojista()
  } catch {
    return { error: "Acesso negado." }
  }

  const assunto = getString(formData, "assunto")
  const mensagem = getString(formData, "mensagem")

  if (!assunto || !mensagem) {
    return { error: "Preencha assunto e mensagem." }
  }
  if (mensagem.length < 10) {
    return { error: "Mensagem muito curta (mínimo 10 caracteres)." }
  }

  await prisma.ticketSuporte.create({
    data: {
      lojaId: session.lojaId,
      usuarioId: session.id,
      assunto,
      mensagem,
    },
  })

  return { success: "Mensagem enviada! Retornaremos em breve." }
}

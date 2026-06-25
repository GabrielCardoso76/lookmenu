import type { Prisma } from "../../node_modules/.prisma/client"

export type TipoMovimentacaoEstoque = "ENTRADA" | "SAIDA" | "AJUSTE" | "VENDA" | "CANCELAMENTO"

export interface AjustarEstoqueParams {
  produtoId: string
  lojaId: string
  /** Sempre positivo. Para AJUSTE, representa a nova quantidade absoluta. */
  delta: number
  tipo: TipoMovimentacaoEstoque
  pedidoId?: string
  observacao?: string
}

/**
 * Ajusta o estoque de um produto dentro de uma transação Prisma.
 * - ENTRADA / CANCELAMENTO: soma delta ao estoque atual
 * - SAIDA / VENDA: subtrai delta (floor em 0)
 * - AJUSTE: define quantidade absoluta = delta
 * - Se controlaEstoque=false, retorna sem fazer nada.
 * - Se quantidade chega a 0 → disponivel=false; se volta > 0 → disponivel=true.
 */
export async function ajustarEstoque(
  tx: Prisma.TransactionClient,
  params: AjustarEstoqueParams,
): Promise<void> {
  const { produtoId, lojaId, delta, tipo, pedidoId, observacao } = params

  const produto = await tx.produto.findFirst({
    where: { id: produtoId, lojaId },
    select: { controlaEstoque: true, quantidadeEstoque: true },
  })

  if (!produto?.controlaEstoque) return

  const antes = produto.quantidadeEstoque
  let depois: number

  switch (tipo) {
    case "ENTRADA":
    case "CANCELAMENTO":
      depois = antes + delta
      break
    case "SAIDA":
    case "VENDA":
      depois = Math.max(0, antes - delta)
      break
    case "AJUSTE":
      depois = Math.max(0, delta)
      break
    default:
      depois = antes
  }

  await tx.produto.update({
    where: { id: produtoId },
    data: {
      quantidadeEstoque: depois,
      disponivel: depois > 0,
    },
  })

  await tx.movimentacaoEstoque.create({
    data: {
      lojaId,
      produtoId,
      tipo,
      quantidade: delta,
      quantidadeAnterior: antes,
      quantidadeNova: depois,
      observacao: observacao ?? null,
      pedidoId: pedidoId ?? null,
    },
  })
}

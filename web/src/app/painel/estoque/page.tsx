import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard-shell"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PAINEL_NAV } from "@/app/painel/nav"
import { EstoqueManager } from "./estoque-manager"

export default async function EstoquePage() {
  const session = await getSession()
  if (!session || session.papel !== "LOJISTA" || !session.lojaId) redirect("/login")

  const [produtos, movimentacoes] = await Promise.all([
    prisma.produto.findMany({
      where: { lojaId: session.lojaId },
      include: { categoria: { select: { nome: true } } },
      orderBy: [{ categoria: { ordem: "asc" } }, { nome: "asc" }],
    }),
    prisma.movimentacaoEstoque.findMany({
      where: { lojaId: session.lojaId },
      include: { produto: { select: { nome: true } } },
      orderBy: { criadoEm: "desc" },
      take: 50,
    }),
  ])

  const produtosRows = produtos.map((p) => ({
    id: p.id,
    nome: p.nome,
    categoriaNome: p.categoria.nome,
    controlaEstoque: p.controlaEstoque,
    quantidadeEstoque: p.quantidadeEstoque,
    estoqueMinimo: p.estoqueMinimo,
    disponivel: p.disponivel,
  }))

  const movRows = movimentacoes.map((m) => ({
    id: m.id,
    tipo: m.tipo as string,
    quantidade: m.quantidade,
    quantidadeAnterior: m.quantidadeAnterior,
    quantidadeNova: m.quantidadeNova,
    observacao: m.observacao,
    criadoEm: m.criadoEm.toISOString(),
    produtoNome: m.produto.nome,
  }))

  return (
    <DashboardShell user={session} title="Painel da loja" nav={PAINEL_NAV}>
      <h2 className="mb-6 text-2xl font-semibold">Estoque</h2>
      <EstoqueManager produtos={produtosRows} movimentacoes={movRows} />
    </DashboardShell>
  )
}

import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard-shell"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PAINEL_NAV } from "@/app/painel/nav"
import { PdvClient } from "./pdv-client"

export default async function PdvPage() {
  const session = await getSession()
  if (!session || session.papel !== "LOJISTA" || !session.lojaId) redirect("/login")

  const produtos = await prisma.produto.findMany({
    where: { lojaId: session.lojaId, disponivel: true },
    include: { categoria: { select: { nome: true, ordem: true } } },
    orderBy: [{ categoria: { ordem: "asc" } }, { nome: "asc" }],
  })

  const rows = produtos.map((p) => ({
    id: p.id,
    nome: p.nome,
    preco: Number(p.preco),
    categoriaId: p.categoriaId,
    categoriaNome: p.categoria.nome,
    controlaEstoque: p.controlaEstoque,
    quantidadeEstoque: p.quantidadeEstoque,
    estoqueMinimo: p.estoqueMinimo,
    imagemUrl: p.imagemUrl,
  }))

  return (
    <DashboardShell user={session} title="Painel da loja" nav={PAINEL_NAV}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">PDV — Ponto de Venda</h2>
      </div>
      <PdvClient produtos={rows} />
    </DashboardShell>
  )
}

import { redirect } from "next/navigation"

import { ProdutosManager } from "@/app/painel/produtos/produtos-manager"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardShell } from "@/components/dashboard-shell"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PAINEL_NAV } from "@/app/painel/nav"

export default async function ProdutosPage() {
  const session = await getSession()
  if (!session || session.papel !== "LOJISTA" || !session.lojaId) redirect("/login")

  const [produtos, categorias] = await Promise.all([
    prisma.produto.findMany({
      where: { lojaId: session.lojaId },
      include: { categoria: { select: { nome: true } } },
      orderBy: [{ categoria: { ordem: "asc" } }, { nome: "asc" }],
    }),
    prisma.categoria.findMany({
      where: { lojaId: session.lojaId },
      orderBy: { ordem: "asc" },
      select: { id: true, nome: true },
    }),
  ])

  const rows = produtos.map((p) => ({
    id: p.id,
    nome: p.nome,
    descricao: p.descricao,
    preco: p.preco.toString(),
    categoriaId: p.categoriaId,
    categoriaNome: p.categoria.nome,
    disponivel: p.disponivel,
    emDestaque: p.emDestaque,
    destinoPreparo: p.destinoPreparo,
    imagemUrl: p.imagemUrl,
    controlaEstoque: p.controlaEstoque,
    quantidadeEstoque: p.quantidadeEstoque,
    estoqueMinimo: p.estoqueMinimo,
  }))

  return (
    <DashboardShell user={session} title="Painel da loja" nav={PAINEL_NAV}>
      <h2 className="mb-6 text-2xl font-semibold">Produtos</h2>
      <Card>
        <CardHeader>
          <CardTitle>Catálogo</CardTitle>
        </CardHeader>
        <CardContent>
          <ProdutosManager produtos={rows} categorias={categorias} />
        </CardContent>
      </Card>
    </DashboardShell>
  )
}

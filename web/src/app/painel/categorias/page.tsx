import { redirect } from "next/navigation"

import { CategoriasManager } from "@/app/painel/categorias/categorias-manager"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardShell } from "@/components/dashboard-shell"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PAINEL_NAV } from "@/app/painel/nav"

export default async function CategoriasPage() {
  const session = await getSession()
  if (!session || session.papel !== "LOJISTA" || !session.lojaId) redirect("/login")

  const categorias = await prisma.categoria.findMany({
    where: { lojaId: session.lojaId },
    orderBy: { ordem: "asc" },
    include: { _count: { select: { produtos: true } } },
  })

  const rows = categorias.map((c) => ({
    id: c.id,
    nome: c.nome,
    ordem: c.ordem,
    produtosCount: c._count.produtos,
  }))

  return (
    <DashboardShell user={session} title="Painel da loja" nav={PAINEL_NAV}>
      <h2 className="mb-6 text-2xl font-semibold">Categorias</h2>
      <Card>
        <CardHeader>
          <CardTitle>Catálogo</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoriasManager categorias={rows} />
        </CardContent>
      </Card>
    </DashboardShell>
  )
}

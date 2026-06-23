import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard-shell"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PAINEL_NAV } from "@/app/painel/nav"
import { AdicionaisManager } from "./adicionais-manager"

export default async function AdicionaisPage() {
  const session = await getSession()
  if (!session || session.papel !== "LOJISTA" || !session.lojaId) redirect("/login")

  const [adicionaisRaw, produtos] = await Promise.all([
    prisma.adicional.findMany({
      where: { lojaId: session.lojaId },
      orderBy: { nome: "asc" },
      include: {
        produtos: { select: { produtoId: true } },
      },
    }),
    prisma.produto.findMany({
      where: { lojaId: session.lojaId, disponivel: true },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    }),
  ])

  const adicionais = adicionaisRaw.map((a) => ({
    ...a,
    preco: Number(a.preco),
  }))

  return (
    <DashboardShell user={session} title="Painel da loja" nav={PAINEL_NAV}>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Adicionais</h2>
        <p className="text-sm text-muted-foreground">
          Gerencie opções extras que podem ser adicionadas aos produtos.
        </p>
      </div>
      <AdicionaisManager adicionais={adicionais} produtos={produtos} />
    </DashboardShell>
  )
}

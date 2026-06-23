import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard-shell"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PAINEL_NAV } from "@/app/painel/nav"
import { MesasManager } from "./mesas-manager"

export default async function MesasPage() {
  const session = await getSession()
  if (!session || session.papel !== "LOJISTA" || !session.lojaId) redirect("/login")

  const [loja, mesas] = await Promise.all([
    prisma.loja.findUnique({ where: { id: session.lojaId }, select: { slug: true } }),
    prisma.mesa.findMany({
      where: { lojaId: session.lojaId },
      orderBy: { numero: "asc" },
    }),
  ])

  if (!loja) redirect("/login")

  return (
    <DashboardShell user={session} title="Painel da loja" nav={PAINEL_NAV}>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Mesas</h2>
        <p className="text-sm text-muted-foreground">
          Gerencie as mesas do salão. Funcionários podem fazer pedidos por mesa no{" "}
          <a href={`/${loja.slug}/atendimento`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            App Garçom ↗
          </a>
        </p>
      </div>
      <MesasManager
        mesas={mesas.map((m) => ({
          id: m.id,
          numero: m.numero,
          nome: m.nome,
          ativa: m.ativa,
          capacidade: m.capacidade,
        }))}
        slug={loja.slug}
      />
    </DashboardShell>
  )
}

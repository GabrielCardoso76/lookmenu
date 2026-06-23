import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard-shell"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canUseCupons } from "@/lib/planos"
import { PAINEL_NAV } from "@/app/painel/nav"
import { CuponsManager } from "./cupons-manager"

export default async function CuponsPage() {
  const session = await getSession()
  if (!session || session.papel !== "LOJISTA" || !session.lojaId) redirect("/login")

  const permitido = await canUseCupons(session.lojaId)
  if (!permitido) redirect("/painel")

  const cupons = await prisma.cupom.findMany({
    where: { lojaId: session.lojaId },
    orderBy: { criadoEm: "desc" },
    select: {
      id: true,
      codigo: true,
      tipo: true,
      valor: true,
      pedidoMinimo: true,
      maxUsos: true,
      usosAtuais: true,
      validoDe: true,
      validoAte: true,
      ativo: true,
    },
  })

  const cuponsSerializaveis = cupons.map((c) => ({
    ...c,
    valor: Number(c.valor),
    pedidoMinimo: c.pedidoMinimo != null ? Number(c.pedidoMinimo) : null,
    validoDe: c.validoDe ? c.validoDe.toISOString() : null,
    validoAte: c.validoAte ? c.validoAte.toISOString() : null,
  }))

  return (
    <DashboardShell user={session} title="Painel da loja" nav={PAINEL_NAV}>
      <h2 className="mb-2 text-2xl font-semibold">Cupons</h2>
      <p className="mb-8 text-sm text-muted-foreground">
        Crie códigos de desconto para seus clientes. Um cupom por pedido, não acumulável.
      </p>

      <div className="max-w-4xl">
        <CuponsManager cupons={cuponsSerializaveis} />
      </div>
    </DashboardShell>
  )
}

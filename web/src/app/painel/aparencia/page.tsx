import { redirect } from "next/navigation"

import { AparenciaShell } from "@/app/painel/aparencia/aparencia-shell"
import { DashboardShell } from "@/components/dashboard-shell"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PAINEL_NAV } from "@/app/painel/nav"

export default async function AparenciaPage() {
  const session = await getSession()
  if (!session || session.papel !== "LOJISTA" || !session.lojaId) redirect("/login")

  const loja = await prisma.loja.findUnique({ where: { id: session.lojaId } })
  if (!loja) redirect("/login")

  return (
    <DashboardShell user={session} title="Painel da loja" nav={PAINEL_NAV}>
      <h2 className="mb-6 text-2xl font-semibold">Aparência</h2>
      <AparenciaShell
        loja={{
          nome: loja.nome,
          slug: loja.slug,
          corPrimaria: loja.corPrimaria,
          templateCardapio: loja.templateCardapio,
          paletaPreset: loja.paletaPreset,
          texturaFundo: loja.texturaFundo,
          logoUrl: loja.logoUrl,
          fontePreset: loja.fontePreset,
          subtituloCardapio: loja.subtituloCardapio,
          tituloAba: loja.tituloAba,
        }}
      />
    </DashboardShell>
  )
}

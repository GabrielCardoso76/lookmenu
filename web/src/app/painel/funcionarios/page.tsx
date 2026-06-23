import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard-shell"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PAINEL_NAV } from "@/app/painel/nav"
import { FuncionariosManager } from "./funcionarios-manager"

export default async function FuncionariosPage() {
  const session = await getSession()
  if (!session || session.papel !== "LOJISTA" || !session.lojaId) redirect("/login")

  const [loja, funcionarios] = await Promise.all([
    prisma.loja.findUnique({ where: { id: session.lojaId }, select: { slug: true } }),
    prisma.funcionario.findMany({
      where: { lojaId: session.lojaId },
      orderBy: { nome: "asc" },
    }),
  ])

  if (!loja) redirect("/login")

  return (
    <DashboardShell user={session} title="Painel da loja" nav={PAINEL_NAV}>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Funcionários</h2>
        <p className="text-sm text-muted-foreground">
          Gerencie garçons e atendentes. Cada funcionário tem um PIN para acessar o{" "}
          <a href={`/${loja.slug}/atendimento`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            App Garçom ↗
          </a>
        </p>
      </div>
      <FuncionariosManager
        funcionarios={funcionarios.map((f) => ({
          id: f.id,
          nome: f.nome,
          pin: f.pin,
          ativo: f.ativo,
        }))}
        slug={loja.slug}
      />
    </DashboardShell>
  )
}

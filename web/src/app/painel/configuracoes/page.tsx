import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard-shell"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PAINEL_NAV } from "@/app/painel/nav"
import { ConfiguracoesForm } from "./configuracoes-form"
import { EntregaForm } from "./entrega-form"
import { HorariosForm } from "./horarios-form"

export default async function ConfiguracoesPage() {
  const session = await getSession()
  if (!session || session.papel !== "LOJISTA" || !session.lojaId) redirect("/login")

  const loja = await prisma.loja.findUnique({
    where: { id: session.lojaId },
    select: {
      aceitaPixSite: true,
      aceitaCartaoEntrega: true,
      aceitaDinheiroEntrega: true,
      pagamentoNoSite: true,
      pagamentoNaMesa: true,
      pedidoMinimo: true,
      taxaEntregaFixa: true,
      freteGratisAcima: true,
    },
  })

  if (!loja) redirect("/login")

  const horarios = await prisma.horarioFuncionamento.findMany({
    where: { lojaId: session.lojaId },
    orderBy: { diaSemana: "asc" },
    select: { diaSemana: true, abreAs: true, fechaAs: true, fechado: true },
  })

  return (
    <DashboardShell user={session} title="Painel da loja" nav={PAINEL_NAV}>
      <h2 className="mb-2 text-2xl font-semibold">Configurações</h2>
      <p className="mb-8 text-sm text-muted-foreground">
        Defina como e quando seus clientes pagam, e os horários de funcionamento.
      </p>

      <div className="max-w-lg space-y-12">
        <section>
          <h3 className="mb-1 text-lg font-semibold">Pagamentos</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Defina como e quando seus clientes pagam.
          </p>
          <ConfiguracoesForm config={loja} />
        </section>

        <section>
          <h3 className="mb-1 text-lg font-semibold">Entrega</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Configure pedido mínimo, taxa de entrega e limite para frete grátis.
          </p>
          <EntregaForm
            config={{
              pedidoMinimo: loja.pedidoMinimo ? Number(loja.pedidoMinimo) : null,
              taxaEntregaFixa: loja.taxaEntregaFixa ? Number(loja.taxaEntregaFixa) : null,
              freteGratisAcima: loja.freteGratisAcima ? Number(loja.freteGratisAcima) : null,
            }}
          />
        </section>

        <section>
          <h3 className="mb-1 text-lg font-semibold">Horário de funcionamento</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            O cardápio bloqueia novos pedidos fora desse horário. Fusos: America/Sao_Paulo (padrão).
          </p>
          <HorariosForm horarios={horarios} />
        </section>
      </div>
    </DashboardShell>
  )
}

import { redirect } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardShell } from "@/components/dashboard-shell"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canUseRecuperador } from "@/lib/planos"
import { PAINEL_NAV } from "@/app/painel/nav"
import { RecuperadorForm } from "./recuperador-form"

function formatPreco(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function formatDataHora(value: Date) {
  return value.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function contarItens(itensJson: unknown): number {
  if (!Array.isArray(itensJson)) return 0
  return itensJson.reduce((s: number, i) => {
    const q = (i as { quantidade?: number })?.quantidade
    return s + (typeof q === "number" ? q : 0)
  }, 0)
}

export default async function RecuperadorPage() {
  const session = await getSession()
  if (!session || session.papel !== "LOJISTA" || !session.lojaId) redirect("/login")

  const liberado = await canUseRecuperador(session.lojaId)

  const loja = await prisma.loja.findUnique({
    where: { id: session.lojaId },
    select: { recuperadorAtivo: true, recuperadorMinutos: true },
  })
  if (!loja) redirect("/login")

  const seteDiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [carrinhos, totalAbandonados7d, totalEnviados7d, totalRecuperados7d] = await Promise.all([
    prisma.carrinhoAbandonado.findMany({
      where: { lojaId: session.lojaId },
      orderBy: { atualizadoEm: "desc" },
      take: 50,
      select: {
        id: true,
        telefone: true,
        nomeCliente: true,
        subtotal: true,
        itensJson: true,
        recuperacaoEnviadaEm: true,
        recuperadoEm: true,
        criadoEm: true,
        atualizadoEm: true,
      },
    }),
    prisma.carrinhoAbandonado.count({
      where: { lojaId: session.lojaId, criadoEm: { gte: seteDiasAtras } },
    }),
    prisma.carrinhoAbandonado.count({
      where: { lojaId: session.lojaId, criadoEm: { gte: seteDiasAtras }, recuperacaoEnviadaEm: { not: null } },
    }),
    prisma.carrinhoAbandonado.count({
      where: { lojaId: session.lojaId, criadoEm: { gte: seteDiasAtras }, recuperadoEm: { not: null } },
    }),
  ])

  const whatsappAtivo = process.env.WHATSAPP_ENABLED === "true"

  return (
    <DashboardShell user={session} title="Painel da loja" nav={PAINEL_NAV}>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Recuperador de vendas</h2>
        <p className="text-sm text-muted-foreground">
          Reconquiste clientes que abandonaram o carrinho com uma mensagem automática no WhatsApp.
        </p>
      </div>

      {!liberado && (
        <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          O recuperador de vendas faz parte do plano Plus. Fale com nosso time para liberar.
        </div>
      )}

      {!whatsappAtivo && (
        <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          O envio de mensagens está desativado (WHATSAPP_ENABLED não está ligado). Os carrinhos
          continuam sendo registrados, mas nenhuma mensagem será enviada até a integração estar ativa.
        </div>
      )}

      {/* Métricas 7 dias */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-1">
            <CardDescription>Carrinhos abandonados (7d)</CardDescription>
            <CardTitle className="text-3xl">{totalAbandonados7d}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardDescription>Mensagens enviadas (7d)</CardDescription>
            <CardTitle className="text-3xl">{totalEnviados7d}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardDescription>Recuperados (7d)</CardDescription>
            <CardTitle className="text-3xl">{totalRecuperados7d}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {totalEnviados7d > 0
                ? `${Math.round((totalRecuperados7d / totalEnviados7d) * 100)}% de conversão`
                : "Sem envios ainda"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8 max-w-lg">
        <RecuperadorForm config={loja} />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Carrinhos abandonados</CardTitle>
          <CardDescription>Últimos 50 registros</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {carrinhos.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-muted-foreground">
              Nenhum carrinho abandonado registrado ainda.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-4 py-3 font-semibold text-muted-foreground">Cliente</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground">Telefone</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground">Itens</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Subtotal</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground">Status</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Atualizado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {carrinhos.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{c.nomeCliente ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.telefone ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{contarItens(c.itensJson)}</td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {formatPreco(Number(c.subtotal))}
                      </td>
                      <td className="px-4 py-3">
                        {c.recuperadoEm ? (
                          <Badge variant="default" className="text-xs">
                            Recuperado
                          </Badge>
                        ) : c.recuperacaoEnviadaEm ? (
                          <Badge variant="secondary" className="text-xs">
                            Mensagem enviada
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Aberto
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {formatDataHora(c.atualizadoEm)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  )
}

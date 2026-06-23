import Link from "next/link"
import { redirect } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardShell } from "@/components/dashboard-shell"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PAINEL_NAV } from "@/app/painel/nav"

function formatPreco(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

const ESTADO_LABEL: Record<string, string> = {
  NOVO: "Novo",
  EM_PREPARACAO: "Preparando",
  PRONTO: "Pronto",
  EM_ENTREGA: "Em entrega",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
}

const PAGAMENTO_LABEL: Record<string, string> = {
  PIX_ONLINE: "PIX",
  DINHEIRO_ENTREGA: "Dinheiro",
  CARTAO_ENTREGA: "Cartão",
}

export default async function PainelDashboardPage() {
  const session = await getSession()
  if (!session || session.papel !== "LOJISTA" || !session.lojaId) redirect("/login")

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const amanha = new Date(hoje)
  amanha.setDate(amanha.getDate() + 1)

  const [loja, pedidosHoje, ultimosPedidos] = await Promise.all([
    prisma.loja.findUnique({
      where: { id: session.lojaId },
      include: {
        _count: { select: { categorias: true, produtos: true } },
      },
    }),
    prisma.pedido.findMany({
      where: {
        lojaId: session.lojaId,
        criadoEm: { gte: hoje, lt: amanha },
        estadoPedido: { not: "CANCELADO" },
      },
      select: { total: true, estadoPagamento: true },
    }),
    prisma.pedido.findMany({
      where: { lojaId: session.lojaId },
      orderBy: { criadoEm: "desc" },
      take: 10,
      select: {
        id: true,
        estadoPedido: true,
        estadoPagamento: true,
        metodoPagamento: true,
        total: true,
        criadoEm: true,
        nomeCliente: true,
        tipoEntrega: true,
      },
    }),
  ])

  if (!loja) redirect("/login")

  // Faturamento: soma total de pedidos hoje (exceto cancelados)
  const faturamentoHoje = pedidosHoje.reduce((s, p) => s + Number(p.total), 0)
  const pagosHoje = pedidosHoje.filter((p) => p.estadoPagamento === "PAGO").reduce((s, p) => s + Number(p.total), 0)

  const pedidosAbertoCount = await prisma.pedido.count({
    where: {
      lojaId: session.lojaId,
      estadoPedido: { notIn: ["CONCLUIDO", "CANCELADO"] },
    },
  })

  return (
    <DashboardShell user={session} title="Painel da loja" nav={PAINEL_NAV}>
      <div className="mb-5">
        <h2 className="text-2xl font-semibold md:text-3xl">{loja.nome}</h2>
        <p className="text-sm text-muted-foreground">
          Cardápio público:{" "}
          <Link href={`/${loja.slug}`} className="text-primary hover:underline" target="_blank">
            /{loja.slug}
          </Link>
        </p>
      </div>

      {/* Resumo + atalhos */}
      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-7">
        <Card>
          <CardHeader className="pb-1">
            <CardDescription>Pedidos hoje</CardDescription>
            <CardTitle className="text-3xl">{pedidosHoje.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/painel/pedidos">Ver todos</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardDescription>Faturamento hoje</CardDescription>
            <CardTitle className="text-2xl">{formatPreco(faturamentoHoje)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Pago: {formatPreco(pagosHoje)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardDescription>Em aberto</CardDescription>
            <CardTitle className="text-3xl">{pedidosAbertoCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/painel/pedidos">KDS</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardDescription>Produtos</CardDescription>
            <CardTitle className="text-3xl">{loja._count.produtos}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/painel/produtos">Gerenciar</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardDescription>Categorias</CardDescription>
            <CardTitle className="text-3xl">{loja._count.categorias}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/painel/categorias">Gerenciar</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardDescription>Cor do cardápio</CardDescription>
            <CardTitle className="flex items-center gap-2 text-xl">
              <span
                className="inline-block h-6 w-6 rounded-full border border-border"
                style={{ backgroundColor: loja.corPrimaria }}
              />
              {loja.corPrimaria}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/painel/aparencia">Personalizar</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardDescription>Template ativo</CardDescription>
            <CardTitle className="text-xl capitalize">{loja.templateCardapio.toLowerCase()}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/painel/aparencia">Mudar</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Últimos pedidos */}
      {ultimosPedidos.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Últimos 10 pedidos</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 sm:pt-0">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-4 py-3 font-semibold text-muted-foreground">Pedido</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground">Cliente</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground">Status</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground">Tipo</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground">Pagamento</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Total</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Hora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {ultimosPedidos.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        #{p.id.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-4 py-3 font-medium">{p.nomeCliente ?? "—"}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-xs">
                          {ESTADO_LABEL[p.estadoPedido] ?? p.estadoPedido}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {p.tipoEntrega === "DELIVERY" ? "Delivery" : p.tipoEntrega === "SALAO_MESA" ? "Salão" : "Retirada"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{PAGAMENTO_LABEL[p.metodoPagamento]}</span>
                          <Badge
                            variant={p.estadoPagamento === "PAGO" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {p.estadoPagamento === "PAGO" ? "Pago" : "Pendente"}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">{formatPreco(Number(p.total))}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {new Date(p.criadoEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-2 p-4 md:hidden">
              {ultimosPedidos.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-muted-foreground">
                      #{p.id.slice(-6).toUpperCase()}
                    </span>
                    <span className="font-medium">{p.nomeCliente ?? "—"}</span>
                    <Badge variant="outline" className="text-xs">
                      {ESTADO_LABEL[p.estadoPedido] ?? p.estadoPedido}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {p.tipoEntrega === "DELIVERY" ? "Delivery" : "Retirada"} •{" "}
                      {PAGAMENTO_LABEL[p.metodoPagamento]}
                    </span>
                    <Badge
                      variant={p.estadoPagamento === "PAGO" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {p.estadoPagamento === "PAGO" ? "Pago" : "Pendente"}
                    </Badge>
                    <span className="font-semibold">{formatPreco(Number(p.total))}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardShell>
  )
}

import { redirect } from "next/navigation"
import { Suspense } from "react"

import { DashboardShell } from "@/components/dashboard-shell"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PAINEL_NAV } from "@/app/painel/nav"
import { FinanceiroClient } from "./financeiro-client"

type PageProps = {
  searchParams: Promise<{
    dataInicio?: string
    dataFim?: string
    tipo?: string
    produto?: string
    status?: string
    categoriaId?: string
    metodoPagamento?: string
    apenasPagos?: string
  }>
}

function getDateRange(dataInicio?: string, dataFim?: string) {
  const now = new Date()

  if (dataInicio && dataFim) {
    const inicio = new Date(dataInicio + "T00:00:00")
    const fim = new Date(dataFim + "T23:59:59")
    return { inicio, fim }
  }

  // Default: últimos 30 dias
  const inicio = new Date()
  inicio.setDate(now.getDate() - 30)
  inicio.setHours(0, 0, 0, 0)
  const fim = new Date()
  fim.setHours(23, 59, 59, 999)
  return { inicio, fim }
}

function formatDateLabel(inicio: Date, fim: Date) {
  const opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short" }
  return `${inicio.toLocaleDateString("pt-BR", opts)} — ${fim.toLocaleDateString("pt-BR", opts)}`
}

export default async function FinanceiroPage({ searchParams }: PageProps) {
  const session = await getSession()
  if (!session || session.papel !== "LOJISTA" || !session.lojaId) redirect("/login")

  const params = await searchParams
  const { dataInicio, dataFim, tipo, produto, status, categoriaId, metodoPagamento, apenasPagos } = params

  const { inicio, fim } = getDateRange(dataInicio, dataFim)
  const periodoLabel = formatDateLabel(inicio, fim)

  const apenasPageFilter = apenasPagos === "1"

  const [pedidos, categorias] = await Promise.all([
    prisma.pedido.findMany({
      where: {
        lojaId: session.lojaId,
        criadoEm: { gte: inicio, lte: fim },
        ...(tipo ? { tipoEntrega: tipo as "DELIVERY" | "RETIRADA_BALCAO" | "SALAO_MESA" } : {}),
        ...(metodoPagamento ? { metodoPagamento: metodoPagamento as "PIX_ONLINE" | "DINHEIRO_ENTREGA" | "CARTAO_ENTREGA" } : {}),
        ...(apenasPageFilter
          ? { estadoPagamento: "PAGO" as const, estadoPedido: "CONCLUIDO" as const }
          : status
            ? { estadoPedido: status as "NOVO" | "EM_PREPARACAO" | "PRONTO" | "EM_ENTREGA" | "CONCLUIDO" | "CANCELADO" }
            : { estadoPedido: { not: "CANCELADO" as const } }),
        ...(produto || categoriaId
          ? {
              itens: {
                some: {
                  produto: {
                    ...(produto ? { nome: { contains: produto, mode: "insensitive" as const } } : {}),
                    ...(categoriaId ? { categoriaId } : {}),
                  },
                },
              },
            }
          : {}),
      },
      orderBy: { criadoEm: "desc" },
      take: 1000,
      include: {
        itens: {
          include: { produto: { select: { nome: true } } },
        },
      },
    }),
    prisma.categoria.findMany({
      where: { lojaId: session.lojaId },
      select: { id: true, nome: true },
      orderBy: { ordem: "asc" },
    }),
  ])

  // Métricas
  const totalVendido = pedidos.reduce((s, p) => s + Number(p.total), 0)
  const qtdPedidos = pedidos.length
  const ticketMedio = qtdPedidos > 0 ? totalVendido / qtdPedidos : 0

  const paymentMap = new Map<string, { total: number; qty: number }>()
  for (const p of pedidos) {
    const m = p.metodoPagamento
    const cur = paymentMap.get(m) ?? { total: 0, qty: 0 }
    paymentMap.set(m, { total: cur.total + Number(p.total), qty: cur.qty + 1 })
  }
  const porPagamento = Array.from(paymentMap.entries()).map(([metodo, v]) => ({ metodo, ...v }))

  const tipoMap = new Map<string, { total: number; qty: number }>()
  for (const p of pedidos) {
    const t = p.tipoEntrega
    const cur = tipoMap.get(t) ?? { total: 0, qty: 0 }
    tipoMap.set(t, { total: cur.total + Number(p.total), qty: cur.qty + 1 })
  }
  const porTipo = Array.from(tipoMap.entries()).map(([tipo, v]) => ({ tipo, ...v }))

  // Gráfico: vendas por dia
  const graficoMap = new Map<string, { total: number; pedidos: number }>()
  for (const p of pedidos) {
    const day = p.criadoEm.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
    const cur = graficoMap.get(day) ?? { total: 0, pedidos: 0 }
    graficoMap.set(day, { total: cur.total + Number(p.total), pedidos: cur.pedidos + 1 })
  }
  const grafico = Array.from(graficoMap.entries())
    .map(([data, v]) => ({ data, total: v.total, pedidos: v.pedidos }))
    .reverse()

  const pedidosRows = pedidos.map((p) => ({
    id: p.id,
    criadoEm: p.criadoEm.toISOString(),
    nomeCliente: p.nomeCliente,
    tipoEntrega: p.tipoEntrega,
    metodoPagamento: p.metodoPagamento,
    estadoPagamento: p.estadoPagamento,
    estadoPedido: p.estadoPedido,
    total: Number(p.total),
    itensSummary: p.itens
      .map((i) => `${i.quantidade}x ${i.produto.nome}`)
      .join(", "),
  }))

  const fmtDate = (d: Date) => d.toISOString().split("T")[0]

  return (
    <DashboardShell user={session} title="Painel da loja" nav={PAINEL_NAV}>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Financeiro</h2>
        <p className="text-sm text-muted-foreground">Relatórios e análise de vendas</p>
      </div>

      <Suspense fallback={<div className="text-muted-foreground text-sm">Carregando...</div>}>
        <FinanceiroClient
          pedidos={pedidosRows}
          grafico={grafico}
          metricas={{ totalVendido, qtdPedidos, ticketMedio, porPagamento, porTipo }}
          filtros={{
            dataInicio: dataInicio ?? fmtDate(inicio),
            dataFim: dataFim ?? fmtDate(fim),
            tipo: tipo ?? "",
            produto: produto ?? "",
            status: status ?? "",
            categoriaId: categoriaId ?? "",
            metodoPagamento: metodoPagamento ?? "",
            apenasPagos: apenasPagos === "1",
          }}
          categorias={categorias}
          periodoLabel={periodoLabel}
        />
      </Suspense>
    </DashboardShell>
  )
}

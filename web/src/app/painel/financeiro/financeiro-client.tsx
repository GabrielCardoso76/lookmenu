"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useState, useTransition } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag, DollarSign, Receipt, Download, LayoutList } from "lucide-react"

type PedidoRow = {
  id: string
  criadoEm: string
  nomeCliente: string | null
  tipoEntrega: string
  metodoPagamento: string
  estadoPagamento: string
  estadoPedido: string
  total: number
  itensSummary: string
}

type GraficoItem = {
  data: string
  total: number
  pedidos: number
}

type MetricasFinanceiro = {
  totalVendido: number
  qtdPedidos: number
  ticketMedio: number
  porPagamento: { metodo: string; total: number; qty: number }[]
  porTipo: { tipo: string; total: number; qty: number }[]
}

type FinanceiroClientProps = {
  pedidos: PedidoRow[]
  grafico: GraficoItem[]
  metricas: MetricasFinanceiro
  filtros: {
    dataInicio: string
    dataFim: string
    tipo: string
    produto: string
    status: string
    categoriaId: string
    metodoPagamento: string
    apenasPagos: boolean
  }
  categorias: { id: string; nome: string }[]
  periodoLabel: string
}

const TIPO_LABEL: Record<string, string> = {
  DELIVERY: "Delivery",
  RETIRADA_BALCAO: "Balcão",
  SALAO_MESA: "Salão",
}

const METODO_LABEL: Record<string, string> = {
  PIX_ONLINE: "PIX",
  DINHEIRO_ENTREGA: "Dinheiro",
  CARTAO_ENTREGA: "Cartão",
}

const ESTADO_LABEL: Record<string, string> = {
  NOVO: "Novo",
  EM_PREPARACAO: "Preparando",
  PRONTO: "Pronto",
  EM_ENTREGA: "Em entrega",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
}

function formatPreco(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function MetricCard({ title, value, sub, icon: Icon }: { title: string; value: string; sub?: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {title}
        </CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
      {sub && (
        <CardContent>
          <p className="text-xs text-muted-foreground">{sub}</p>
        </CardContent>
      )}
    </Card>
  )
}

export function FinanceiroClient({
  pedidos,
  grafico,
  metricas,
  filtros,
  categorias,
  periodoLabel,
}: FinanceiroClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const [dataInicio, setDataInicio] = useState(filtros.dataInicio)
  const [dataFim, setDataFim] = useState(filtros.dataFim)
  const [tipo, setTipo] = useState(filtros.tipo)
  const [produto, setProduto] = useState(filtros.produto)
  const [status, setStatus] = useState(filtros.status)
  const [categoriaId, setCategoriaId] = useState(filtros.categoriaId)
  const [metodoPagamento, setMetodoPagamento] = useState(filtros.metodoPagamento)
  const [apenasPagos, setApenasPagos] = useState(filtros.apenasPagos)

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString())
    if (dataInicio) params.set("dataInicio", dataInicio)
    if (dataFim) params.set("dataFim", dataFim)
    if (tipo) params.set("tipo", tipo); else params.delete("tipo")
    if (produto) params.set("produto", produto); else params.delete("produto")
    if (status) params.set("status", status); else params.delete("status")
    if (categoriaId) params.set("categoriaId", categoriaId); else params.delete("categoriaId")
    if (metodoPagamento) params.set("metodoPagamento", metodoPagamento); else params.delete("metodoPagamento")
    if (apenasPagos) params.set("apenasPagos", "1"); else params.delete("apenasPagos")

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  function exportCSV() {
    const TIPO_L: Record<string, string> = { DELIVERY: "Delivery", RETIRADA_BALCAO: "Balcão", SALAO_MESA: "Salão" }
    const METODO_L: Record<string, string> = { PIX_ONLINE: "PIX", DINHEIRO_ENTREGA: "Dinheiro", CARTAO_ENTREGA: "Cartão" }
    const ESTADO_L: Record<string, string> = { NOVO: "Novo", EM_PREPARACAO: "Preparando", PRONTO: "Pronto", EM_ENTREGA: "Em entrega", CONCLUIDO: "Concluído", CANCELADO: "Cancelado" }

    const header = ["Pedido", "Data", "Cliente/Mesa", "Tipo", "Pagamento", "Status Pgto", "Status Pedido", "Total (R$)", "Itens"]
    const rows = pedidos.map((p) => [
      `#${p.id.slice(-6).toUpperCase()}`,
      new Date(p.criadoEm).toLocaleString("pt-BR"),
      p.nomeCliente ?? "—",
      TIPO_L[p.tipoEntrega] ?? p.tipoEntrega,
      METODO_L[p.metodoPagamento] ?? p.metodoPagamento,
      p.estadoPagamento === "PAGO" ? "Pago" : "Pendente",
      ESTADO_L[p.estadoPedido] ?? p.estadoPedido,
      p.total.toFixed(2).replace(".", ","),
      `"${p.itensSummary}"`,
    ])

    const csv = [header, ...rows].map((r) => r.join(";")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `financeiro-${filtros.dataInicio}-${filtros.dataFim}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function setPeriodo(days: number) {
    const fim = new Date()
    const inicio = new Date()
    inicio.setDate(inicio.getDate() - days)
    const fmt = (d: Date) => d.toISOString().split("T")[0]
    setDataInicio(fmt(inicio))
    setDataFim(fmt(fim))
  }

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="rounded-xl border surface-light p-3 shadow-lg text-sm">
        <p className="font-medium mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} className="text-muted-foreground">
            {p.name === "total" ? formatPreco(p.value) : `${p.value} pedidos`}
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick period */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Hoje", days: 0 },
              { label: "7 dias", days: 7 },
              { label: "30 dias", days: 30 },
              { label: "90 dias", days: 90 },
            ].map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setPeriodo(p.days)}
                className="rounded-full border px-3 py-1 text-xs font-medium hover:border-primary hover:text-primary transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <Label className="text-xs">Data início</Label>
              <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Data fim</Label>
              <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Tipo</Label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Todos</option>
                <option value="DELIVERY">Delivery</option>
                <option value="RETIRADA_BALCAO">Balcão</option>
                <option value="SALAO_MESA">Salão</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Forma de pagamento</Label>
              <select
                value={metodoPagamento}
                onChange={(e) => setMetodoPagamento(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Todas</option>
                <option value="PIX_ONLINE">PIX</option>
                <option value="CARTAO_ENTREGA">Cartão</option>
                <option value="DINHEIRO_ENTREGA">Dinheiro</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1 w-full sm:w-auto sm:flex-1 lg:max-w-sm">
              <Label className="text-xs">Buscar por produto</Label>
              <Input
                placeholder="Ex: Frango, Hambúrguer..."
                value={produto}
                onChange={(e) => setProduto(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            {categorias.length > 0 && (
              <div className="space-y-1 w-full sm:w-auto sm:flex-1 lg:max-w-sm">
                <Label className="text-xs">Categoria</Label>
                <select
                  value={categoriaId}
                  onChange={(e) => setCategoriaId(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Todas</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="space-y-1 w-full sm:w-auto sm:flex-1 lg:max-w-sm">
              <Label className="text-xs">Status do pedido</Label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Todos</option>
                <option value="CONCLUIDO">Concluído</option>
                <option value="EM_PREPARACAO">Preparando</option>
                <option value="NOVO">Novo</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={apenasPagos}
                onChange={(e) => setApenasPagos(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <span className="text-sm">Só concluídos/pagos</span>
            </label>
            <div className="flex items-center gap-2 ml-auto">
              <Button size="sm" variant="outline" onClick={exportCSV} className="gap-1.5">
                <Download className="h-3.5 w-3.5" />
                Exportar CSV
              </Button>
              <Button size="sm" onClick={applyFilters}>
                Filtrar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas */}
      <div>
        <p className="text-sm text-muted-foreground mb-3">{periodoLabel}</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Total vendido"
            value={formatPreco(metricas.totalVendido)}
            icon={DollarSign}
          />
          <MetricCard
            title="Pedidos"
            value={String(metricas.qtdPedidos)}
            icon={ShoppingBag}
          />
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Por pagamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {metricas.porPagamento.map((p) => (
                  <div key={p.metodo} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{METODO_LABEL[p.metodo] ?? p.metodo}</span>
                    <span className="font-medium">{formatPreco(p.total)} ({p.qty})</span>
                  </div>
                ))}
                {metricas.porPagamento.length === 0 && (
                  <p className="text-xs text-muted-foreground">Sem dados</p>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <LayoutList className="h-4 w-4" />
                Por canal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {metricas.porTipo.map((t) => (
                  <div key={t.tipo} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{TIPO_LABEL[t.tipo] ?? t.tipo}</span>
                    <span className="font-medium">{formatPreco(t.total)} ({t.qty})</span>
                  </div>
                ))}
                {metricas.porTipo.length === 0 && (
                  <p className="text-xs text-muted-foreground">Sem dados</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Gráfico */}
      {grafico.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vendas por dia</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={grafico} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="data" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} name="total" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Tabela de pedidos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pedidos ({pedidos.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {pedidos.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">
              Nenhum pedido encontrado para este filtro.
            </p>
          ) : (
            <div className="overflow-x-auto surface-light">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Pedido</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cliente</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Tipo</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Pgto</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Itens</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pedidos.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-mono text-xs text-muted-foreground">#{p.id.slice(-6).toUpperCase()}</p>
                          <p className="text-xs text-muted-foreground">{new Date(p.criadoEm).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{p.nomeCliente ?? "—"}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <Badge variant="outline" className="text-xs">{TIPO_LABEL[p.tipoEntrega] ?? p.tipoEntrega}</Badge>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">
                        {METODO_LABEL[p.metodoPagamento] ?? p.metodoPagamento}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground max-w-xs truncate">
                        {p.itensSummary}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={p.estadoPagamento === "PAGO" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {p.estadoPagamento === "PAGO" ? "Pago" : "Pend."}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">{formatPreco(p.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

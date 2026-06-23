"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useEffect, useTransition, useState } from "react"
import { ArrowRight, Clock, X, MapPin, User } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { avancarPedidoAction, cancelarPedidoAction } from "@/app/painel/actions"

export type PedidoKDS = {
  id: string
  estadoPedido: string
  tipoEntrega: string
  total: number
  criadoEm: string
  nomeCliente: string | null
  metodoPagamento: string
  estadoPagamento: string
  mesaNumero: string | null
  mesaNome: string | null
  funcionarioNome: string | null
  itens: Array<{
    id: string
    quantidade: number
    observacao: string | null
    produto: { nome: string; destinoPreparo: string }
  }>
  enderecoEntrega: {
    rua: string
    numero: string
    bairro: string
    cidade: string
  } | null
}

const COLUNAS = [
  { id: "NOVO", label: "Novo", cor: "bg-blue-50 border-blue-200", headerCor: "bg-blue-500" },
  { id: "EM_PREPARACAO", label: "Preparando", cor: "bg-yellow-50 border-yellow-200", headerCor: "bg-yellow-500" },
  { id: "PRONTO", label: "Pronto", cor: "bg-green-50 border-green-200", headerCor: "bg-green-500" },
  { id: "EM_ENTREGA", label: "Em entrega", cor: "bg-purple-50 border-purple-200", headerCor: "bg-purple-500" },
  { id: "CONCLUIDO", label: "Concluído", cor: "bg-gray-50 border-gray-200", headerCor: "bg-gray-400" },
] as const

const METODO_LABEL: Record<string, string> = {
  PIX_ONLINE: "PIX",
  DINHEIRO_ENTREGA: "Dinheiro",
  CARTAO_ENTREGA: "Cartão",
}

const TIPO_LABEL: Record<string, string> = {
  DELIVERY: "Delivery",
  RETIRADA_BALCAO: "Balcão",
  SALAO_MESA: "Salão",
}

const DESTINO_LABEL: Record<string, string> = {
  COZINHA: "Cozinha",
  BAR: "Bar",
  NENHUM: "",
}

type Filtro = "TODOS" | "DELIVERY" | "SALAO" | "BAR"

function formatPreco(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function formatHora(isoString: string) {
  return new Date(isoString).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

function hasItemBar(pedido: PedidoKDS) {
  return pedido.itens.some((i) => i.produto.destinoPreparo === "BAR")
}

function PedidoCard({ pedido }: { pedido: PedidoKDS }) {
  const [avancarPending, startAvancar] = useTransition()
  const [cancelarPending, startCancelar] = useTransition()
  const numeroCurto = pedido.id.slice(-6).toUpperCase()
  const isSalao = pedido.tipoEntrega === "SALAO_MESA"
  // Para salão: KDS para em PRONTO; CONCLUIDO vem de fecharContaMesaAction
  const isUltimo = pedido.estadoPedido === "CONCLUIDO" || (isSalao && pedido.estadoPedido === "PRONTO")

  function avancar() {
    startAvancar(async () => {
      await avancarPedidoAction(pedido.id)
    })
  }

  function cancelar() {
    startCancelar(async () => {
      await cancelarPedidoAction(pedido.id)
    })
  }

  return (
    <div className="rounded-xl border surface-light shadow-sm p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-xs text-muted-foreground">#{numeroCurto}</p>
          <p className="font-bold text-sm">{pedido.nomeCliente ?? "Cliente"}</p>
          {pedido.funcionarioNome && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" />
              {pedido.funcionarioNome}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="font-bold text-sm">{formatPreco(pedido.total)}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
            <Clock className="h-3 w-3" />
            {formatHora(pedido.criadoEm)}
          </p>
        </div>
      </div>

      {/* Mesa badge */}
      {isSalao && pedido.mesaNumero && (
        <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5">
          <MapPin className="h-3.5 w-3.5 text-amber-600" />
          <span className="text-sm font-semibold text-amber-800">
            Mesa {pedido.mesaNumero}
            {pedido.mesaNome && ` — ${pedido.mesaNome}`}
          </span>
        </div>
      )}

      <div className="space-y-1">
        {pedido.itens.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-2">
            <p className="text-sm flex-1">
              <span className="font-semibold">{item.quantidade}x</span> {item.produto.nome}
              {item.observacao && (
                <span className="ml-1 text-xs text-muted-foreground">({item.observacao})</span>
              )}
            </p>
            {item.produto.destinoPreparo !== "NENHUM" && (
              <Badge
                variant="outline"
                className={`text-xs shrink-0 ${item.produto.destinoPreparo === "BAR" ? "border-blue-300 text-blue-700 bg-blue-50" : "border-orange-300 text-orange-700 bg-orange-50"}`}
              >
                {DESTINO_LABEL[item.produto.destinoPreparo]}
              </Badge>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1">
        <Badge variant="outline" className="text-xs">
          {TIPO_LABEL[pedido.tipoEntrega] ?? pedido.tipoEntrega}
        </Badge>
        <Badge variant="outline" className="text-xs">
          {METODO_LABEL[pedido.metodoPagamento] ?? pedido.metodoPagamento}
        </Badge>
        <Badge
          variant={pedido.estadoPagamento === "PAGO" ? "default" : "secondary"}
          className="text-xs"
        >
          {pedido.estadoPagamento === "PAGO" ? "Pago" : "Pendente"}
        </Badge>
        {hasItemBar(pedido) && (
          <Badge variant="outline" className="text-xs border-blue-300 text-blue-700 bg-blue-50">
            Tem itens bar
          </Badge>
        )}
      </div>

      {pedido.enderecoEntrega && (
        <p className="text-xs text-muted-foreground">
          {pedido.enderecoEntrega.rua}, {pedido.enderecoEntrega.numero} — {pedido.enderecoEntrega.bairro}
        </p>
      )}

      {isSalao && pedido.estadoPedido === "PRONTO" ? (
        <p className="text-xs text-muted-foreground text-center pt-1 border-t">
          Aguardando fechamento pelo garçom
        </p>
      ) : !isUltimo ? (
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            onClick={avancar}
            disabled={avancarPending}
            className="flex-1 text-xs"
          >
            <ArrowRight className="h-3 w-3 mr-1" />
            {avancarPending ? "..." : "Avançar"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={cancelar}
            disabled={cancelarPending}
            className="text-destructive hover:bg-destructive/10 text-xs px-2"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : null}
    </div>
  )
}

const FILTROS: { id: Filtro; label: string }[] = [
  { id: "TODOS", label: "Todos" },
  { id: "DELIVERY", label: "Delivery" },
  { id: "SALAO", label: "Salão" },
  { id: "BAR", label: "Bar / Bebidas" },
]

export function KDSBoard({ pedidos }: { pedidos: PedidoKDS[] }) {
  const router = useRouter()
  const [filtro, setFiltro] = useState<Filtro>("TODOS")

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh()
    }, 10000)
    return () => clearInterval(interval)
  }, [router])

  const pedidosFiltrados = pedidos.filter((p) => {
    if (filtro === "DELIVERY") return p.tipoEntrega === "DELIVERY" || p.tipoEntrega === "RETIRADA_BALCAO"
    if (filtro === "SALAO") return p.tipoEntrega === "SALAO_MESA"
    if (filtro === "BAR") return hasItemBar(p)
    return true
  })

  const porColuna = COLUNAS.map((col) => ({
    ...col,
    pedidos: pedidosFiltrados.filter((p) => p.estadoPedido === col.id),
  }))

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTROS.map((f) => {
          const count = f.id === "TODOS"
            ? pedidos.filter((p) => p.estadoPedido !== "CONCLUIDO").length
            : f.id === "DELIVERY"
              ? pedidos.filter((p) => (p.tipoEntrega === "DELIVERY" || p.tipoEntrega === "RETIRADA_BALCAO") && p.estadoPedido !== "CONCLUIDO").length
              : f.id === "SALAO"
                ? pedidos.filter((p) => p.tipoEntrega === "SALAO_MESA" && p.estadoPedido !== "CONCLUIDO").length
                : pedidos.filter((p) => hasItemBar(p) && p.estadoPedido !== "CONCLUIDO").length

          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFiltro(f.id)}
              className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                filtro === f.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-foreground/30 surface-light"
              }`}
            >
              {f.label}
              {count > 0 && (
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                  filtro === f.id ? "bg-white/20" : "bg-muted"
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {porColuna.map((col) => (
          <div key={col.id} className="flex min-w-0 flex-col gap-3">
            <div className={`flex items-center justify-between rounded-xl px-4 py-2 text-white ${col.headerCor}`}>
              <span className="font-bold text-sm">{col.label}</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                {col.pedidos.length}
              </span>
            </div>
            <div className={`flex-1 rounded-xl border-2 p-3 space-y-3 min-h-[200px] ${col.cor}`}>
              {col.pedidos.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-4">Sem pedidos</p>
              ) : (
                col.pedidos.map((pedido) => (
                  <PedidoCard key={pedido.id} pedido={pedido} />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

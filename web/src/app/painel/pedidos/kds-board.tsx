"use client"

import { useRouter } from "next/navigation"
import { useEffect, useTransition } from "react"
import { ArrowRight, Clock, X } from "lucide-react"

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
  itens: Array<{
    id: string
    quantidade: number
    observacao: string | null
    produto: { nome: string }
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

function formatPreco(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function formatHora(isoString: string) {
  return new Date(isoString).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

function PedidoCard({ pedido }: { pedido: PedidoKDS }) {
  const [avancarPending, startAvancar] = useTransition()
  const [cancelarPending, startCancelar] = useTransition()
  const numeroCurto = pedido.id.slice(-6).toUpperCase()
  const isUltimo = pedido.estadoPedido === "CONCLUIDO"

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
    <div className="rounded-xl border bg-white shadow-sm p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-xs text-muted-foreground">#{numeroCurto}</p>
          <p className="font-bold text-sm">{pedido.nomeCliente ?? "Cliente"}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-sm">{formatPreco(pedido.total)}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
            <Clock className="h-3 w-3" />
            {formatHora(pedido.criadoEm)}
          </p>
        </div>
      </div>

      <div className="space-y-1">
        {pedido.itens.map((item) => (
          <p key={item.id} className="text-sm">
            <span className="font-semibold">{item.quantidade}x</span> {item.produto.nome}
            {item.observacao && (
              <span className="ml-1 text-xs text-muted-foreground">({item.observacao})</span>
            )}
          </p>
        ))}
      </div>

      <div className="flex flex-wrap gap-1">
        <Badge variant="outline" className="text-xs">
          {pedido.tipoEntrega === "DELIVERY" ? "Delivery" : "Retirada"}
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
      </div>

      {pedido.enderecoEntrega && (
        <p className="text-xs text-muted-foreground">
          {pedido.enderecoEntrega.rua}, {pedido.enderecoEntrega.numero} — {pedido.enderecoEntrega.bairro}
        </p>
      )}

      {!isUltimo && (
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
      )}
    </div>
  )
}

export function KDSBoard({ pedidos }: { pedidos: PedidoKDS[] }) {
  const router = useRouter()

  // Poll every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh()
    }, 10000)
    return () => clearInterval(interval)
  }, [router])

  const porColuna = COLUNAS.map((col) => ({
    ...col,
    pedidos: pedidos.filter((p) => p.estadoPedido === col.id),
  }))

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {porColuna.map((col) => (
        <div key={col.id} className="flex w-72 shrink-0 flex-col gap-3">
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
  )
}

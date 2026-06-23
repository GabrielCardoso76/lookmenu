"use client"

import Link from "next/link"
import { useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Wine, UtensilsCrossed, Clock, CheckCheck, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { logoutFuncionarioAction } from "../actions"
import { marcarEntregueBarAction } from "./actions"
import type { AtendimentoSession } from "@/lib/atendimento-session"

type ItemBar = {
  id: string
  quantidade: number
  observacao: string | null
  nomeProduto: string
}

type PedidoBar = {
  id: string
  criadoEm: string
  mesaNumero: string
  mesaNome: string | null
  itens: ItemBar[]
}

type LojaData = {
  nome: string
  slug: string
  corPrimaria: string
  logoUrl: string | null
}

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

function EntregueButton({ loja, pedidoId }: { loja: LojaData; pedidoId: string }) {
  const [pending, startTransition] = useTransition()

  function handleEntregue() {
    startTransition(async () => {
      await marcarEntregueBarAction(loja.slug, pedidoId)
    })
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleEntregue}
      className="flex items-center justify-center gap-2 w-full rounded-xl py-3 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
      style={{ backgroundColor: loja.corPrimaria }}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
      {pending ? "Marcando..." : "Marcar como entregue"}
    </button>
  )
}

export function BarGarcomView({
  loja,
  session,
  pedidos,
}: {
  loja: LojaData
  session: AtendimentoSession
  pedidos: PedidoBar[]
}) {
  const router = useRouter()
  const [logoutPending, startLogout] = useTransition()

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 8000)
    return () => clearInterval(interval)
  }, [router])

  function handleLogout() {
    startLogout(async () => {
      await logoutFuncionarioAction(loja.slug)
    })
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur" style={{ borderBottomColor: `${loja.corPrimaria}33` }}>
        <div className="mx-auto max-w-2xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {loja.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={loja.logoUrl} alt={loja.nome} className="h-9 w-9 rounded-lg object-contain border border-border bg-white p-0.5" />
            ) : (
              <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: loja.corPrimaria }}>
                <UtensilsCrossed className="h-5 w-5 text-white" />
              </div>
            )}
            <div>
              <p className="font-bold text-sm leading-tight">{loja.nome}</p>
              <p className="text-xs text-muted-foreground">{session.funcionarioNome}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href={`/${loja.slug}/atendimento/mesas`}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Mesas
            </Link>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={logoutPending}
              onClick={handleLogout}
              className="gap-1.5 text-muted-foreground"
            >
              Sair
            </Button>
          </div>
        </div>

        {/* Tab nav */}
        <div className="flex border-b">
          <div className="px-4 py-2 border-b-2 font-semibold text-sm flex items-center gap-1.5" style={{ borderColor: loja.corPrimaria, color: loja.corPrimaria }}>
            <Wine className="h-4 w-4" />
            Prontos p/ entregar
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 space-y-4">
        <div>
          <h2 className="text-xl font-bold">Prontos para entregar</h2>
          <p className="text-sm text-muted-foreground">
            Bebidas e itens do bar prontos — atualização a cada 8s
          </p>
        </div>

        {pedidos.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-16 text-center">
            <Wine className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="font-medium text-muted-foreground">Nenhum item aguardando entrega</p>
            <p className="text-sm text-muted-foreground mt-1">Quando a cozinha marcar bebidas como prontas, elas aparecerão aqui</p>
          </div>
        ) : (
          pedidos.map((pedido) => (
            <div
              key={pedido.id}
              className="rounded-2xl border-2 bg-white p-4 space-y-3"
              style={{ borderColor: `${loja.corPrimaria}66` }}
            >
              {/* Mesa header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white"
                    style={{ backgroundColor: loja.corPrimaria }}
                  >
                    {pedido.mesaNumero}
                  </div>
                  <div>
                    <p className="font-bold text-sm">Mesa {pedido.mesaNumero}{pedido.mesaNome ? ` — ${pedido.mesaNome}` : ""}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatHora(pedido.criadoEm)}
                    </p>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-700 border border-blue-200">
                  <Wine className="h-3 w-3 mr-1" />
                  Bar
                </Badge>
              </div>

              {/* Items */}
              <div className="divide-y divide-border rounded-xl border">
                {pedido.itens.map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="font-semibold text-sm">
                        <span className="text-base">{item.quantidade}×</span> {item.nomeProduto}
                      </p>
                      {item.observacao && (
                        <p className="text-xs text-muted-foreground mt-0.5">{item.observacao}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <EntregueButton loja={loja} pedidoId={pedido.id} />
                <Link
                  href={`/${loja.slug}/atendimento/mesas`}
                  className="flex items-center justify-center gap-2 w-full rounded-xl border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-all"
                >
                  Ir para mesas
                </Link>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  )
}

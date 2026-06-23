"use client"

import Link from "next/link"
import { useEffect, useState, useTransition } from "react"
import { UtensilsCrossed, LogOut, Clock, CheckCircle2, Wine } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { logoutFuncionarioAction } from "../actions"
import type { AtendimentoSession } from "@/lib/atendimento-session"

type Mesa = {
  id: string
  numero: string
  nome: string | null
  capacidade: number | null
  pedidoAberto: {
    id: string
    estadoPedido: string
    criadoEm: string
    total: number
  } | null
}

type LojaData = {
  nome: string
  slug: string
  corPrimaria: string
  logoUrl: string | null
}

const ESTADO_LABEL: Record<string, string> = {
  NOVO: "Novo",
  EM_PREPARACAO: "Preparando",
  PRONTO: "Pronto!",
  EM_ENTREGA: "Saiu",
}

function formatPreco(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

export function MesasGarcom({
  loja,
  session,
  mesas,
  pedidoCriadoMsg,
  temProdutosBar = false,
}: {
  loja: LojaData
  session: AtendimentoSession
  mesas: Mesa[]
  pedidoCriadoMsg?: string
  temProdutosBar?: boolean
}) {
  const [logoutPending, startLogout] = useTransition()
  const [toastMsg, setToastMsg] = useState(pedidoCriadoMsg)

  function handleLogout() {
    startLogout(async () => {
      await logoutFuncionarioAction(loja.slug)
    })
  }

  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(undefined), 4000)
      return () => clearTimeout(t)
    }
  }, [toastMsg])

  const livres = mesas.filter((m) => !m.pedidoAberto)
  const ocupadas = mesas.filter((m) => m.pedidoAberto)

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-2xl bg-green-600 px-5 py-3 text-white shadow-xl animate-in slide-in-from-top">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span className="font-medium">{toastMsg}</span>
        </div>
      )}

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
            {temProdutosBar && (
              <Link
                href={`/${loja.slug}/atendimento/bar`}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                <Wine className="h-4 w-4" />
                Prontos p/ entregar
              </Link>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={logoutPending}
              onClick={handleLogout}
              className="gap-1.5 text-muted-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold">Mesas</h2>
          <p className="text-sm text-muted-foreground">{mesas.length} mesa{mesas.length !== 1 ? "s" : ""} ativa{mesas.length !== 1 ? "s" : ""}</p>
        </div>

        {mesas.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <UtensilsCrossed className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>Nenhuma mesa cadastrada.</p>
            <p className="text-sm">Peça ao lojista para cadastrar mesas.</p>
          </div>
        )}

        {ocupadas.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Em atendimento ({ocupadas.length})</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {ocupadas.map((mesa) => (
                <Link
                  key={mesa.id}
                  href={`/${loja.slug}/atendimento/mesas/${mesa.id}`}
                  className="block rounded-2xl border-2 bg-white p-4 transition-all hover:shadow-md active:scale-[0.98]"
                  style={{ borderColor: loja.corPrimaria }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white text-sm" style={{ backgroundColor: loja.corPrimaria }}>
                        {mesa.numero}
                      </div>
                      <div>
                        {mesa.nome && <p className="text-sm font-medium">{mesa.nome}</p>}
                        {mesa.capacidade && <p className="text-xs text-muted-foreground">{mesa.capacidade} pax</p>}
                      </div>
                    </div>
                    <Badge className="text-xs" style={{ backgroundColor: loja.corPrimaria }}>
                      {ESTADO_LABEL[mesa.pedidoAberto!.estadoPedido] ?? mesa.pedidoAberto!.estadoPedido}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatHora(mesa.pedidoAberto!.criadoEm)}
                    </span>
                    <span className="font-bold text-base">{formatPreco(mesa.pedidoAberto!.total)}</span>
                  </div>
                  <p className="mt-2 text-xs font-medium" style={{ color: loja.corPrimaria }}>
                    Ver comanda / adicionar itens →
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {livres.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Livres ({livres.length})</h3>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {livres.map((mesa) => (
                <Link
                  key={mesa.id}
                  href={`/${loja.slug}/atendimento/mesas/${mesa.id}`}
                  className="block rounded-2xl border-2 border-border bg-white p-4 transition-all hover:border-primary/40 hover:shadow-md active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted font-bold text-sm">
                      {mesa.numero}
                    </div>
                    <div>
                      {mesa.nome && <p className="text-sm font-medium">{mesa.nome}</p>}
                      {mesa.capacidade && <p className="text-xs text-muted-foreground">{mesa.capacidade} pax</p>}
                      <Badge variant="secondary" className="text-xs mt-0.5">Livre</Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

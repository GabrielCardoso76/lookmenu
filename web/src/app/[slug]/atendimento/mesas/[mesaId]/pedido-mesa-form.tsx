"use client"

import Link from "next/link"
import { useActionState, useState } from "react"
import { ArrowLeft, Plus, Minus, Trash2, Send, UtensilsCrossed, ClipboardList, X, CreditCard, Banknote } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { criarPedidoMesaAction, fecharContaMesaAction, type PedidoMesaState, type ItemMesa, type FecharContaState } from "../../actions"
import type { AtendimentoSession } from "@/lib/atendimento-session"

type Produto = {
  id: string
  nome: string
  descricao: string
  preco: number
  imagemUrl: string | null
  emDestaque: boolean
  destinoPreparo: string
}

type Categoria = {
  id: string
  nome: string
  produtos: Produto[]
}

type Mesa = {
  id: string
  numero: string
  nome: string | null
}

type LojaData = {
  nome: string
  slug: string
  corPrimaria: string
  logoUrl: string | null
  aceitaCartaoEntrega: boolean
  aceitaDinheiroEntrega: boolean
  pagamentoNaMesa: boolean
  categorias: Categoria[]
}

type CartItem = {
  produto: Produto
  quantidade: number
  observacao: string
}

type ItemComanda = {
  id: string
  quantidade: number
  precoUnitario: number
  observacao: string | null
  produto: { id: string; nome: string }
}

type PedidoAberto = {
  id: string
  estadoPedido: string
  total: number
  criadoEm: string
  itens: ItemComanda[]
}

function formatPreco(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

const DESTINO_LABEL: Record<string, string> = {
  COZINHA: "Cozinha",
  BAR: "Bar",
  NENHUM: "",
}

const ESTADO_LABEL: Record<string, string> = {
  NOVO: "Novo",
  EM_PREPARACAO: "Preparando",
  PRONTO: "Pronto!",
  EM_ENTREGA: "Saiu",
  CONCLUIDO: "Concluído",
}

export function PedidoMesaForm({
  loja,
  mesa,
  session,
  pedidoAberto,
}: {
  loja: LojaData
  mesa: Mesa
  session: AtendimentoSession
  pedidoAberto: PedidoAberto | null
}) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [activeTab, setActiveTab] = useState(loja.categorias[0]?.id ?? "")
  const [cartOpen, setCartOpen] = useState(false)
  const [comandaOpen, setComandaOpen] = useState(false)
  const [fecharOpen, setFecharOpen] = useState(false)
  const [metodoPagamento, setMetodoPagamento] = useState<"DINHEIRO_ENTREGA" | "CARTAO_ENTREGA">("DINHEIRO_ENTREGA")

  const total = cart.reduce((s, i) => s + i.produto.preco * i.quantidade, 0)

  function addItem(produto: Produto) {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.produto.id === produto.id)
      if (idx >= 0) {
        return prev.map((i, j) => j === idx ? { ...i, quantidade: i.quantidade + 1 } : i)
      }
      return [...prev, { produto, quantidade: 1, observacao: "" }]
    })
  }

  function removeItem(produtoId: string) {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.produto.id === produtoId)
      if (idx < 0) return prev
      const item = prev[idx]
      if (item.quantidade <= 1) return prev.filter((_, j) => j !== idx)
      return prev.map((i, j) => j === idx ? { ...i, quantidade: i.quantidade - 1 } : i)
    })
  }

  function deleteItem(produtoId: string) {
    setCart((prev) => prev.filter((i) => i.produto.id !== produtoId))
  }

  function getQty(produtoId: string) {
    return cart.find((i) => i.produto.id === produtoId)?.quantidade ?? 0
  }

  const itens: ItemMesa[] = cart.map((i) => ({
    produtoId: i.produto.id,
    quantidade: i.quantidade,
    precoUnitario: i.produto.preco,
    observacao: i.observacao || undefined,
  }))

  const boundAction = criarPedidoMesaAction.bind(
    null,
    loja.slug,
    mesa.id,
    session.funcionarioId,
    itens,
    loja.pagamentoNaMesa ? metodoPagamento : null,
  )
  const [state, formAction, pending] = useActionState(boundAction, {} as PedidoMesaState)

  const boundFechar = fecharContaMesaAction.bind(null, loja.slug, mesa.id, metodoPagamento)
  const [fecharState, fecharAction, fecharPending] = useActionState(boundFechar, {} as FecharContaState)

  return (
    <div className="min-h-screen bg-neutral-50 pb-32">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur" style={{ borderBottomColor: `${loja.corPrimaria}33` }}>
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/${loja.slug}/atendimento/mesas`}
              className="rounded-full p-1.5 hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <p className="font-bold text-sm leading-tight">Mesa {mesa.numero}{mesa.nome ? ` — ${mesa.nome}` : ""}</p>
              <p className="text-xs text-muted-foreground">{loja.nome} • {session.funcionarioNome}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {pedidoAberto && (
              <button
                type="button"
                onClick={() => setComandaOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                <ClipboardList className="h-4 w-4" />
                Comanda
              </button>
            )}
            {cart.length > 0 && (
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-white"
                style={{ backgroundColor: loja.corPrimaria }}
              >
                <span>{cart.reduce((s, i) => s + i.quantidade, 0)} itens</span>
                <span>• {formatPreco(total)}</span>
              </button>
            )}
          </div>
        </div>

        {/* Category tabs */}
        {loja.categorias.length > 1 && (
          <div className="flex overflow-x-auto gap-1 px-4 pb-3 scrollbar-hide">
            {loja.categorias.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveTab(cat.id)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === cat.id
                    ? "text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
                style={activeTab === cat.id ? { backgroundColor: loja.corPrimaria } : {}}
              >
                {cat.nome}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Comanda aberta banner */}
      {pedidoAberto && (
        <div className="mx-auto max-w-2xl px-4 pt-4">
          <div
            className="flex items-center justify-between rounded-2xl border-2 px-4 py-3"
            style={{ borderColor: `${loja.corPrimaria}66`, backgroundColor: `${loja.corPrimaria}0d` }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: loja.corPrimaria }}>
                <ClipboardList className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold">Comanda aberta</p>
                <p className="text-xs text-muted-foreground">
                  {pedidoAberto.itens.length} item(s) • {formatPreco(pedidoAberto.total)} • desde {formatHora(pedidoAberto.criadoEm)}
                </p>
              </div>
            </div>
            <Badge style={{ backgroundColor: loja.corPrimaria }} className="text-xs text-white">
              {ESTADO_LABEL[pedidoAberto.estadoPedido] ?? pedidoAberto.estadoPedido}
            </Badge>
          </div>
        </div>
      )}

      {/* Products */}
      <main className="mx-auto max-w-2xl px-4 py-4 space-y-2">
        {loja.categorias
          .filter((cat) => !activeTab || cat.id === activeTab)
          .flatMap((cat) =>
            cat.produtos.map((produto) => {
              const qty = getQty(produto.id)
              return (
                <div
                  key={produto.id}
                  className={`flex items-center gap-3 rounded-2xl border bg-white p-4 transition-all ${qty > 0 ? "border-2 shadow-sm" : "border-border"}`}
                  style={qty > 0 ? { borderColor: loja.corPrimaria } : {}}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm">{produto.nome}</h3>
                      {produto.destinoPreparo !== "NENHUM" && (
                        <Badge
                          variant="outline"
                          className={`text-xs ${produto.destinoPreparo === "BAR" ? "border-blue-300 text-blue-700" : "border-orange-300 text-orange-700"}`}
                        >
                          {DESTINO_LABEL[produto.destinoPreparo]}
                        </Badge>
                      )}
                      {produto.emDestaque && (
                        <Badge variant="secondary" className="text-xs">⭐</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{produto.descricao}</p>
                    <p className="mt-1 font-bold text-sm" style={{ color: loja.corPrimaria }}>
                      {formatPreco(produto.preco)}
                    </p>
                  </div>

                  {produto.imagemUrl && (
                    <div className="shrink-0 h-16 w-16 overflow-hidden rounded-xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={produto.imagemUrl} alt={produto.nome} className="h-full w-full object-cover" />
                    </div>
                  )}

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    {qty > 0 ? (
                      <>
                        <button
                          type="button"
                          onClick={() => removeItem(produto.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all active:scale-90"
                          style={{ borderColor: loja.corPrimaria, color: loja.corPrimaria }}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-5 text-center font-bold text-sm">{qty}</span>
                      </>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => addItem(produto)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-all active:scale-90 hover:opacity-90"
                      style={{ backgroundColor: loja.corPrimaria }}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })
          )}
      </main>

      {/* Floating send button */}
      {cart.length > 0 && !cartOpen && (
        <div className="fixed bottom-6 left-0 right-0 mx-auto max-w-2xl px-4">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="w-full flex items-center justify-between rounded-2xl px-5 py-4 text-white font-bold shadow-2xl transition-transform active:scale-[0.98]"
            style={{ backgroundColor: loja.corPrimaria }}
          >
            <span className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-sm">
                {cart.reduce((s, i) => s + i.quantidade, 0)}
              </span>
              {pedidoAberto ? "Adicionar à comanda" : "Ver pedido"}
            </span>
            <span>{formatPreco(total)}</span>
          </button>
        </div>
      )}

      {/* Fechar conta FAB quando não há itens no carrinho */}
      {pedidoAberto && cart.length === 0 && (
        <div className="fixed bottom-6 left-0 right-0 mx-auto max-w-2xl px-4">
          <button
            type="button"
            onClick={() => setFecharOpen(true)}
            className="w-full flex items-center justify-center gap-2 rounded-2xl px-5 py-4 text-white font-bold shadow-2xl transition-transform active:scale-[0.98] bg-green-600"
          >
            <CreditCard className="h-5 w-5" />
            Fechar conta — {formatPreco(pedidoAberto.total)}
          </button>
        </div>
      )}

      {/* Cart modal */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setCartOpen(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white px-5 pt-5 pb-3 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">
                  {pedidoAberto ? "Adicionar à comanda" : "Pedido"} — Mesa {mesa.numero}
                </h2>
                <button type="button" onClick={() => setCartOpen(false)} className="rounded-full p-1 hover:bg-muted">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="px-5 py-4 space-y-3">
              {cart.map((item) => (
                <div key={item.produto.id} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 shrink-0">
                    <button type="button" onClick={() => removeItem(item.produto.id)} className="h-7 w-7 flex items-center justify-center rounded-full border border-border">
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-5 text-center font-bold text-sm">{item.quantidade}</span>
                    <button type="button" onClick={() => addItem(item.produto)} className="h-7 w-7 flex items-center justify-center rounded-full text-white" style={{ backgroundColor: loja.corPrimaria }}>
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.produto.nome}</p>
                    <p className="text-xs text-muted-foreground">{formatPreco(item.produto.preco * item.quantidade)}</p>
                  </div>
                  <button type="button" onClick={() => deleteItem(item.produto.id)} className="shrink-0 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="sticky bottom-0 bg-white border-t px-5 py-4 space-y-3">
              <div className="flex justify-between font-bold text-lg">
                <span>Subtotal novos itens</span>
                <span style={{ color: loja.corPrimaria }}>{formatPreco(total)}</span>
              </div>
              {pedidoAberto && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Total comanda após envio</span>
                  <span className="font-medium">{formatPreco(pedidoAberto.total + total)}</span>
                </div>
              )}

              {/* Seletor de método — apenas se pagamentoNaMesa ativo e sem comanda aberta */}
              {!pedidoAberto && loja.pagamentoNaMesa && (loja.aceitaDinheiroEntrega || loja.aceitaCartaoEntrega) && (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pagamento</p>
                  <div className="flex gap-2">
                    {loja.aceitaDinheiroEntrega && (
                      <button
                        type="button"
                        onClick={() => setMetodoPagamento("DINHEIRO_ENTREGA")}
                        className={`flex-1 rounded-xl border-2 py-2.5 text-sm font-medium transition-all ${
                          metodoPagamento === "DINHEIRO_ENTREGA" ? "border-2" : "border-border"
                        }`}
                        style={metodoPagamento === "DINHEIRO_ENTREGA" ? { borderColor: loja.corPrimaria, color: loja.corPrimaria, backgroundColor: `${loja.corPrimaria}0d` } : {}}
                      >
                        Dinheiro
                      </button>
                    )}
                    {loja.aceitaCartaoEntrega && (
                      <button
                        type="button"
                        onClick={() => setMetodoPagamento("CARTAO_ENTREGA")}
                        className={`flex-1 rounded-xl border-2 py-2.5 text-sm font-medium transition-all ${
                          metodoPagamento === "CARTAO_ENTREGA" ? "border-2" : "border-border"
                        }`}
                        style={metodoPagamento === "CARTAO_ENTREGA" ? { borderColor: loja.corPrimaria, color: loja.corPrimaria, backgroundColor: `${loja.corPrimaria}0d` } : {}}
                      >
                        Cartão
                      </button>
                    )}
                  </div>
                </div>
              )}

              {!loja.pagamentoNaMesa && !pedidoAberto && (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  Pagamento gerenciado externamente — pedido ficará como Pendente.
                </p>
              )}

              {state.error && (
                <p className="text-sm text-destructive text-center">{state.error}</p>
              )}

              <form action={formAction}>
                <Button
                  type="submit"
                  disabled={pending || cart.length === 0}
                  className="w-full rounded-2xl py-5 font-bold text-white text-base gap-2"
                  style={{ backgroundColor: loja.corPrimaria }}
                >
                  <Send className="h-5 w-5" />
                  {pending ? "Enviando..." : pedidoAberto ? "Adicionar à comanda" : "Enviar para cozinha"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Comanda modal */}
      {comandaOpen && pedidoAberto && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setComandaOpen(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white px-5 pt-5 pb-3 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Comanda — Mesa {mesa.numero}</h2>
                  <p className="text-xs text-muted-foreground">Aberta às {formatHora(pedidoAberto.criadoEm)}</p>
                </div>
                <button type="button" onClick={() => setComandaOpen(false)} className="rounded-full p-1 hover:bg-muted">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="px-5 py-4 space-y-2">
              {pedidoAberto.itens.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      <span className="font-bold">{item.quantidade}x</span> {item.produto.nome}
                    </p>
                    {item.observacao && (
                      <p className="text-xs text-muted-foreground">{item.observacao}</p>
                    )}
                  </div>
                  <p className="text-sm font-semibold shrink-0">
                    {formatPreco(item.precoUnitario * item.quantidade)}
                  </p>
                </div>
              ))}
            </div>

            <div className="sticky bottom-0 bg-white border-t px-5 py-4 space-y-3">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span style={{ color: loja.corPrimaria }}>{formatPreco(pedidoAberto.total)}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => { setComandaOpen(false); setCartOpen(false) }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar itens
                </Button>
                <Button
                  type="button"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => { setComandaOpen(false); setFecharOpen(true) }}
                >
                  <CreditCard className="h-4 w-4 mr-1" />
                  Fechar conta
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fechar conta modal */}
      {fecharOpen && pedidoAberto && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setFecharOpen(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white px-5 pt-5 pb-3 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Fechar conta — Mesa {mesa.numero}</h2>
                <button type="button" onClick={() => setFecharOpen(false)} className="rounded-full p-1 hover:bg-muted">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="px-5 py-6 space-y-5">
              <div className="flex justify-between items-center rounded-2xl bg-muted/50 px-4 py-4">
                <span className="font-semibold">Total a pagar</span>
                <span className="text-2xl font-bold" style={{ color: loja.corPrimaria }}>{formatPreco(pedidoAberto.total)}</span>
              </div>

              {loja.pagamentoNaMesa && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Forma de pagamento</p>
                  <div className="grid grid-cols-2 gap-3">
                    {loja.aceitaDinheiroEntrega && (
                      <button
                        type="button"
                        onClick={() => setMetodoPagamento("DINHEIRO_ENTREGA")}
                        className={`flex flex-col items-center gap-2 rounded-2xl border-2 py-4 text-sm font-medium transition-all ${
                          metodoPagamento === "DINHEIRO_ENTREGA" ? "" : "border-border"
                        }`}
                        style={metodoPagamento === "DINHEIRO_ENTREGA" ? { borderColor: loja.corPrimaria, backgroundColor: `${loja.corPrimaria}0d`, color: loja.corPrimaria } : {}}
                      >
                        <Banknote className="h-6 w-6" />
                        Dinheiro
                      </button>
                    )}
                    {loja.aceitaCartaoEntrega && (
                      <button
                        type="button"
                        onClick={() => setMetodoPagamento("CARTAO_ENTREGA")}
                        className={`flex flex-col items-center gap-2 rounded-2xl border-2 py-4 text-sm font-medium transition-all ${
                          metodoPagamento === "CARTAO_ENTREGA" ? "" : "border-border"
                        }`}
                        style={metodoPagamento === "CARTAO_ENTREGA" ? { borderColor: loja.corPrimaria, backgroundColor: `${loja.corPrimaria}0d`, color: loja.corPrimaria } : {}}
                      >
                        <CreditCard className="h-6 w-6" />
                        Cartão
                      </button>
                    )}
                  </div>
                </div>
              )}

              {!loja.pagamentoNaMesa && (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  Pagamento gerenciado externamente. Fechar a conta irá marcar a mesa como livre.
                </p>
              )}

              {fecharState.error && (
                <p className="text-sm text-destructive text-center">{fecharState.error}</p>
              )}

              <form action={fecharAction}>
                <Button
                  type="submit"
                  disabled={fecharPending}
                  className="w-full rounded-2xl py-5 font-bold text-white text-base gap-2 bg-green-600 hover:bg-green-700"
                >
                  <CreditCard className="h-5 w-5" />
                  {fecharPending ? "Fechando..." : "Confirmar pagamento e liberar mesa"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

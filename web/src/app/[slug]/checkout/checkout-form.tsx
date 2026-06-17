"use client"

import Link from "next/link"
import { ArrowLeft, ShoppingBag } from "lucide-react"
import { useActionState, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useCart } from "../carrinho/cart-context"
import { criarPedidoAction } from "./actions"

function formatPreco(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

type LojaData = {
  id: string
  nome: string
  slug: string
  corPrimaria: string
}

export function CheckoutForm({ loja }: { loja: LojaData }) {
  const { items, total, clear } = useCart()
  const [tipoEntrega, setTipoEntrega] = useState<"DELIVERY" | "RETIRADA_BALCAO">("DELIVERY")
  const [metodoPagamento, setMetodoPagamento] = useState<"PIX_ONLINE" | "DINHEIRO_ENTREGA" | "CARTAO_ENTREGA">("PIX_ONLINE")

  const boundAction = criarPedidoAction.bind(null, loja.slug, items.map((i) => ({
    produtoId: i.id,
    quantidade: i.quantidade,
    precoUnitario: i.preco,
    nome: i.nome,
  })))

  const [state, formAction, pending] = useActionState(boundAction, {})

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-50 p-4">
        <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-medium text-muted-foreground">Seu carrinho está vazio</p>
        <Link
          href={`/${loja.slug}`}
          className="rounded-xl px-6 py-3 text-white font-semibold"
          style={{ backgroundColor: loja.corPrimaria }}
        >
          Ver cardápio
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header
        className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur"
        style={{ borderBottomColor: `${loja.corPrimaria}33` }}
      >
        <div className="mx-auto flex max-w-lg items-center gap-4 px-4 py-4">
          <Link href={`/${loja.slug}`} className="rounded-full p-2 hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold" style={{ color: loja.corPrimaria }}>
            Finalizar pedido
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-6 px-4 py-6">
        {/* Resumo do pedido */}
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold">Seu pedido</h2>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.quantidade}x {item.nome}
                </span>
                <span className="font-medium">{formatPreco(item.preco * item.quantidade)}</span>
              </div>
            ))}
          </div>
          <Separator className="my-3" />
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span style={{ color: loja.corPrimaria }}>{formatPreco(total)}</span>
          </div>
        </div>

        <form action={formAction} className="space-y-6">
          {/* Dados pessoais */}
          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm space-y-4">
            <h2 className="font-semibold">Seus dados</h2>
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" name="nome" placeholder="Seu nome" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone / WhatsApp</Label>
              <Input id="telefone" name="telefone" placeholder="(11) 99999-9999" required />
            </div>
          </div>

          {/* Tipo de entrega */}
          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm space-y-4">
            <h2 className="font-semibold">Entrega</h2>
            <div className="grid grid-cols-2 gap-3">
              {(["DELIVERY", "RETIRADA_BALCAO"] as const).map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => setTipoEntrega(tipo)}
                  className={`rounded-xl border-2 p-3 text-sm font-medium transition-all ${
                    tipoEntrega === tipo ? "border-2" : "border-border"
                  }`}
                  style={tipoEntrega === tipo ? { borderColor: loja.corPrimaria, color: loja.corPrimaria, backgroundColor: `${loja.corPrimaria}0d` } : {}}
                >
                  {tipo === "DELIVERY" ? "Delivery" : "Retirar no local"}
                </button>
              ))}
            </div>
            <input type="hidden" name="tipoEntrega" value={tipoEntrega} />

            {tipoEntrega === "DELIVERY" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="rua">Rua</Label>
                    <Input id="rua" name="rua" placeholder="Rua das Flores" required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="numero">Número</Label>
                    <Input id="numero" name="numero" placeholder="123" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input id="bairro" name="bairro" placeholder="Centro" required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input id="cidade" name="cidade" placeholder="São Paulo" required />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="pontoReferencia">Ponto de referência (opcional)</Label>
                  <Input id="pontoReferencia" name="pontoReferencia" placeholder="Próximo ao mercado" />
                </div>
              </div>
            )}
          </div>

          {/* Pagamento */}
          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm space-y-4">
            <h2 className="font-semibold">Pagamento</h2>
            <div className="space-y-2">
              {([
                { id: "PIX_ONLINE", label: "PIX simulado", sub: "Pagamento confirmado automaticamente" },
                { id: "DINHEIRO_ENTREGA", label: "Dinheiro na entrega", sub: "Pague ao receber" },
                { id: "CARTAO_ENTREGA", label: "Cartão na entrega", sub: "Débito ou crédito" },
              ] as const).map((m) => (
                <label
                  key={m.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                    metodoPagamento === m.id ? "border-2" : "border-border"
                  }`}
                  style={metodoPagamento === m.id ? { borderColor: loja.corPrimaria } : {}}
                >
                  <input
                    type="radio"
                    name="metodoPagamento"
                    value={m.id}
                    checked={metodoPagamento === m.id}
                    onChange={() => setMetodoPagamento(m.id)}
                    className="sr-only"
                  />
                  <div
                    className="flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all"
                    style={
                      metodoPagamento === m.id
                        ? { borderColor: loja.corPrimaria, backgroundColor: loja.corPrimaria }
                        : { borderColor: "#d1d5db" }
                    }
                  >
                    {metodoPagamento === m.id && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{m.label}</p>
                    <p className="text-xs text-muted-foreground">{m.sub}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {state.error && (
            <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {state.error}
            </p>
          )}

          <Button
            type="submit"
            disabled={pending}
            className="w-full rounded-2xl py-6 text-base font-bold text-white"
            style={{ backgroundColor: loja.corPrimaria }}
          >
            {pending ? "Enviando pedido..." : `Confirmar pedido • ${formatPreco(total)}`}
          </Button>
        </form>
      </main>
    </div>
  )
}

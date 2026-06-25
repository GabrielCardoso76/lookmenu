"use client"

import Link from "next/link"
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { contrastingTextColor } from "@/lib/utils"
import { useCart } from "./cart-context"

function formatPreco(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function CartBar({ slug, corPrimaria }: { slug: string; corPrimaria: string }) {
  const { items, count, total, increment, decrement, remove } = useCart()
  const [open, setOpen] = useState(false)
  const textoSobrePrimaria = contrastingTextColor(corPrimaria)

  if (count === 0) return null

  return (
    <>
      {/* Floating bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
        <div className="pointer-events-auto mx-auto max-w-3xl">
          <button
            onClick={() => setOpen(true)}
            className="flex w-full items-center justify-between rounded-2xl px-5 py-4 shadow-2xl transition-transform active:scale-[0.98]"
            style={{ backgroundColor: corPrimaria, color: textoSobrePrimaria }}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
                {count}
              </span>
              <span className="font-semibold">Ver carrinho</span>
            </div>
            <span className="font-bold">{formatPreco(total)}</span>
          </button>
        </div>
      </div>

      {/* Drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col">
          <button
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label="Fechar carrinho"
          />
          <div className="relative mt-auto flex max-h-[85vh] flex-col rounded-t-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" style={{ color: corPrimaria }} />
                <h2 className="text-lg font-bold">Carrinho</h2>
                <Badge variant="secondary">{count} {count === 1 ? "item" : "itens"}</Badge>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.nome}</p>
                    <p className="text-sm text-muted-foreground">{formatPreco(item.preco)} cada</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => decrement(item.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-full border hover:bg-muted"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center font-semibold">{item.quantidade}</span>
                    <button
                      onClick={() => increment(item.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-full border hover:bg-muted"
                      style={{ borderColor: corPrimaria, color: corPrimaria }}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => remove(item.id)}
                      className="ml-1 rounded-full p-1 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="w-20 text-right font-semibold shrink-0">
                    {formatPreco(item.preco * item.quantidade)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t px-5 py-4 space-y-3">
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span style={{ color: corPrimaria }}>{formatPreco(total)}</span>
              </div>
              <Link
                href={`/${slug}/checkout`}
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center rounded-xl py-4 font-bold text-base transition-opacity hover:opacity-90"
                style={{ backgroundColor: corPrimaria, color: textoSobrePrimaria }}
              >
                Finalizar pedido
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

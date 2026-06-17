"use client"

import { Flame, Plus } from "lucide-react"

import { useCart } from "../carrinho/cart-context"
import { CartBar } from "../carrinho/cart-drawer"
import type { LojaCardapio } from "./types"

function formatPreco(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function ProdutoCard({
  produto,
  corPrimaria,
  destaque,
}: {
  produto: LojaCardapio["categorias"][0]["produtos"][0]
  corPrimaria: string
  destaque?: boolean
}) {
  const { add } = useCart()

  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur transition-colors hover:bg-white/10">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-white truncate">{produto.nome}</h3>
          {destaque && <Flame className="h-4 w-4 shrink-0" style={{ color: corPrimaria }} />}
        </div>
        <p className="mt-1 text-sm text-white/60 line-clamp-2">{produto.descricao}</p>
        <p className="mt-2 text-lg font-bold" style={{ color: corPrimaria }}>
          {formatPreco(produto.preco)}
        </p>
      </div>
      {produto.imagemUrl && (
        <div className="shrink-0 h-20 w-20 overflow-hidden rounded-lg opacity-90">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={produto.imagemUrl} alt={produto.nome} className="h-full w-full object-cover" />
        </div>
      )}
      <button
        onClick={() => add({ id: produto.id, nome: produto.nome, preco: produto.preco })}
        className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full border-2 text-white transition-all hover:scale-110 active:scale-95"
        style={{ borderColor: corPrimaria, color: corPrimaria }}
        aria-label={`Adicionar ${produto.nome}`}
      >
        <Plus className="h-5 w-5" />
      </button>
    </div>
  )
}

export function DarkTemplate({ loja }: { loja: LojaCardapio }) {
  const { corPrimaria } = loja
  const destaques = loja.categorias.flatMap((c) => c.produtos.filter((p) => p.emDestaque))

  return (
    <div className="min-h-screen bg-gray-950 pb-28">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/10 bg-gray-950/90 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">{loja.nome}</h1>
            <p className="mt-0.5 text-sm text-white/40">Cardápio digital</p>
          </div>
          <div
            className="h-2 w-2 rounded-full animate-pulse"
            style={{ backgroundColor: corPrimaria }}
          />
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-10 px-4 py-8">
        {destaques.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <Flame className="h-5 w-5" style={{ color: corPrimaria }} />
              <h2 className="text-sm font-bold uppercase tracking-widest text-white/70">Destaques</h2>
            </div>
            <div className="space-y-3">
              {destaques.map((produto) => (
                <ProdutoCard key={produto.id} produto={produto} corPrimaria={corPrimaria} destaque />
              ))}
            </div>
          </section>
        )}

        {loja.categorias.map((categoria) => (
          <section key={categoria.id}>
            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-white/40">
              {categoria.nome}
            </h2>
            {categoria.produtos.length === 0 ? (
              <p className="text-sm text-white/40">Sem produtos nesta categoria.</p>
            ) : (
              <div className="space-y-3">
                {categoria.produtos.map((produto) => (
                  <ProdutoCard key={produto.id} produto={produto} corPrimaria={corPrimaria} />
                ))}
              </div>
            )}
          </section>
        ))}
      </main>

      <footer className="py-6 text-center text-xs text-white/20">Powered by LookMenu</footer>

      <CartBar slug={loja.slug} corPrimaria={corPrimaria} />
    </div>
  )
}

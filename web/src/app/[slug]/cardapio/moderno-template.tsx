"use client"

import { Plus, Star } from "lucide-react"

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
    <div
      className={`group relative flex items-center gap-4 rounded-2xl border bg-white p-4 transition-all hover:shadow-lg ${
        destaque ? "border-2" : "border-border"
      }`}
      style={destaque ? { borderColor: corPrimaria } : {}}
    >
      {destaque && (
        <span
          className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: corPrimaria }}
        >
          <Star className="h-3 w-3 fill-current" />
        </span>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground truncate">{produto.nome}</h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{produto.descricao}</p>
        <p className="mt-2 font-bold" style={{ color: corPrimaria }}>
          {formatPreco(produto.preco)}
        </p>
      </div>
      {produto.imagemUrl && (
        <div className="shrink-0 h-20 w-20 overflow-hidden rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={produto.imagemUrl} alt={produto.nome} className="h-full w-full object-cover" />
        </div>
      )}
      <button
        onClick={() => add({ id: produto.id, nome: produto.nome, preco: produto.preco })}
        className="shrink-0 flex h-9 w-9 items-center justify-center rounded-full text-white shadow-md transition-transform active:scale-90 hover:opacity-90"
        style={{ backgroundColor: corPrimaria }}
        aria-label={`Adicionar ${produto.nome}`}
      >
        <Plus className="h-5 w-5" />
      </button>
    </div>
  )
}

export function ModernoTemplate({ loja }: { loja: LojaCardapio }) {
  const { corPrimaria } = loja
  const destaques = loja.categorias.flatMap((c) => c.produtos.filter((p) => p.emDestaque))

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Hero header */}
      <div
        className="relative overflow-hidden px-6 py-10 text-white"
        style={{ backgroundColor: corPrimaria }}
      >
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 80% 20%, white 0%, transparent 60%)`,
        }} />
        <div className="relative mx-auto max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-widest opacity-80">Cardápio Digital</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{loja.nome}</h1>
        </div>
      </div>

      <main className="mx-auto max-w-3xl space-y-10 px-4 py-8">
        {destaques.length > 0 && (
          <section>
            <h2 className="mb-4 text-lg font-extrabold uppercase tracking-wide" style={{ color: corPrimaria }}>
              ★ Em Destaque
            </h2>
            <div className="space-y-3">
              {destaques.map((produto) => (
                <ProdutoCard key={produto.id} produto={produto} corPrimaria={corPrimaria} destaque />
              ))}
            </div>
          </section>
        )}

        {loja.categorias.map((categoria) => (
          <section key={categoria.id}>
            <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">
              {categoria.nome}
            </h2>
            {categoria.produtos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem produtos nesta categoria.</p>
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

      <footer className="py-6 text-center text-xs text-muted-foreground">Powered by LookMenu</footer>

      <CartBar slug={loja.slug} corPrimaria={corPrimaria} />
    </div>
  )
}

"use client"

import { Plus, Star } from "lucide-react"

import { useCart } from "../carrinho/cart-context"
import { CartBar } from "../carrinho/cart-drawer"
import type { LojaCardapio } from "./types"
import { FonteLink, getFontFamily } from "./fonte-utils"

function formatPreco(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function texturaClass(textura: LojaCardapio["texturaFundo"]) {
  switch (textura) {
    case "GRAIN":    return "bg-grain"
    case "DOTS":     return "bg-dots"
    case "WAVES":    return "bg-waves"
    case "STRIPES":  return "bg-stripes"
    case "CHECKS":   return "bg-checks"
    case "CIRCLES":  return "bg-circles"
    case "FOOD":     return "bg-food"
    default:         return ""
  }
}

function ProdutoCard({
  produto,
  corPrimaria,
  destaque,
  lojaFechada,
}: {
  produto: LojaCardapio["categorias"][0]["produtos"][0]
  corPrimaria: string
  destaque?: boolean
  lojaFechada?: boolean
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
        onClick={() => !lojaFechada && add({ id: produto.id, nome: produto.nome, preco: produto.preco })}
        disabled={lojaFechada}
        className="shrink-0 flex h-9 w-9 items-center justify-center rounded-full text-white shadow-md transition-transform active:scale-90 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        style={{ backgroundColor: corPrimaria }}
        aria-label={`Adicionar ${produto.nome}`}
      >
        <Plus className="h-5 w-5" />
      </button>
    </div>
  )
}

export function ModernoTemplate({ loja }: { loja: LojaCardapio }) {
  const { corPrimaria, texturaFundo } = loja
  const subtitulo = loja.subtituloCardapio ?? "Cardápio Digital"
  const destaques = loja.categorias.flatMap((c) => c.produtos.filter((p) => p.emDestaque))
  const fontFamily = getFontFamily(loja.fontePreset)
  const fechada = loja.lojaFechada ?? false

  return (
    <div className={`cardapio-light min-h-screen bg-gray-50 ${texturaClass(texturaFundo)} pb-28`} style={{ fontFamily }}>
      <FonteLink fonte={loja.fontePreset} />
      {/* Hero header */}
      <div
        className="relative overflow-hidden px-6 py-10 text-white"
        style={{ backgroundColor: corPrimaria }}
      >
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 80% 20%, white 0%, transparent 60%)`,
        }} />
        <div className="relative mx-auto max-w-3xl flex items-center gap-4">
          {loja.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={loja.logoUrl}
              alt={`Logo ${loja.nome}`}
              className="h-14 w-14 rounded-xl object-contain bg-white/20 p-1.5 shrink-0"
            />
          )}
          <div>
            <p className="text-sm font-medium uppercase tracking-widest opacity-80">{subtitulo}</p>
            <h1 className="mt-0.5 text-3xl font-extrabold tracking-tight">{loja.nome}</h1>
          </div>
        </div>
      </div>

      {fechada && (
        <div className="mx-auto max-w-3xl px-4 pt-6">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <p className="font-semibold">Estamos fechados no momento</p>
            {loja.mensagemFechada && <p className="mt-0.5 text-amber-700">{loja.mensagemFechada}</p>}
          </div>
        </div>
      )}

      <main className="mx-auto max-w-3xl space-y-10 px-4 py-8">
        {destaques.length > 0 && (
          <section>
            <h2 className="mb-4 text-lg font-extrabold uppercase tracking-wide" style={{ color: corPrimaria }}>
              ★ Em Destaque
            </h2>
            <div className="space-y-3">
              {destaques.map((produto) => (
                <ProdutoCard key={produto.id} produto={produto} corPrimaria={corPrimaria} destaque lojaFechada={fechada} />
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
                  <ProdutoCard key={produto.id} produto={produto} corPrimaria={corPrimaria} lojaFechada={fechada} />
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

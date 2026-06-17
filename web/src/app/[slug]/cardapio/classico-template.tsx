"use client"

import { Plus } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCart } from "../carrinho/cart-context"
import { CartBar } from "../carrinho/cart-drawer"
import type { LojaCardapio } from "./types"

function formatPreco(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function texturaClass(textura: LojaCardapio["texturaFundo"]) {
  switch (textura) {
    case "GRAIN":
      return "bg-grain"
    case "DOTS":
      return "bg-dots"
    case "WAVES":
      return "bg-waves"
    default:
      return ""
  }
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
    <li>
      <Card className={`overflow-hidden transition-shadow hover:shadow-md ${destaque ? "ring-2" : ""}`}
        style={destaque ? { ringColor: corPrimaria } as React.CSSProperties : {}}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-base">{produto.nome}</CardTitle>
            <div className="flex shrink-0 items-center gap-2">
              {destaque && (
                <Badge variant="outline" className="text-xs" style={{ color: corPrimaria, borderColor: corPrimaria }}>
                  Destaque
                </Badge>
              )}
              <Badge
                variant="secondary"
                className="font-bold"
                style={{ color: corPrimaria, backgroundColor: `${corPrimaria}18` }}
              >
                {formatPreco(produto.preco)}
              </Badge>
            </div>
          </div>
          <CardDescription className="text-sm">{produto.descricao}</CardDescription>
        </CardHeader>
        {produto.imagemUrl ? (
          <CardContent className="pt-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={produto.imagemUrl} alt={produto.nome} className="h-40 w-full rounded-md object-cover" />
          </CardContent>
        ) : null}
        <CardContent className="pt-0">
          <button
            onClick={() => add({ id: produto.id, nome: produto.nome, preco: produto.preco })}
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-85 active:scale-95"
            style={{ backgroundColor: corPrimaria }}
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </button>
        </CardContent>
      </Card>
    </li>
  )
}

export function ClassicoTemplate({ loja }: { loja: LojaCardapio }) {
  const { corPrimaria, texturaFundo } = loja
  const destaques = loja.categorias.flatMap((c) => c.produtos.filter((p) => p.emDestaque))

  return (
    <div className={`min-h-screen bg-neutral-50 ${texturaClass(texturaFundo)} pb-28`}>
      <header
        className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur"
        style={{ borderBottomColor: `${corPrimaria}33` }}
      >
        <div className="mx-auto max-w-3xl px-4 py-5">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: corPrimaria }}>
            {loja.nome}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Cardápio digital</p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-4 py-8">
        {destaques.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold" style={{ color: corPrimaria }}>
                ⭐ Destaques
              </h2>
              <Separator className="flex-1" />
            </div>
            <ul className="grid gap-4">
              {destaques.map((produto) => (
                <ProdutoCard key={produto.id} produto={produto} corPrimaria={corPrimaria} destaque />
              ))}
            </ul>
          </section>
        )}

        {loja.categorias.length === 0 ? (
          <p className="text-center text-muted-foreground">Nenhum item disponível no momento.</p>
        ) : (
          loja.categorias.map((categoria) => (
            <section key={categoria.id} className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold">{categoria.nome}</h2>
                <Separator className="flex-1" />
              </div>
              {categoria.produtos.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem produtos nesta categoria.</p>
              ) : (
                <ul className="grid gap-4">
                  {categoria.produtos.map((produto) => (
                    <ProdutoCard key={produto.id} produto={produto} corPrimaria={corPrimaria} />
                  ))}
                </ul>
              )}
            </section>
          ))
        )}
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        Powered by LookMenu
      </footer>

      <CartBar slug={loja.slug} corPrimaria={corPrimaria} />
    </div>
  )
}

import { notFound } from "next/navigation"

import { prisma } from "@/lib/prisma"
import { CartProvider } from "./carrinho/cart-context"
import { ClassicoTemplate } from "./cardapio/classico-template"
import { ModernoTemplate } from "./cardapio/moderno-template"
import { DarkTemplate } from "./cardapio/dark-template"
import type { LojaCardapio } from "./cardapio/types"

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function CardapioPage({ params }: PageProps) {
  const { slug } = await params

  const loja = await prisma.loja.findFirst({
    where: { slug, ativa: true },
    include: {
      categorias: {
        orderBy: { ordem: "asc" },
        include: {
          produtos: {
            where: { disponivel: true },
            orderBy: { nome: "asc" },
          },
        },
      },
    },
  })

  if (!loja) {
    notFound()
  }

  const lojaData: LojaCardapio = {
    id: loja.id,
    nome: loja.nome,
    slug: loja.slug,
    corPrimaria: loja.corPrimaria,
    paletaPreset: loja.paletaPreset,
    texturaFundo: loja.texturaFundo as LojaCardapio["texturaFundo"],
    categorias: loja.categorias.map((cat) => ({
      id: cat.id,
      nome: cat.nome,
      ordem: cat.ordem,
      produtos: cat.produtos.map((p) => ({
        id: p.id,
        nome: p.nome,
        descricao: p.descricao,
        preco: Number(p.preco),
        imagemUrl: p.imagemUrl,
        disponivel: p.disponivel,
        emDestaque: p.emDestaque,
      })),
    })),
  }

  const template = loja.templateCardapio

  return (
    <CartProvider slug={slug}>
      {template === "MODERNO" ? (
        <ModernoTemplate loja={lojaData} />
      ) : template === "DARK" ? (
        <DarkTemplate loja={lojaData} />
      ) : (
        <ClassicoTemplate loja={lojaData} />
      )}
    </CartProvider>
  )
}

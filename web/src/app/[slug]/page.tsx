import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { prisma } from "@/lib/prisma"
import { lojaEstaAberta, tituloAbaCardapio } from "@/lib/loja-config"
import { CartProvider } from "./carrinho/cart-context"
import { ClassicoTemplate } from "./cardapio/classico-template"
import { ModernoTemplate } from "./cardapio/moderno-template"
import { DarkTemplate } from "./cardapio/dark-template"
import type { LojaCardapio } from "./cardapio/types"

type PageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{
    _preview?: string
    _cor?: string
    _template?: string
    _textura?: string
    _fonte?: string
    _logo?: string
    _subtitulo?: string
    _tituloAba?: string
  }>
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const sp = await searchParams

  const loja = await prisma.loja.findFirst({
    where: { slug, ativa: true },
    select: { nome: true, tituloAba: true },
  })

  if (!loja) {
    return { title: "LookMenu" }
  }

  const titulo =
    sp._preview === "1" && sp._tituloAba !== undefined
      ? sp._tituloAba.trim() || loja.nome
      : tituloAbaCardapio(loja)

  return { title: titulo }
}

export default async function CardapioPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const sp = await searchParams
  const isPreview = sp._preview === "1"

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
      horarios: { orderBy: { diaSemana: "asc" } },
    },
  })

  if (!loja) {
    notFound()
  }

  const statusLoja = lojaEstaAberta({
    timezone: loja.timezone,
    horarios: loja.horarios,
  })

  const lojaData: LojaCardapio = {
    id: loja.id,
    nome: loja.nome,
    slug: loja.slug,
    subtituloCardapio:
      isPreview && sp._subtitulo !== undefined
        ? (sp._subtitulo || null)
        : loja.subtituloCardapio ?? null,
    corPrimaria: isPreview && sp._cor ? sp._cor : loja.corPrimaria,
    paletaPreset: loja.paletaPreset,
    texturaFundo: (isPreview && sp._textura ? sp._textura : loja.texturaFundo) as LojaCardapio["texturaFundo"],
    logoUrl: isPreview && sp._logo !== undefined ? (sp._logo || null) : loja.logoUrl,
    fontePreset: isPreview && sp._fonte ? sp._fonte : loja.fontePreset,
    lojaFechada: !statusLoja.aberta,
    mensagemFechada: statusLoja.mensagem,
    proximaAbertura: statusLoja.proximaAbertura,
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
        destinoPreparo: p.destinoPreparo as "COZINHA" | "BAR" | "NENHUM",
      })),
    })),
  }

  const template = isPreview && sp._template ? sp._template : loja.templateCardapio

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

import { redirect } from "next/navigation"

import { prisma } from "@/lib/prisma"
import { getAtendimentoSession } from "@/lib/atendimento-session"
import { PedidoMesaForm } from "./pedido-mesa-form"

type PageProps = {
  params: Promise<{ slug: string; mesaId: string }>
}

export default async function MesaAtendimentoPage({ params }: PageProps) {
  const { slug, mesaId } = await params

  const session = await getAtendimentoSession(slug)
  if (!session) redirect(`/${slug}/atendimento`)

  const [loja, mesa] = await Promise.all([
    prisma.loja.findFirst({
      where: { slug, ativa: true },
      select: {
        id: true,
        nome: true,
        slug: true,
        corPrimaria: true,
        logoUrl: true,
        aceitaCartaoEntrega: true,
        aceitaDinheiroEntrega: true,
        pagamentoNaMesa: true,
        categorias: {
          orderBy: { ordem: "asc" },
          include: {
            produtos: {
              where: { disponivel: true },
              orderBy: { nome: "asc" },
              select: {
                id: true,
                nome: true,
                descricao: true,
                preco: true,
                imagemUrl: true,
                emDestaque: true,
                destinoPreparo: true,
              },
            },
          },
        },
      },
    }),
    prisma.mesa.findFirst({
      where: { id: mesaId, lojaId: session.lojaId, ativa: true },
    }),
  ])

  if (!loja || !mesa) redirect(`/${slug}/atendimento/mesas`)

  const pedidoAberto = await prisma.pedido.findFirst({
    where: {
      mesaId: mesa.id,
      lojaId: loja.id,
      tipoEntrega: "SALAO_MESA",
      estadoPedido: { notIn: ["CONCLUIDO", "CANCELADO"] },
    },
    select: {
      id: true,
      estadoPedido: true,
      total: true,
      criadoEm: true,
      itens: {
        select: {
          id: true,
          quantidade: true,
          precoUnitario: true,
          observacao: true,
          produto: { select: { id: true, nome: true } },
        },
      },
    },
  })

  return (
    <PedidoMesaForm
      loja={{
        nome: loja.nome,
        slug: loja.slug,
        corPrimaria: loja.corPrimaria,
        logoUrl: loja.logoUrl,
        aceitaCartaoEntrega: loja.aceitaCartaoEntrega,
        aceitaDinheiroEntrega: loja.aceitaDinheiroEntrega,
        pagamentoNaMesa: loja.pagamentoNaMesa,
        categorias: loja.categorias.map((cat) => ({
          id: cat.id,
          nome: cat.nome,
          produtos: cat.produtos.map((p) => ({
            id: p.id,
            nome: p.nome,
            descricao: p.descricao,
            preco: Number(p.preco),
            imagemUrl: p.imagemUrl,
            emDestaque: p.emDestaque,
            destinoPreparo: p.destinoPreparo,
          })),
        })),
      }}
      mesa={{ id: mesa.id, numero: mesa.numero, nome: mesa.nome }}
      session={session}
      pedidoAberto={
        pedidoAberto
          ? {
              id: pedidoAberto.id,
              estadoPedido: pedidoAberto.estadoPedido,
              total: Number(pedidoAberto.total),
              criadoEm: pedidoAberto.criadoEm.toISOString(),
              itens: pedidoAberto.itens.map((item) => ({
                id: item.id,
                quantidade: item.quantidade,
                precoUnitario: Number(item.precoUnitario),
                observacao: item.observacao,
                produto: item.produto,
              })),
            }
          : null
      }
    />
  )
}

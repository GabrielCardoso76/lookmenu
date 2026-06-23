import { redirect } from "next/navigation"

import { prisma } from "@/lib/prisma"
import { getAtendimentoSession } from "@/lib/atendimento-session"
import { BarGarcomView } from "./bar-garcom-view"

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function BarAtendimentoPage({ params }: PageProps) {
  const { slug } = await params

  const session = await getAtendimentoSession(slug)
  if (!session) redirect(`/${slug}/atendimento`)

  const loja = await prisma.loja.findFirst({
    where: { slug, ativa: true },
    select: { id: true, nome: true, slug: true, corPrimaria: true, logoUrl: true },
  })
  if (!loja) redirect("/")

  const pedidos = await prisma.pedido.findMany({
    where: {
      lojaId: loja.id,
      tipoEntrega: "SALAO_MESA",
      estadoPedido: "PRONTO",
      entregueBarEm: null,
      itens: {
        some: {
          produto: { destinoPreparo: "BAR" },
        },
      },
    },
    orderBy: { criadoEm: "asc" },
    select: {
      id: true,
      criadoEm: true,
      mesa: { select: { numero: true, nome: true } },
      itens: {
        where: { produto: { destinoPreparo: "BAR" } },
        select: {
          id: true,
          quantidade: true,
          observacao: true,
          produto: { select: { nome: true, destinoPreparo: true } },
        },
      },
    },
  })

  const rows = pedidos.map((p) => ({
    id: p.id,
    criadoEm: p.criadoEm.toISOString(),
    mesaNumero: p.mesa?.numero ?? "?",
    mesaNome: p.mesa?.nome ?? null,
    itens: p.itens.map((item) => ({
      id: item.id,
      quantidade: item.quantidade,
      observacao: item.observacao,
      nomeProduto: item.produto.nome,
    })),
  }))

  return (
    <BarGarcomView
      loja={{ nome: loja.nome, slug: loja.slug, corPrimaria: loja.corPrimaria, logoUrl: loja.logoUrl }}
      session={session}
      pedidos={rows}
    />
  )
}

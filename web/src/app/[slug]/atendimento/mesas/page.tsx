import { redirect } from "next/navigation"

import { prisma } from "@/lib/prisma"
import { getAtendimentoSession } from "@/lib/atendimento-session"
import { MesasGarcom } from "./mesas-garcom"

type PageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ pedido?: string; mesa?: string; fechou?: string }>
}

export default async function MesasAtendimentoPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { pedido: pedidoCriado, mesa: mesaCriada, fechou } = await searchParams

  const session = await getAtendimentoSession(slug)
  if (!session) redirect(`/${slug}/atendimento`)

  const [loja, mesas, produtoBarCount] = await Promise.all([
    prisma.loja.findFirst({
      where: { slug, ativa: true },
      select: { id: true, nome: true, slug: true, corPrimaria: true, logoUrl: true },
    }),
    prisma.mesa.findMany({
      where: { lojaId: session.lojaId, ativa: true },
      orderBy: { numero: "asc" },
      include: {
        pedidos: {
          where: { estadoPedido: { notIn: ["CONCLUIDO", "CANCELADO"] } },
          select: { id: true, estadoPedido: true, criadoEm: true, total: true },
          orderBy: { criadoEm: "desc" },
          take: 1,
        },
      },
    }),
    prisma.produto.count({ where: { categoria: { lojaId: session.lojaId }, destinoPreparo: "BAR", disponivel: true } }),
  ])

  if (!loja) redirect("/")

  return (
    <MesasGarcom
      loja={{ nome: loja.nome, slug: loja.slug, corPrimaria: loja.corPrimaria, logoUrl: loja.logoUrl }}
      session={session}
      mesas={mesas.map((m) => ({
        id: m.id,
        numero: m.numero,
        nome: m.nome,
        capacidade: m.capacidade,
        pedidoAberto: m.pedidos[0]
          ? {
              id: m.pedidos[0].id,
              estadoPedido: m.pedidos[0].estadoPedido,
              criadoEm: m.pedidos[0].criadoEm.toISOString(),
              total: Number(m.pedidos[0].total),
            }
          : null,
      }))}
      pedidoCriadoMsg={pedidoCriado ? `Pedido enviado para mesa ${mesaCriada}!` : fechou ? `Mesa ${fechou} fechada e liberada!` : undefined}
      temProdutosBar={produtoBarCount > 0}
    />
  )
}

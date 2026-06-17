import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard-shell"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { KDSBoard, type PedidoKDS } from "./kds-board"

const PAINEL_NAV = [
  { href: "/painel", label: "Início" },
  { href: "/painel/pedidos", label: "Pedidos" },
  { href: "/painel/categorias", label: "Categorias" },
  { href: "/painel/produtos", label: "Produtos" },
  { href: "/painel/aparencia", label: "Aparência" },
]

export default async function PedidosPage() {
  const session = await getSession()
  if (!session || session.papel !== "LOJISTA" || !session.lojaId) redirect("/login")

  const pedidos = await prisma.pedido.findMany({
    where: {
      lojaId: session.lojaId,
      estadoPedido: { notIn: ["CANCELADO"] },
    },
    orderBy: { criadoEm: "desc" },
    include: {
      itens: {
        include: { produto: { select: { nome: true } } },
      },
      enderecoEntrega: {
        select: { rua: true, numero: true, bairro: true, cidade: true },
      },
    },
    take: 100,
  })

  const pedidosData: PedidoKDS[] = pedidos.map((p) => ({
    id: p.id,
    estadoPedido: p.estadoPedido,
    tipoEntrega: p.tipoEntrega,
    total: Number(p.total),
    criadoEm: p.criadoEm.toISOString(),
    nomeCliente: p.nomeCliente,
    metodoPagamento: p.metodoPagamento,
    estadoPagamento: p.estadoPagamento,
    itens: p.itens.map((i) => ({
      id: i.id,
      quantidade: i.quantidade,
      observacao: i.observacao,
      produto: { nome: i.produto.nome },
    })),
    enderecoEntrega: p.enderecoEntrega
      ? {
          rua: p.enderecoEntrega.rua,
          numero: p.enderecoEntrega.numero,
          bairro: p.enderecoEntrega.bairro,
          cidade: p.enderecoEntrega.cidade,
        }
      : null,
  }))

  return (
    <DashboardShell user={session} title="Painel da loja" nav={PAINEL_NAV}>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Pedidos</h2>
        <p className="text-sm text-muted-foreground">
          Kanban de pedidos — atualiza automaticamente a cada 10 segundos
        </p>
      </div>

      <KDSBoard pedidos={pedidosData} />
    </DashboardShell>
  )
}

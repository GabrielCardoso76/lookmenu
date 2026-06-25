import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { notFound } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { prisma } from "@/lib/prisma"

type PageProps = {
  params: Promise<{ slug: string; id: string }>
}

function formatPreco(value: number | { toString(): string }) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

const ESTADO_LABEL: Record<string, string> = {
  NOVO: "Recebido",
  EM_PREPARACAO: "Em preparação",
  PRONTO: "Pronto",
  EM_ENTREGA: "Em entrega",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
}

const PAGAMENTO_LABEL: Record<string, string> = {
  PIX_ONLINE: "PIX",
  DINHEIRO_ENTREGA: "Dinheiro na entrega",
  CARTAO_ENTREGA: "Cartão na entrega",
}

export default async function PedidoConfirmacaoPage({ params }: PageProps) {
  const { slug, id } = await params

  const pedido = await prisma.pedido.findFirst({
    where: { id, loja: { slug } },
    include: {
      loja: { select: { nome: true, corPrimaria: true, slug: true } },
      itens: {
        include: { produto: { select: { nome: true } } },
      },
      enderecoEntrega: true,
    },
  })

  if (!pedido) notFound()

  const loja = pedido.loja
  const numeroCurto = pedido.id.slice(-6).toUpperCase()

  return (
    <div className="cardapio-light min-h-screen bg-neutral-50 text-foreground">
      <main className="mx-auto max-w-lg space-y-6 px-4 py-10">
        {/* Success header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: `${loja.corPrimaria}18` }}
          >
            <CheckCircle2 className="h-10 w-10" style={{ color: loja.corPrimaria }} />
          </div>
          <h1 className="text-2xl font-extrabold">Pedido recebido!</h1>
          <p className="text-muted-foreground">
            Pedido{" "}
            <span className="font-mono font-bold text-foreground">#{numeroCurto}</span> em{" "}
            <span className="font-semibold">{loja.nome}</span>
          </p>
        </div>

        {/* Status */}
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Status</span>
            <Badge>{ESTADO_LABEL[pedido.estadoPedido] ?? pedido.estadoPedido}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Pagamento</span>
            <div className="flex items-center gap-2">
              <Badge variant={pedido.estadoPagamento === "PAGO" ? "default" : "secondary"}>
                {pedido.estadoPagamento === "PAGO" ? "Pago" : "Pendente"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {PAGAMENTO_LABEL[pedido.metodoPagamento]}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Entrega</span>
            <span className="text-sm font-medium">
              {pedido.tipoEntrega === "DELIVERY" ? "Delivery" : "Retirar no local"}
            </span>
          </div>
        </div>

        {/* Itens */}
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold">Itens do pedido</h2>
          <div className="space-y-2">
            {pedido.itens.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.quantidade}x {item.produto.nome}
                </span>
                <span className="font-medium">
                  {formatPreco(Number(item.precoUnitario) * item.quantidade)}
                </span>
              </div>
            ))}
          </div>
          <Separator className="my-3" />
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span style={{ color: loja.corPrimaria }}>{formatPreco(pedido.total)}</span>
          </div>
        </div>

        {/* Endereço se delivery */}
        {pedido.enderecoEntrega && (
          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <h2 className="mb-2 font-semibold">Endereço de entrega</h2>
            <p className="text-sm text-muted-foreground">
              {pedido.enderecoEntrega.rua}, {pedido.enderecoEntrega.numero} —{" "}
              {pedido.enderecoEntrega.bairro}, {pedido.enderecoEntrega.cidade}
            </p>
            {pedido.enderecoEntrega.pontoReferencia && (
              <p className="mt-1 text-xs text-muted-foreground">
                Ref: {pedido.enderecoEntrega.pontoReferencia}
              </p>
            )}
          </div>
        )}

        <Link
          href={`/${loja.slug}`}
          className="flex w-full items-center justify-center rounded-2xl py-4 text-white font-bold"
          style={{ backgroundColor: loja.corPrimaria }}
        >
          Voltar ao cardápio
        </Link>
      </main>
    </div>
  )
}

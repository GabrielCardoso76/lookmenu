import { notFound } from "next/navigation"

import { prisma } from "@/lib/prisma"
import { CartProvider } from "../carrinho/cart-context"
import { CheckoutForm } from "./checkout-form"

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function CheckoutPage({ params }: PageProps) {
  const { slug } = await params

  const loja = await prisma.loja.findFirst({
    where: { slug, ativa: true },
    select: {
      id: true,
      nome: true,
      slug: true,
      corPrimaria: true,
      aceitaPixSite: true,
      aceitaCartaoEntrega: true,
      aceitaDinheiroEntrega: true,
      pagamentoNoSite: true,
      pedidoMinimo: true,
      taxaEntregaFixa: true,
      freteGratisAcima: true,
    },
  })

  if (!loja) notFound()

  const lojaSerializable = {
    ...loja,
    pedidoMinimo: loja.pedidoMinimo ? Number(loja.pedidoMinimo) : null,
    taxaEntregaFixa: loja.taxaEntregaFixa ? Number(loja.taxaEntregaFixa) : null,
    freteGratisAcima: loja.freteGratisAcima ? Number(loja.freteGratisAcima) : null,
  }

  return (
    <CartProvider slug={slug}>
      <CheckoutForm loja={lojaSerializable} />
    </CartProvider>
  )
}

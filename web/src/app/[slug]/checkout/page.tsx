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
    select: { id: true, nome: true, slug: true, corPrimaria: true },
  })

  if (!loja) notFound()

  return (
    <CartProvider slug={slug}>
      <CheckoutForm loja={loja} />
    </CartProvider>
  )
}

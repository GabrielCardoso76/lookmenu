"use server"

import { revalidatePath } from "next/cache"

import { prisma } from "@/lib/prisma"
import { getAtendimentoSession } from "@/lib/atendimento-session"

export async function marcarEntregueBarAction(slug: string, pedidoId: string): Promise<void> {
  const session = await getAtendimentoSession(slug)
  if (!session) throw new Error("Não autorizado")

  const loja = await prisma.loja.findFirst({ where: { slug, ativa: true }, select: { id: true } })
  if (!loja) throw new Error("Loja não encontrada")

  await prisma.pedido.updateMany({
    where: { id: pedidoId, lojaId: loja.id },
    data: { entregueBarEm: new Date() },
  })

  revalidatePath(`/${slug}/atendimento/bar`)
}

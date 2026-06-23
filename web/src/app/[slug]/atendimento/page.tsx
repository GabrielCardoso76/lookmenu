import { redirect } from "next/navigation"

import { prisma } from "@/lib/prisma"
import { getAtendimentoSession } from "@/lib/atendimento-session"
import { AtendimentoLogin } from "./atendimento-login"

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function AtendimentoPage({ params }: PageProps) {
  const { slug } = await params

  // Se já logado, redirecionar para mesas
  const session = await getAtendimentoSession(slug)
  if (session) redirect(`/${slug}/atendimento/mesas`)

  const loja = await prisma.loja.findFirst({
    where: { slug, ativa: true },
    select: {
      id: true,
      nome: true,
      slug: true,
      corPrimaria: true,
      logoUrl: true,
      funcionarios: {
        where: { ativo: true },
        orderBy: { nome: "asc" },
        select: { id: true, nome: true },
      },
    },
  })

  if (!loja) redirect("/")

  return (
    <AtendimentoLogin
      loja={{
        nome: loja.nome,
        slug: loja.slug,
        corPrimaria: loja.corPrimaria,
        logoUrl: loja.logoUrl,
      }}
      funcionarios={loja.funcionarios}
    />
  )
}

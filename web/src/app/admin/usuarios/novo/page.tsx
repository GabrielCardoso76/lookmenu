import Link from "next/link"
import { redirect } from "next/navigation"

import { NovoLojistaForm } from "@/app/admin/usuarios/novo/novo-lojista-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardShell } from "@/components/dashboard-shell"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export default async function NovoLojistaPage() {
  const session = await getSession()
  if (!session || session.papel !== "SUPER_ADMIN") redirect("/login")

  const lojas = await prisma.loja.findMany({
    orderBy: { nome: "asc" },
    include: {
      usuarios: {
        where: { papel: "LOJISTA", ativo: true },
        take: 1,
      },
    },
  })

  const lojasOptions = lojas.map((loja) => ({
    id: loja.id,
    nome: loja.nome,
    slug: loja.slug,
    temLojista: loja.usuarios.length > 0,
  }))

  return (
    <DashboardShell
      user={session}
      title="Admin geral"
      nav={[
        { href: "/admin", label: "Lojas" },
        { href: "/admin/lojas/nova", label: "Nova loja" },
        { href: "/admin/usuarios/novo", label: "Novo lojista" },
      ]}
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Novo lojista</h2>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin">Voltar</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Criar usuário LOJISTA</CardTitle>
        </CardHeader>
        <CardContent>
          <NovoLojistaForm lojas={lojasOptions} />
        </CardContent>
      </Card>
    </DashboardShell>
  )
}

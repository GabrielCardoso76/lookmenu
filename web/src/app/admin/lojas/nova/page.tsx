import Link from "next/link"
import { redirect } from "next/navigation"

import { NovaLojaForm } from "@/app/admin/lojas/nova/nova-loja-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardShell } from "@/components/dashboard-shell"
import { getSession } from "@/lib/auth"

export default async function NovaLojaPage() {
  const session = await getSession()
  if (!session || session.papel !== "SUPER_ADMIN") redirect("/login")

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
        <h2 className="text-2xl font-semibold">Nova loja</h2>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin">Voltar</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Dados da loja</CardTitle>
        </CardHeader>
        <CardContent>
          <NovaLojaForm />
        </CardContent>
      </Card>
    </DashboardShell>
  )
}

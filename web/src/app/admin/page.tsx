import Link from "next/link"
import { redirect } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DashboardShell } from "@/components/dashboard-shell"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { toggleLojaAtivaAction } from "./actions"

function ToggleLojaForm({ lojaId, ativa }: { lojaId: string; ativa: boolean }) {
  const action = toggleLojaAtivaAction.bind(null, lojaId)
  return (
    <form action={action} className="inline">
      <Button type="submit" variant={ativa ? "destructive" : "default"} size="sm">
        {ativa ? "Desativar" : "Ativar"}
      </Button>
    </form>
  )
}

export default async function AdminDashboardPage() {
  const session = await getSession()
  if (!session || session.papel !== "SUPER_ADMIN") redirect("/login")

  const lojas = await prisma.loja.findMany({
    orderBy: { criadoEm: "desc" },
    include: {
      usuarios: {
        where: { papel: "LOJISTA" },
        take: 3,
      },
    },
  })

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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Lojas</h2>
          <p className="text-sm text-muted-foreground">Gerencie todas as lojas da plataforma</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/usuarios/novo">Novo lojista</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/lojas/nova">Nova loja</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{lojas.length} loja(s)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Lojista</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lojas.map((loja) => {
                const lojista = loja.usuarios[0]
                return (
                  <TableRow key={loja.id}>
                    <TableCell className="font-medium">{loja.nome}</TableCell>
                    <TableCell>
                      <Link href={`/${loja.slug}`} className="text-primary hover:underline" target="_blank">
                        /{loja.slug}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={loja.ativa ? "default" : "secondary"}>
                        {loja.ativa ? "Ativa" : "Inativa"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {lojista ? (
                        <span className="flex items-center gap-2 text-sm">
                          {lojista.nome}
                          <Badge variant={lojista.ativo ? "outline" : "secondary"} className="text-xs">
                            {lojista.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Sem lojista</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <ToggleLojaForm lojaId={loja.id} ativa={loja.ativa} />
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/lojas/${loja.id}`}>Editar</Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardShell>
  )
}

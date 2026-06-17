import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { EditarLojaForm } from "@/app/admin/lojas/[id]/editar-loja-form"
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
import { toggleUsuarioAtivoAction } from "@/app/admin/actions"

type PageProps = {
  params: Promise<{ id: string }>
}

function ToggleUsuarioForm({ usuarioId, ativo }: { usuarioId: string; ativo: boolean }) {
  const action = toggleUsuarioAtivoAction.bind(null, usuarioId)
  return (
    <form action={action} className="inline">
      <Button type="submit" variant={ativo ? "destructive" : "default"} size="sm">
        {ativo ? "Desativar login" : "Ativar login"}
      </Button>
    </form>
  )
}

export default async function EditarLojaPage({ params }: PageProps) {
  const session = await getSession()
  if (!session || session.papel !== "SUPER_ADMIN") redirect("/login")

  const { id } = await params
  const loja = await prisma.loja.findUnique({
    where: { id },
    include: {
      usuarios: {
        where: { papel: "LOJISTA" },
        orderBy: { criadoEm: "desc" },
      },
    },
  })
  if (!loja) notFound()

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
          <h2 className="text-2xl font-semibold">{loja.nome}</h2>
          <p className="text-sm text-muted-foreground">
            Cardápio público:{" "}
            <Link href={`/${loja.slug}`} className="text-primary hover:underline" target="_blank">
              /{loja.slug}
            </Link>
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin">Voltar</Link>
        </Button>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Editar loja</CardTitle>
          </CardHeader>
          <CardContent>
            <EditarLojaForm loja={loja} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lojistas da loja</CardTitle>
          </CardHeader>
          <CardContent>
            {loja.usuarios.length === 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Nenhum lojista cadastrado.</p>
                <Button asChild size="sm">
                  <Link href="/admin/usuarios/novo">Criar lojista</Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loja.usuarios.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.nome}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                      <TableCell>
                        <Badge variant={u.ativo ? "default" : "secondary"}>
                          {u.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <ToggleUsuarioForm usuarioId={u.id} ativo={u.ativo} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}

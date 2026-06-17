import { redirect } from "next/navigation"

import { AparenciaForm } from "@/app/painel/aparencia/aparencia-form"
import { DashboardShell } from "@/components/dashboard-shell"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const PAINEL_NAV = [
  { href: "/painel", label: "Início" },
  { href: "/painel/pedidos", label: "Pedidos" },
  { href: "/painel/categorias", label: "Categorias" },
  { href: "/painel/produtos", label: "Produtos" },
  { href: "/painel/aparencia", label: "Aparência" },
]

export default async function AparenciaPage() {
  const session = await getSession()
  if (!session || session.papel !== "LOJISTA" || !session.lojaId) redirect("/login")

  const loja = await prisma.loja.findUnique({ where: { id: session.lojaId } })
  if (!loja) redirect("/login")

  return (
    <DashboardShell user={session} title="Painel da loja" nav={PAINEL_NAV}>
      <h2 className="mb-6 text-2xl font-semibold">Aparência</h2>

      <div className="flex gap-6 min-h-[600px]">
        {/* Formulário — 40% */}
        <div className="w-[40%] shrink-0 space-y-0">
          <AparenciaForm
            loja={{
              nome: loja.nome,
              slug: loja.slug,
              corPrimaria: loja.corPrimaria,
              templateCardapio: loja.templateCardapio,
              paletaPreset: loja.paletaPreset,
              texturaFundo: loja.texturaFundo,
            }}
          />
        </div>

        {/* Preview — 60% */}
        <div className="flex-1 hidden lg:flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Preview do cardápio</p>
            <a
              href={`/${loja.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline"
            >
              Abrir em nova aba ↗
            </a>
          </div>
          <div className="flex-1 overflow-hidden rounded-2xl border border-border shadow-inner bg-gray-100">
            <iframe
              src={`/${loja.slug}`}
              className="h-full w-full"
              style={{ minHeight: "560px" }}
              title="Preview do cardápio"
            />
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}

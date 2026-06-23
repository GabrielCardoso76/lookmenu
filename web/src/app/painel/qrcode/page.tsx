import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard-shell"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PAINEL_NAV } from "@/app/painel/nav"
import { gerarQRCodeAction } from "./actions"
import { QRCard, QREmptyState } from "./qrcode-client"

const APP_URL = process.env.APP_URL ?? "http://localhost:3000"

export default async function QRCodePage() {
  const session = await getSession()
  if (!session || session.papel !== "LOJISTA" || !session.lojaId) redirect("/login")

  const loja = await prisma.loja.findUnique({
    where: { id: session.lojaId },
    select: { slug: true, nome: true },
  })
  if (!loja) redirect("/login")

  const mesas = await prisma.mesa.findMany({
    where: { lojaId: session.lojaId, ativa: true },
    orderBy: { numero: "asc" },
    select: { id: true, numero: true, nome: true },
  })

  const cardapioUrl = `${APP_URL}/${loja.slug}`
  const cardapioQR = await gerarQRCodeAction(cardapioUrl)

  const mesasComQR = await Promise.all(
    mesas.map(async (mesa) => {
      const url = `${APP_URL}/${loja.slug}?mesa=${mesa.numero}`
      const dataUrl = await gerarQRCodeAction(url)
      return { ...mesa, url, dataUrl }
    }),
  )

  return (
    <DashboardShell user={session} title="Painel da loja" nav={PAINEL_NAV}>
      <h2 className="mb-2 text-2xl font-semibold">QR Codes</h2>
      <p className="mb-8 text-sm text-muted-foreground">
        Imprima ou compartilhe QR Codes para o cardápio completo e para cada mesa.
      </p>

      {/* Cardápio geral */}
      <section className="mb-10">
        <h3 className="mb-4 text-lg font-semibold">Cardápio</h3>
        <div className="w-fit">
          <QRCard
            label={loja.nome}
            url={cardapioUrl}
            dataUrl={cardapioQR}
            filename={`qr-cardapio-${loja.slug}.png`}
          />
        </div>
      </section>

      {/* Mesas */}
      <section>
        <h3 className="mb-1 text-lg font-semibold">Mesas</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Cada QR aponta para <code className="rounded bg-muted px-1 py-0.5 text-xs">{APP_URL}/{loja.slug}?mesa=N</code>.
          O cliente abre o cardápio já vinculado à mesa.
        </p>

        {mesasComQR.length === 0 ? (
          <QREmptyState />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {mesasComQR.map((mesa) => (
              <QRCard
                key={mesa.id}
                label={mesa.nome ? `Mesa ${mesa.numero} — ${mesa.nome}` : `Mesa ${mesa.numero}`}
                url={mesa.url}
                dataUrl={mesa.dataUrl}
                filename={`qr-mesa-${mesa.numero}-${loja.slug}.png`}
              />
            ))}
          </div>
        )}
      </section>
    </DashboardShell>
  )
}

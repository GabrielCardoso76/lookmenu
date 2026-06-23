import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard-shell"
import { getSession } from "@/lib/auth"
import { PAINEL_NAV } from "@/app/painel/nav"
import { getWhatsAppStatusAction } from "./actions"
import { WhatsAppClient } from "./whatsapp-client"

export default async function WhatsAppPage() {
  const session = await getSession()
  if (!session || session.papel !== "LOJISTA" || !session.lojaId) redirect("/login")

  const status = await getWhatsAppStatusAction()

  return (
    <DashboardShell user={session} title="Painel da loja" nav={PAINEL_NAV}>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">WhatsApp</h2>
        <p className="text-sm text-muted-foreground">
          Conecte o WhatsApp da loja para enviar mensagens automáticas aos clientes.
        </p>
      </div>

      <div className="max-w-lg">
        <WhatsAppClient initialStatus={status} />
      </div>
    </DashboardShell>
  )
}

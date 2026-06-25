import Link from "next/link"
import { redirect } from "next/navigation"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardShell } from "@/components/dashboard-shell"
import { getSession } from "@/lib/auth"
import { PAINEL_NAV } from "@/app/painel/nav"
import { SuporteForm } from "./suporte-form"

const FAQ = [
  {
    q: "Como altero as cores e o template do meu cardápio?",
    href: "/painel/aparencia",
    interno: true,
  },
  {
    q: "Como configuro o horário de funcionamento?",
    href: "/painel/configuracoes",
    interno: true,
  },
  {
    q: "Como conecto meu WhatsApp para receber notificações?",
    href: "/painel/whatsapp",
    interno: true,
  },
  {
    q: "Como funciona o controle de estoque?",
    href: "/painel/estoque",
    interno: true,
  },
  {
    q: "Como gero e compartilho o QR Code do meu cardápio?",
    href: "/painel/qrcode",
    interno: true,
  },
]

const SUPPORT_WHATSAPP = process.env.SUPPORT_WHATSAPP ?? "5511999999999"

export default async function SuportePage() {
  const session = await getSession()
  if (!session || session.papel !== "LOJISTA" || !session.lojaId) redirect("/login")

  const whatsappUrl = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent("Olá! Preciso de suporte com o LookMenu.")}`

  return (
    <DashboardShell user={session} title="Painel da loja" nav={PAINEL_NAV}>
      <h2 className="mb-6 text-2xl font-semibold">Suporte</h2>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contato */}
        <div className="space-y-4">
          <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Fale conosco no WhatsApp
              </CardTitle>
              <CardDescription className="text-green-700 dark:text-green-300">
                Seg–Sex, 9h–18h (horário de Brasília)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition"
              >
                Abrir conversa
              </Link>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Perguntas frequentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {FAQ.map((item) => (
                <Link
                  key={item.q}
                  href={item.href}
                  className="flex items-start gap-2 rounded-lg p-2 text-sm hover:bg-muted transition"
                >
                  <span className="mt-0.5 shrink-0 text-primary">→</span>
                  <span>{item.q}</span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Formulário de ticket */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Enviar mensagem</CardTitle>
            <CardDescription>
              Descreva sua dúvida ou problema. Respondemos em até 1 dia útil.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SuporteForm />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}

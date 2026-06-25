import Link from "next/link"

import { prisma } from "@/lib/prisma"
import { dismissOnboardingAction } from "@/app/painel/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

type OnboardingStep = {
  id: number
  label: string
  done: boolean
  href: string
  linkLabel: string
}

export async function OnboardingChecklist({ lojaId }: { lojaId: string }) {
  const [loja, countProdutos, countPedidos, countHorarios] = await Promise.all([
    prisma.loja.findUnique({
      where: { id: lojaId },
      select: {
        criadoEm: true,
        onboardingDismissedEm: true,
        logoUrl: true,
        corPrimaria: true,
      },
    }),
    prisma.produto.count({ where: { lojaId } }),
    prisma.pedido.count({ where: { lojaId } }),
    prisma.horarioFuncionamento.count({ where: { lojaId } }),
  ])

  if (!loja) return null
  if (loja.onboardingDismissedEm) return null

  const diasDesde = (Date.now() - loja.criadoEm.getTime()) / (1000 * 60 * 60 * 24)
  if (diasDesde > 14) return null

  const whatsappEnabled = process.env.WHATSAPP_ENABLED === "true"

  const steps: OnboardingStep[] = [
    {
      id: 1,
      label: "Adicionar um produto ao cardápio",
      done: countProdutos > 0,
      href: "/painel/produtos",
      linkLabel: "Ir para Produtos",
    },
    {
      id: 2,
      label: "Personalizar aparência (logo ou cor)",
      done: !!loja.logoUrl || loja.corPrimaria !== "#D62300",
      href: "/painel/aparencia",
      linkLabel: "Ir para Aparência",
    },
    {
      id: 3,
      label: "Configurar horário de funcionamento",
      done: countHorarios > 0,
      href: "/painel/configuracoes",
      linkLabel: "Ir para Configurações",
    },
    {
      id: 4,
      label: whatsappEnabled ? "Conectar WhatsApp" : "WhatsApp (desabilitado neste plano)",
      done: !whatsappEnabled,
      href: "/painel/whatsapp",
      linkLabel: "Ir para WhatsApp",
    },
    {
      id: 5,
      label: "Gerar e compartilhar QR Code do cardápio",
      done: countPedidos > 0,
      href: "/painel/qrcode",
      linkLabel: "Ir para QR Code",
    },
    {
      id: 6,
      label: "Receber o primeiro pedido",
      done: countPedidos > 0,
      href: "/painel/pedidos",
      linkLabel: "Ver Pedidos",
    },
  ]

  const completedCount = steps.filter((s) => s.done).length
  const allDone = completedCount === steps.length
  const progress = Math.round((completedCount / steps.length) * 100)

  return (
    <Card className="mb-6 border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-base">
              {allDone ? "🎉 Setup concluído!" : "Configure sua loja em ~30 minutos"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {allDone
                ? "Você concluiu todas as etapas de configuração. Sua loja está pronta!"
                : `${completedCount} de ${steps.length} etapas concluídas`}
            </p>
          </div>
          <form action={dismissOnboardingAction}>
            <Button type="submit" variant="ghost" size="sm" className="shrink-0 text-xs text-muted-foreground">
              Dispensar
            </Button>
          </form>
        </div>
        <Progress value={progress} className="h-2 mt-2" />
      </CardHeader>
      <CardContent>
        <ol className="space-y-2">
          {steps.map((step) => (
            <li key={step.id} className="flex items-center gap-3 text-sm">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  step.done
                    ? "bg-green-500 text-white"
                    : "border-2 border-muted-foreground text-muted-foreground"
                }`}
              >
                {step.done ? "✓" : step.id}
              </span>
              <span className={step.done ? "text-muted-foreground line-through" : "font-medium"}>
                {step.label}
              </span>
              {!step.done && (
                <Link
                  href={step.href}
                  className="ml-auto shrink-0 text-xs text-primary hover:underline"
                >
                  {step.linkLabel} →
                </Link>
              )}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}

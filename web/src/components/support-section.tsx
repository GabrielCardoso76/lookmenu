"use client"

import Link from "next/link"
import { ScrollReveal } from "@/components/scroll-reveal"
import { Headphones, Clock, MessageCircle, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

const supportFeatures = [
  {
    icon: Headphones,
    title: "Suporte Humano",
    description: "Nada de chatbot. Voce fala com gente de verdade que entende do seu negocio.",
  },
  {
    icon: Clock,
    title: "Resposta Rapida",
    description: "Tempo medio de resposta abaixo de 5 minutos no horario comercial.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Direto",
    description: "Suporte onde voce ja esta. Sem tickets, sem email, sem espera.",
  },
  {
    icon: Zap,
    title: "Onboarding Guiado",
    description: "A gente configura tudo com voce. Do zero ao primeiro pedido em 1 dia.",
  },
]

export function SupportSection() {
  return (
    <section className="border-t border-border py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <ScrollReveal>
            <div>
              <p className="text-sm font-medium text-primary">Suporte de Verdade</p>
              <h2 className="mt-3 font-display text-3xl font-bold text-foreground md:text-4xl text-balance">
                Voce nunca esta sozinho
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Nosso time te acompanha desde a configuracao ate o crescimento do seu negocio. Suporte
                humanizado, rapido e pelo WhatsApp.
              </p>
              <Button
                asChild
                className="mt-8 rounded-full bg-primary px-8 py-6 text-base font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <Link href="/comecar">Falar com o time</Link>
              </Button>
            </div>
          </ScrollReveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {supportFeatures.map((feat, i) => (
              <ScrollReveal key={feat.title} delay={0.1 * (i + 1)}>
                <div className="rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/30">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl squircle-sm bg-primary/10">
                    <feat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mt-3 font-display text-sm font-semibold text-foreground">
                    {feat.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {feat.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

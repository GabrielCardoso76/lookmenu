"use client"

import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollReveal } from "./scroll-reveal"

const plans = [
  {
    name: "Start",
    description: "Para quem esta comecando",
    featured: false,
    features: [
      "Atendimento automatizado via WhatsApp",
      "Cardapio digital web",
      "Gestor de pedidos basico",
      "1 template incluso",
      "Suporte via chat",
    ],
  },
  {
    name: "Plus",
    description: "Para quem quer crescer",
    featured: true,
    features: [
      "Tudo do plano Start",
      "Acesso a todos os templates",
      "Cupons de desconto",
      "Integracao com iFood (Entrega Facil)",
      "Recuperador de vendas",
      "Pagamento online (PIX e Credito)",
      "Suporte prioritario",
    ],
  },
]

export function PricingSection() {
  return (
    <section id="precos" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-primary">Planos e Precos</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-foreground md:text-4xl text-balance">
              Escolha o plano ideal para o seu negocio
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Comece agora e escale conforme voce cresce.
            </p>
          </div>
        </ScrollReveal>

        <div className="mx-auto mt-14 grid max-w-4xl gap-6 lg:grid-cols-2">
          {plans.map((plan, i) => (
            <ScrollReveal key={plan.name} delay={i * 0.15} direction="up">
              <div
                className={`relative overflow-hidden rounded-[2rem] border p-8 h-full ${
                  plan.featured
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card"
                }`}
              >
                {plan.featured && (
                  <div className="absolute top-0 right-0 rounded-bl-2xl bg-primary px-3 py-1">
                    <span className="text-xs font-semibold text-primary-foreground">
                      Mais popular
                    </span>
                  </div>
                )}

                <h3 className="font-display text-2xl font-bold text-foreground">
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>

                <ul className="mt-8 flex flex-col gap-3">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-sm text-foreground">{feat}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`mt-8 w-full rounded-2xl ${
                    plan.featured
                      ? "bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
                      : "bg-secondary font-semibold text-secondary-foreground hover:bg-secondary/80"
                  }`}
                  size="lg"
                >
                  Fale com nosso time
                </Button>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

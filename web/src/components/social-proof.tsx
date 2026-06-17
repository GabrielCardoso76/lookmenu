"use client"

import { Zap, TrendingDown, DollarSign } from "lucide-react"
import { ScrollReveal } from "./scroll-reveal"

const metrics = [
  {
    icon: Zap,
    value: "+20%",
    label: "mais rapidez no atendimento aos clientes",
  },
  {
    icon: TrendingDown,
    value: "-30%",
    label: "de reducao dos custos operacionais",
  },
  {
    icon: DollarSign,
    value: "+40%",
    label: "de aumento no lucro com as vendas",
  },
]

export function SocialProof() {
  return (
    <section className="bg-card/50 py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 md:grid-cols-3">
          {metrics.map((metric, i) => (
            <ScrollReveal key={metric.value} delay={i * 0.15} direction="up">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center squircle-sm bg-primary/10">
                  <metric.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-foreground lg:text-3xl">
                    {metric.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

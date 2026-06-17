"use client"

import { ScrollReveal } from "@/components/scroll-reveal"
import { X, Check } from "lucide-react"

const before = [
  "Pedidos perdidos no WhatsApp",
  "Cardapio em PDF ou foto borrada",
  "Sem controle de estoque",
  "Cozinha desorganizada",
  "Perda de vendas por abandono",
]

const after = [
  "Bot automatico 24h no WhatsApp",
  "Cardapio digital bonito e rapido",
  "Estoque atualizado em tempo real",
  "Painel da cozinha com fila de pedidos",
  "Recuperacao automatica de vendas",
]

export function BeforeAfterSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-primary">Transformacao Real</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-foreground md:text-4xl text-balance">
              Antes vs Depois do LookMenu
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Veja como seu negocio muda quando voce automatiza o atendimento.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <ScrollReveal delay={0.1}>
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 h-full">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-red-500/10 px-4 py-1.5">
                <X className="h-4 w-4 text-red-400" />
                <span className="text-sm font-semibold text-red-400">Sem LookMenu</span>
              </div>
              <ul className="space-y-4">
                {before.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/10">
                      <X className="h-3 w-3 text-red-400" />
                    </div>
                    <span className="text-sm leading-relaxed text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-8 h-full">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-green-500/10 px-4 py-1.5">
                <Check className="h-4 w-4 text-green-400" />
                <span className="text-sm font-semibold text-green-400">Com LookMenu</span>
              </div>
              <ul className="space-y-4">
                {after.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/10">
                      <Check className="h-3 w-3 text-green-400" />
                    </div>
                    <span className="text-sm leading-relaxed text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}

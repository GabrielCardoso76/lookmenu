"use client"

import { ScrollReveal } from "@/components/scroll-reveal"
import { QrCode, Smartphone, ShoppingBag } from "lucide-react"

const steps = [
  {
    icon: QrCode,
    step: "01",
    title: "Cliente escaneia o QR Code",
    description: "Na mesa, no balcao ou na embalagem. Um codigo, acesso direto.",
  },
  {
    icon: Smartphone,
    step: "02",
    title: "Abre o cardapio no celular",
    description: "Sem instalar nada. Cardapio bonito, rapido e responsivo.",
  },
  {
    icon: ShoppingBag,
    step: "03",
    title: "Faz o pedido e paga",
    description: "Escolhe, paga online e pronto. Pedido direto na cozinha.",
  },
]

export function QrCodeSection() {
  return (
    <section className="border-t border-border bg-card/30 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-primary">Experiencia sem Atrito</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-foreground md:text-4xl text-balance">
              Do QR Code ao pedido em 30 segundos
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Seu cliente nao precisa baixar nenhum app. Tudo funciona direto no navegador.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((item, i) => (
            <ScrollReveal key={item.step} delay={0.1 * (i + 1)}>
              <div className="relative text-center">
                {i < steps.length - 1 && (
                  <div className="absolute right-0 top-10 hidden h-px w-full translate-x-1/2 bg-gradient-to-r from-primary/30 to-transparent md:block" />
                )}
                <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl squircle-sm bg-primary/10">
                  <item.icon className="h-8 w-8 text-primary" />
                  <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary">
                    <span className="text-xs font-bold text-primary-foreground">{item.step}</span>
                  </div>
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

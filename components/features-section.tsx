"use client"

import React from "react"
import { ScrollReveal } from "./scroll-reveal"

const features = [
  {
    title: "Atendimento Automatizado",
    description:
      "Robo para WhatsApp que anota pedidos sozinho, 24 horas por dia, sem voce precisar intervir.",
    mockup: "whatsapp",
  },
  {
    title: "Cardapio Digital Web",
    description:
      "Link exclusivo para o cliente escolher os produtos com facilidade, direto no celular.",
    mockup: "menu",
  },
  {
    title: "Recuperador de Vendas",
    description:
      "Mensagens automaticas para quem abandonou o carrinho. Recupere vendas perdidas.",
    mockup: "recovery",
  },
  {
    title: "Pagamento Online",
    description:
      "Receba via PIX ou Credito direto na plataforma. Sem complicacao.",
    mockup: "payment",
  },
]

function WhatsAppMockup() {
  return (
    <div className="w-full rounded-2xl border border-border/60 bg-background p-3">
      <div className="flex items-center gap-2 border-b border-border/40 pb-2">
        <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center">
          <span className="text-[8px] text-green-400">WA</span>
        </div>
        <div className="text-[10px] font-medium text-foreground">Bot LookMenu</div>
        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-green-400" />
      </div>
      <div className="mt-2 space-y-1.5">
        <div className="w-3/4 rounded-2xl rounded-tl-md bg-secondary px-2.5 py-1.5">
          <p className="text-[9px] text-muted-foreground">Ola! Bem-vindo ao Burger House</p>
        </div>
        <div className="w-2/3 rounded-2xl rounded-tl-md bg-secondary px-2.5 py-1.5">
          <p className="text-[9px] text-muted-foreground">Escolha uma opcao:</p>
          <div className="mt-1 space-y-0.5">
            <div className="text-[8px] text-primary">1. Ver cardapio</div>
            <div className="text-[8px] text-primary">2. Meus pedidos</div>
          </div>
        </div>
        <div className="ml-auto w-1/3 rounded-2xl rounded-tr-md bg-primary/20 px-2.5 py-1.5">
          <p className="text-[9px] text-primary">1</p>
        </div>
      </div>
    </div>
  )
}

function MenuMockup() {
  return (
    <div className="w-full rounded-2xl border border-border/60 bg-background p-3">
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <span className="text-[10px] font-semibold text-foreground">Burger House</span>
        <div className="flex gap-1">
          <div className="h-2 w-5 rounded-full bg-primary/30" />
          <div className="h-2 w-5 rounded-full bg-muted" />
        </div>
      </div>
      <div className="mt-2 space-y-1.5">
        {["X-Burguer", "X-Bacon", "X-Tudo"].map((item, i) => (
          <div key={item} className="flex items-center justify-between rounded-xl bg-secondary px-2 py-1.5">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-lg bg-primary/10" />
              <div>
                <p className="text-[9px] font-medium text-foreground">{item}</p>
                <p className="text-[8px] text-muted-foreground">R$ {(19.9 + i * 5).toFixed(2).replace(".", ",")}</p>
              </div>
            </div>
            <div className="h-4 w-4 rounded-lg bg-primary/20 flex items-center justify-center">
              <span className="text-[8px] text-primary">+</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RecoveryMockup() {
  return (
    <div className="w-full rounded-2xl border border-border/60 bg-background p-3">
      <div className="flex items-center gap-2 pb-2 border-b border-border/40">
        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
        <span className="text-[10px] font-medium text-foreground">Recuperacao Ativa</span>
      </div>
      <div className="mt-2 space-y-1.5">
        <div className="flex items-center justify-between rounded-xl bg-secondary px-2 py-1.5">
          <div>
            <p className="text-[9px] text-foreground">Joao - Carrinho R$ 45</p>
            <p className="text-[8px] text-muted-foreground">Abandonou ha 15 min</p>
          </div>
          <div className="rounded-full bg-green-500/20 px-1.5 py-0.5">
            <span className="text-[8px] text-green-400">Enviado</span>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-secondary px-2 py-1.5">
          <div>
            <p className="text-[9px] text-foreground">Maria - Carrinho R$ 32</p>
            <p className="text-[8px] text-muted-foreground">Abandonou ha 8 min</p>
          </div>
          <div className="rounded-full bg-primary/20 px-1.5 py-0.5">
            <span className="text-[8px] text-primary">Enviando...</span>
          </div>
        </div>
        <div className="mt-1 text-center">
          <p className="text-[8px] text-green-400">+23% vendas recuperadas</p>
        </div>
      </div>
    </div>
  )
}

function PaymentMockup() {
  return (
    <div className="w-full rounded-2xl border border-border/60 bg-background p-3">
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <span className="text-[10px] font-medium text-foreground">Pagamento</span>
        <div className="rounded-full bg-green-500/20 px-1.5 py-0.5">
          <span className="text-[8px] text-green-400">Seguro</span>
        </div>
      </div>
      <div className="mt-2 space-y-2">
        <div className="rounded-xl bg-secondary p-2 text-center">
          <p className="text-[8px] text-muted-foreground">Total do Pedido</p>
          <p className="text-sm font-bold text-foreground">R$ 67,80</p>
        </div>
        <div className="flex gap-1.5">
          <div className="flex-1 rounded-xl border border-primary bg-primary/10 p-1.5 text-center">
            <p className="text-[9px] font-medium text-primary">PIX</p>
          </div>
          <div className="flex-1 rounded-xl border border-border bg-secondary p-1.5 text-center">
            <p className="text-[9px] text-muted-foreground">Credito</p>
          </div>
        </div>
        <div className="h-7 w-full rounded-xl bg-primary/10 flex items-center justify-center">
          <div className="h-5 w-5 rounded border border-dashed border-primary/40" />
          <span className="ml-1.5 text-[8px] text-primary">QR Code PIX</span>
        </div>
      </div>
    </div>
  )
}

const mockupComponents: Record<string, () => React.JSX.Element> = {
  whatsapp: WhatsAppMockup,
  menu: MenuMockup,
  recovery: RecoveryMockup,
  payment: PaymentMockup,
}

export function FeaturesSection() {
  return (
    <section id="funcionalidades" className="bg-card/30 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-primary">Ecossistema de Vendas</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-foreground md:text-4xl text-balance">
              Tudo que voce precisa para vender mais
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Do pedido ao pagamento, automatize todo o processo e foque no que importa: sua comida.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feat, i) => {
            const MockupComponent = mockupComponents[feat.mockup]
            return (
              <ScrollReveal key={feat.title} delay={i * 0.1} direction="up">
                <div className="group rounded-[2rem] border border-border bg-card p-5 transition-all hover:border-primary/30 hover:bg-card/80 h-full">
                  <MockupComponent />
                  <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                    {feat.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feat.description}
                  </p>
                </div>
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

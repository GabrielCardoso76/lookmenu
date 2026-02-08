"use client"

import { ScrollReveal } from "./scroll-reveal"

function KitchenDisplayMockup() {
  return (
    <div className="w-full rounded-2xl border border-border/60 bg-background p-3">
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <span className="text-[10px] font-semibold text-foreground">Cozinha - Pedidos</span>
        <div className="flex items-center gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[8px] text-green-400">Ao vivo</span>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-1.5">
        {[
          { id: "#142", status: "Preparando", color: "primary" },
          { id: "#143", status: "Pronto", color: "green" },
          { id: "#144", status: "Novo", color: "primary" },
          { id: "#145", status: "Preparando", color: "primary" },
        ].map((order) => (
          <div key={order.id} className="rounded-xl bg-secondary p-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-medium text-foreground">{order.id}</span>
              <div className={`rounded-full px-1 py-0.5 ${order.color === "green" ? "bg-green-500/20" : "bg-primary/20"}`}>
                <span className={`text-[7px] ${order.color === "green" ? "text-green-400" : "text-primary"}`}>
                  {order.status}
                </span>
              </div>
            </div>
            <p className="mt-0.5 text-[7px] text-muted-foreground">2x Burger, 1x Frita</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function WaiterAppMockup() {
  return (
    <div className="w-full rounded-2xl border border-border/60 bg-background p-3">
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <span className="text-[10px] font-semibold text-foreground">App Garcom</span>
        <span className="text-[8px] text-muted-foreground">Mesa 07</span>
      </div>
      <div className="mt-2 space-y-1.5">
        {[
          { mesa: "03", status: "Ocupada", itens: 4 },
          { mesa: "07", status: "Pedido enviado", itens: 2 },
          { mesa: "12", status: "Aguardando", itens: 0 },
        ].map((mesa) => (
          <div key={mesa.mesa} className="flex items-center justify-between rounded-xl bg-secondary px-2 py-1.5">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-[8px] font-bold text-primary">{mesa.mesa}</span>
              </div>
              <div>
                <p className="text-[9px] font-medium text-foreground">Mesa {mesa.mesa}</p>
                <p className="text-[7px] text-muted-foreground">{mesa.status}</p>
              </div>
            </div>
            {mesa.itens > 0 && (
              <div className="rounded-full bg-primary/20 px-1.5 py-0.5">
                <span className="text-[8px] text-primary">{mesa.itens}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function StockPDVMockup() {
  return (
    <div className="w-full rounded-2xl border border-border/60 bg-background p-3">
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <span className="text-[10px] font-semibold text-foreground">Estoque & PDV</span>
        <div className="rounded-full bg-primary/20 px-1.5 py-0.5">
          <span className="text-[8px] text-primary">Hoje</span>
        </div>
      </div>
      <div className="mt-2 space-y-1.5">
        <div className="grid grid-cols-2 gap-1.5">
          <div className="rounded-xl bg-secondary p-1.5 text-center">
            <p className="text-[8px] text-muted-foreground">Vendas</p>
            <p className="text-[11px] font-bold text-foreground">R$ 2.340</p>
          </div>
          <div className="rounded-xl bg-secondary p-1.5 text-center">
            <p className="text-[8px] text-muted-foreground">Pedidos</p>
            <p className="text-[11px] font-bold text-foreground">47</p>
          </div>
        </div>
        <div className="rounded-xl bg-secondary px-2 py-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[8px] text-foreground">Pao brioche</span>
            <span className="text-[8px] text-red-400">Baixo: 12 un</span>
          </div>
          <div className="mt-1 h-1 w-full rounded-full bg-muted">
            <div className="h-1 w-1/5 rounded-full bg-red-400" />
          </div>
        </div>
      </div>
    </div>
  )
}

const items = [
  {
    title: "Gestor de Pedidos",
    description:
      "Painel centralizado para a cozinha nao se perder. Veja todos os pedidos em tempo real.",
    Mockup: KitchenDisplayMockup,
  },
  {
    title: "Aplicativo para Garcom",
    description:
      "Gestao de mesas e comandas em tempo real. Tudo na palma da mao.",
    Mockup: WaiterAppMockup,
  },
  {
    title: "Controle de Estoque e PDV",
    description:
      "Tudo o que o dono da loja precisa para o dia a dia. Estoque, caixa e relatorios.",
    Mockup: StockPDVMockup,
  },
]

export function ManagementSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-primary">Gestao Completa</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-foreground md:text-4xl text-balance">
              Salao e Cozinha sob controle
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Gerencie mesas, pedidos e estoque em um unico lugar.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {items.map((item, i) => (
            <ScrollReveal key={item.title} delay={i * 0.12} direction="up">
              <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-6 h-full">
                <item.Mockup />
                <h3 className="mt-5 font-display text-xl font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
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

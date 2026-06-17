"use client"

import { ArrowRight, Bike } from "lucide-react"
import { ScrollReveal } from "./scroll-reveal"

export function DeliverySection() {
  return (
    <section className="bg-card/30 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl">
            <div className="overflow-hidden rounded-[2rem] border border-border bg-card">
              <div className="grid items-center gap-8 lg:grid-cols-2">
                {/* Content */}
                <div className="p-8 lg:p-10">
                  <p className="text-sm font-medium text-primary">Logistica Sem Estresse</p>
                  <h2 className="mt-3 font-display text-2xl font-bold text-foreground md:text-3xl text-balance">
                    Sua entrega com a frota do iFood.
                  </h2>
                  <p className="mt-4 leading-relaxed text-muted-foreground">
                    Nao tem motoboy proprio? Sem problemas. Com a integracao
                    &quot;Entrega Facil&quot;, voce solicita um entregador do iFood
                    para pedidos do seu cardapio proprio.
                  </p>
                </div>

                {/* Visual */}
                <div className="flex flex-col items-center justify-center gap-5 bg-primary/5 p-8 lg:p-10">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center squircle-sm bg-primary/10">
                      <span className="font-display text-xl font-bold text-primary">LM</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <ArrowRight className="h-5 w-5 text-primary" />
                      <span className="text-[10px] text-muted-foreground">Integrado</span>
                    </div>
                    <div className="flex h-16 w-16 items-center justify-center squircle-sm bg-destructive/10">
                      <Bike className="h-8 w-8 text-destructive" />
                    </div>
                  </div>
                  <p className="max-w-xs text-center text-xs leading-relaxed text-muted-foreground">
                    Seu cliente pede no LookMenu, o entregador do iFood retira na sua porta.{" "}
                    <span className="font-semibold text-foreground">Simples assim.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

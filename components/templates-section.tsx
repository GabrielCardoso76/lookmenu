"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ScrollReveal } from "./scroll-reveal"

const templates = [
  {
    id: "moderno",
    label: "Moderno",
    description: "Clean, minimalista e sofisticado. Ideal para restaurantes contemporaneos.",
    colors: { primary: "#f59e0b", bg: "#0a0a0a", card: "#171717", text: "#fafafa" },
    items: [
      { name: "Bowl Tropical", price: "R$ 28,90" },
      { name: "Wrap Grelhado", price: "R$ 24,90" },
      { name: "Smoothie Verde", price: "R$ 16,90" },
    ],
  },
  {
    id: "classico",
    label: "Classico",
    description: "Elegante e atemporal. Perfeito para pizzarias e restaurantes tradicionais.",
    colors: { primary: "#dc2626", bg: "#1a0a0a", card: "#271111", text: "#fafafa" },
    items: [
      { name: "Pizza Margherita", price: "R$ 42,90" },
      { name: "Lasanha Bolonhesa", price: "R$ 38,90" },
      { name: "Tiramisu", price: "R$ 22,90" },
    ],
  },
  {
    id: "vibrante",
    label: "Vibrante",
    description: "Colorido e divertido. Otimo para acai, sorveterias e fast-food.",
    colors: { primary: "#8b5cf6", bg: "#0a0a14", card: "#131325", text: "#fafafa" },
    items: [
      { name: "Acai 500ml", price: "R$ 22,90" },
      { name: "Milkshake Oreo", price: "R$ 18,90" },
      { name: "Sundae Especial", price: "R$ 15,90" },
    ],
  },
]

export function TemplatesSection() {
  const [active, setActive] = useState(0)
  const t = templates[active]

  return (
    <section id="modelos" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl text-balance">
              Chega de cardapios todos iguais.
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Escolha entre nossos templates e mude cores e fontes em tempo real.
            </p>
          </div>
        </ScrollReveal>

        {/* Template selector */}
        <ScrollReveal delay={0.15}>
          <div className="mt-12 flex justify-center gap-3">
            {templates.map((tmpl, i) => (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => setActive(i)}
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                  i === active
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                }`}
              >
                {tmpl.label}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Preview */}
        <div className="mt-10 grid items-center gap-10 lg:grid-cols-2">
          {/* Description */}
          <ScrollReveal direction="left" delay={0.2}>
            <div>
              <h3 className="font-display text-2xl font-bold text-foreground">
                Template{" "}
                <span style={{ color: t.colors.primary }}>{t.label}</span>
              </h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">{t.description}</p>

              <div className="mt-6 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full" style={{ backgroundColor: t.colors.primary }} />
                  <span className="text-sm text-muted-foreground">
                    Cor principal personalizavel
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full bg-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Fontes e estilos ajustaveis
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full bg-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Layout responsivo e rapido
                  </span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Template preview card */}
          <ScrollReveal direction="right" delay={0.3}>
            <div className="flex justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={t.id}
                  className="w-full max-w-sm overflow-hidden rounded-[2rem] border border-border shadow-2xl"
                  style={{ backgroundColor: t.colors.bg }}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  {/* Template header */}
                  <div
                    className="p-5 transition-colors duration-500"
                    style={{ backgroundColor: `${t.colors.primary}15` }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center squircle-sm text-sm font-bold transition-colors duration-500"
                        style={{ backgroundColor: t.colors.primary, color: t.colors.bg }}
                      >
                        LM
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: t.colors.text }}>
                          Meu Restaurante
                        </p>
                        <p className="text-xs" style={{ color: `${t.colors.text}80` }}>
                          Aberto agora
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="flex flex-col gap-3 p-5">
                    {t.items.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between rounded-2xl border p-4 transition-colors duration-500"
                        style={{
                          backgroundColor: t.colors.card,
                          borderColor: `${t.colors.primary}20`,
                        }}
                      >
                        <div>
                          <p className="text-sm font-medium" style={{ color: t.colors.text }}>
                            {item.name}
                          </p>
                          <p
                            className="mt-0.5 text-sm font-bold transition-colors duration-500"
                            style={{ color: t.colors.primary }}
                          >
                            {item.price}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-colors duration-500"
                          style={{ backgroundColor: t.colors.primary, color: t.colors.bg }}
                        >
                          +
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}

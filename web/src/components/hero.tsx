"use client"

import React from "react"
import Link from "next/link"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ScrollReveal } from "./scroll-reveal"

const themeColors = [
  { name: "Amber", bg: "bg-amber-500", hex: "#f59e0b", card: "bg-amber-500/10", text: "text-amber-400" },
  { name: "Rose", bg: "bg-rose-500", hex: "#f43f5e", card: "bg-rose-500/10", text: "text-rose-400" },
  { name: "Emerald", bg: "bg-emerald-500", hex: "#10b981", card: "bg-emerald-500/10", text: "text-emerald-400" },
  { name: "Violet", bg: "bg-violet-500", hex: "#8b5cf6", card: "bg-violet-500/10", text: "text-violet-400" },
]

export function Hero() {
  const [activeColor, setActiveColor] = useState(0)
  const [ripple, setRipple] = useState<{ x: number; y: number; key: number } | null>(null)
  const color = themeColors[activeColor]

  const handleColorSelect = useCallback(
    (index: number, e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = rect.left + rect.width / 2
      const y = rect.top + rect.height / 2
      setRipple({ x, y, key: Date.now() })
      setActiveColor(index)
    },
    [],
  )

  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
      {/* Background glow */}
      <motion.div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full opacity-15 blur-[120px]"
        animate={{ backgroundColor: color.hex }}
        transition={{ duration: 0.7 }}
      />

      {/* Ripple effect */}
      <AnimatePresence>
        {ripple && (
          <motion.div
            key={ripple.key}
            className="pointer-events-none fixed z-50 rounded-full"
            style={{
              left: ripple.x,
              top: ripple.y,
              backgroundColor: color.hex,
            }}
            initial={{ width: 0, height: 0, x: 0, y: 0, opacity: 0.4 }}
            animate={{
              width: 600,
              height: 600,
              x: -300,
              y: -300,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            onAnimationComplete={() => setRipple(null)}
          />
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left content */}
          <ScrollReveal direction="left">
            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-medium text-muted-foreground">
                  Novo: Templates personalizaveis
                </span>
              </div>

              <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl text-balance">
                O cardapio que tem a cara da{" "}
                <span className="text-primary">sua marca</span> e a inteligencia do{" "}
                <span className="text-primary">WhatsApp</span>.
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Automatize pedidos, organize sua cozinha e ofereca uma experiencia
                visual unica com cardapios web totalmente customizaveis.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="bg-primary text-lg font-semibold text-primary-foreground hover:bg-primary/90 rounded-2xl"
                >
                  <Link href="/comecar">
                    Quero meu cardapio automatizado
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </ScrollReveal>

          {/* Right - Phone mockup */}
          <ScrollReveal direction="right" delay={0.2}>
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                {/* Phone frame */}
                <motion.div
                  className="relative w-[280px] rounded-[2.5rem] border-[3px] border-border bg-card p-3 shadow-2xl sm:w-[300px]"
                  animate={{ borderColor: `${color.hex}30` }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Screen */}
                  <div className="overflow-hidden rounded-[2rem] bg-background">
                    {/* Status bar */}
                    <div className="flex items-center justify-between px-5 pt-3 pb-2">
                      <span className="text-[10px] font-medium text-muted-foreground">9:41</span>
                      <div className="flex gap-1">
                        <div className="h-2 w-3 rounded-sm bg-muted-foreground/40" />
                        <div className="h-2 w-3 rounded-sm bg-muted-foreground/40" />
                        <div className="h-2 w-3 rounded-sm bg-muted-foreground/40" />
                      </div>
                    </div>

                    {/* App header */}
                    <motion.div
                      className="mx-3 rounded-xl p-4"
                      animate={{ backgroundColor: `${color.hex}15` }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="flex items-center gap-3">
                        <motion.div
                          className="flex h-10 w-10 items-center justify-center rounded-lg"
                          animate={{ backgroundColor: color.hex }}
                          transition={{ duration: 0.5 }}
                        >
                          <span className="text-sm font-bold text-background">BK</span>
                        </motion.div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">Burger King</p>
                          <p className="text-xs text-muted-foreground">Delivery e Retirada</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Menu categories */}
                    <div className="flex gap-2 px-3 py-3 overflow-x-auto">
                      {["Combos", "Lanches", "Bebidas"].map((cat, i) => (
                        <motion.span
                          key={cat}
                          className="whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-medium"
                          animate={
                            i === 0
                              ? { backgroundColor: color.hex, color: "#0a0a0a" }
                              : { backgroundColor: "hsl(0 0% 12%)", color: "hsl(0 0% 55%)" }
                          }
                          transition={{ duration: 0.5 }}
                        >
                          {cat}
                        </motion.span>
                      ))}
                    </div>

                    {/* Menu items */}
                    <div className="flex flex-col gap-2.5 px-3 pb-4">
                      {[
                        { name: "Combo Whopper", price: "R$ 34,90", desc: "Whopper + Batata + Refri" },
                        { name: "Combo Stacker", price: "R$ 39,90", desc: "Stacker duplo + Batata" },
                        { name: "Onion Rings", price: "R$ 14,90", desc: "Porcao grande crocante" },
                      ].map((item) => (
                        <div
                          key={item.name}
                          className="flex items-center justify-between rounded-xl border border-border bg-card p-3"
                        >
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-foreground">{item.name}</p>
                            <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                            <motion.p
                              className="mt-1 text-xs font-bold"
                              animate={{ color: color.hex }}
                              transition={{ duration: 0.5 }}
                            >
                              {item.price}
                            </motion.p>
                          </div>
                          <motion.button
                            type="button"
                            className="ml-2 flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-background"
                            animate={{ backgroundColor: color.hex }}
                            transition={{ duration: 0.5 }}
                          >
                            +
                          </motion.button>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Color selector floating card */}
                <div className="absolute -right-4 bottom-16 rounded-2xl border border-border bg-card p-3 shadow-xl sm:-right-12">
                  <p className="mb-2 text-[10px] font-medium text-muted-foreground">Cor do tema</p>
                  <div className="flex gap-2">
                    {themeColors.map((c, i) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={(e) => handleColorSelect(i, e)}
                        className={`relative h-7 w-7 rounded-full transition-all ${c.bg} ${
                          i === activeColor
                            ? "ring-2 ring-foreground ring-offset-2 ring-offset-card scale-110"
                            : "hover:scale-105"
                        }`}
                        aria-label={`Selecionar cor ${c.name}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}

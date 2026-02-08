"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"
import { ScrollReveal } from "./scroll-reveal"

export function ContactSection() {
  const [submitted, setSubmitted] = useState(false)

  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Text */}
          <ScrollReveal direction="left">
            <div>
              <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl text-balance">
                Tecnologia de ponta para o pequeno empreendedor.
              </h2>
              <p className="mt-5 leading-relaxed text-muted-foreground">
                O LookMenu nasceu com a missao de democratizar a tecnologia para
                restaurantes, lanchonetes e pequenos negocios de alimentacao. Acreditamos
                que todo empreendedor merece ter um cardapio bonito, funcional e inteligente
                - sem precisar gastar uma fortuna para isso.
              </p>
            </div>
          </ScrollReveal>

          {/* Form */}
          <ScrollReveal direction="right" delay={0.15}>
            <div className="rounded-[2rem] border border-border bg-card p-8">
              <h3 className="font-display text-xl font-semibold text-foreground">
                Fale com a gente
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Preencha seus dados e entraremos em contato.
              </p>

              {submitted ? (
                <div className="mt-6 rounded-2xl bg-primary/10 p-6 text-center">
                  <p className="font-display text-lg font-semibold text-primary">
                    Obrigado pelo contato!
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Retornaremos em breve pelo WhatsApp.
                  </p>
                </div>
              ) : (
                <form
                  className="mt-6 flex flex-col gap-4"
                  onSubmit={(e) => {
                    e.preventDefault()
                    setSubmitted(true)
                  }}
                >
                  <div>
                    <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
                      Seu nome
                    </label>
                    <Input
                      id="name"
                      placeholder="Joao Silva"
                      required
                      className="rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <label htmlFor="store" className="mb-1.5 block text-sm font-medium text-foreground">
                      Nome da loja
                    </label>
                    <Input
                      id="store"
                      placeholder="Burger do Joao"
                      required
                      className="rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <label htmlFor="whatsapp" className="mb-1.5 block text-sm font-medium text-foreground">
                      WhatsApp
                    </label>
                    <Input
                      id="whatsapp"
                      placeholder="(11) 99999-9999"
                      required
                      className="rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="mt-2 rounded-2xl bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    Enviar
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              )}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}

"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ScrollReveal } from "./scroll-reveal"

const faqs = [
  {
    question: "Preciso instalar algum aplicativo no meu celular?",
    answer:
      "Nao! O LookMenu funciona 100% na nuvem. Voce acessa o painel de gestao pelo navegador do seu celular ou computador, sem precisar baixar nada.",
  },
  {
    question: "Como funciona a troca de cores do cardapio?",
    answer:
      "E super simples. No painel de administracao, voce escolhe um dos nossos templates base e depois personaliza as cores, fontes e o logo. As mudancas aparecem em tempo real no seu cardapio digital.",
  },
  {
    question: "O LookMenu cobra comissao por cada venda?",
    answer:
      "Nao. Taxa zero por pedido. Voce paga apenas a assinatura mensal fixa.",
  },
  {
    question: "Posso usar o LookMenu sem ter um WhatsApp Business?",
    answer:
      "Sim, mas recomendamos o WhatsApp Business para aproveitar ao maximo as funcionalidades de automacao, como respostas automaticas e catalogo de produtos.",
  },
  {
    question: "Quanto tempo leva para configurar meu cardapio?",
    answer:
      "Em menos de 30 minutos voce ja tem seu cardapio digital funcionando. Nosso time de suporte ajuda voce em cada etapa do processo.",
  },
]

export function FaqSection() {
  return (
    <section id="faq" className="bg-card/30 py-20 lg:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <ScrollReveal>
          <div className="text-center">
            <p className="text-sm font-medium text-primary">FAQ</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-foreground md:text-4xl text-balance">
              Perguntas Frequentes
            </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <Accordion type="single" collapsible className="mt-12">
            {faqs.map((faq, i) => (
              <AccordionItem key={`faq-${i}`} value={`faq-${i}`} className="border-border">
                <AccordionTrigger className="text-left text-foreground hover:text-primary hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollReveal>
      </div>
    </section>
  )
}

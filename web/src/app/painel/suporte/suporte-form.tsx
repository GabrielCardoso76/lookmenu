"use client"

import { useActionState } from "react"

import { criarTicketSuporteAction, type ActionState } from "@/app/painel/actions"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const ASSUNTOS = [
  "Dúvida geral",
  "Problema técnico",
  "Estoque / PDV",
  "Cardápio / Produtos",
  "Pagamentos",
  "WhatsApp",
  "Outro",
]

export function SuporteForm() {
  const [state, action, pending] = useActionState(criarTicketSuporteAction, {} as ActionState)

  if (state.success) {
    return (
      <div className="rounded-lg bg-green-50 p-4 text-center dark:bg-green-950">
        <p className="font-semibold text-green-700 dark:text-green-300">{state.success}</p>
        <p className="mt-1 text-sm text-muted-foreground">Retornaremos em até 1 dia útil.</p>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1">
        <Label>Assunto</Label>
        <select
          name="assunto"
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Selecione…</option>
          {ASSUNTOS.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <Label>Mensagem</Label>
        <Textarea
          name="mensagem"
          required
          placeholder="Descreva sua dúvida ou problema em detalhes…"
          rows={5}
          minLength={10}
        />
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Enviando…" : "Enviar mensagem"}
      </Button>
    </form>
  )
}

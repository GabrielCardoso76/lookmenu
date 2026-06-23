"use client"

import { useActionState } from "react"

import { updateEntregaAction, type ActionState } from "@/app/painel/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type ConfigEntrega = {
  pedidoMinimo: number | null
  taxaEntregaFixa: number | null
  freteGratisAcima: number | null
}

function toInputValue(v: number | null): string {
  if (v == null) return ""
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function EntregaForm({ config }: { config: ConfigEntrega }) {
  const [state, formAction, pending] = useActionState(updateEntregaAction, {} as ActionState)

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pedidoMinimo">Pedido mínimo (R$)</Label>
          <p className="text-xs text-muted-foreground">
            Valor mínimo para aceitar um pedido delivery. Deixe em branco para sem mínimo.
          </p>
          <Input
            id="pedidoMinimo"
            name="pedidoMinimo"
            type="text"
            inputMode="decimal"
            defaultValue={toInputValue(config.pedidoMinimo)}
            placeholder="Ex: 25,00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="taxaEntregaFixa">Taxa de entrega (R$)</Label>
          <p className="text-xs text-muted-foreground">
            Valor fixo cobrado por delivery. Zero ou vazio = entrega grátis.
          </p>
          <Input
            id="taxaEntregaFixa"
            name="taxaEntregaFixa"
            type="text"
            inputMode="decimal"
            defaultValue={toInputValue(config.taxaEntregaFixa)}
            placeholder="Ex: 8,00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="freteGratisAcima">Frete grátis acima de (R$)</Label>
          <p className="text-xs text-muted-foreground">
            Se o subtotal atingir esse valor, a taxa de entrega é zerada. Deixe vazio para não usar.
          </p>
          <Input
            id="freteGratisAcima"
            name="freteGratisAcima"
            type="text"
            inputMode="decimal"
            defaultValue={toInputValue(config.freteGratisAcima)}
            placeholder="Ex: 80,00"
          />
        </div>
      </div>

      {state.error && (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{state.success}</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar configurações de entrega"}
      </Button>
    </form>
  )
}

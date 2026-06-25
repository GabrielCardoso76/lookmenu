"use client"

import { useActionState, useState } from "react"

import { updateRecuperadorAction, type ActionState } from "@/app/painel/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

type RecuperadorConfig = {
  recuperadorAtivo: boolean
  recuperadorMinutos: number
}

export function RecuperadorForm({ config }: { config: RecuperadorConfig }) {
  const [state, formAction, pending] = useActionState(updateRecuperadorAction, {} as ActionState)
  const [ativo, setAtivo] = useState(config.recuperadorAtivo)

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="recuperadorAtivo" value={ativo ? "true" : "false"} />

      <div className="flex items-center justify-between rounded-xl border border-border p-4">
        <div>
          <Label htmlFor="ativo-switch" className="text-base">
            Recuperador ativo
          </Label>
          <p className="text-sm text-muted-foreground">
            Envia uma mensagem automática no WhatsApp para clientes que abandonaram o carrinho.
          </p>
        </div>
        <Switch id="ativo-switch" checked={ativo} onCheckedChange={setAtivo} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="recuperadorMinutos">Tempo de espera (minutos)</Label>
        <p className="text-xs text-muted-foreground">
          Quanto tempo aguardar após o abandono antes de enviar a mensagem (mín. 5, máx. 1440).
        </p>
        <Input
          id="recuperadorMinutos"
          name="recuperadorMinutos"
          type="number"
          min={5}
          max={1440}
          defaultValue={config.recuperadorMinutos}
          className="max-w-[160px]"
        />
      </div>

      {state.error && (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{state.success}</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar configurações"}
      </Button>
    </form>
  )
}

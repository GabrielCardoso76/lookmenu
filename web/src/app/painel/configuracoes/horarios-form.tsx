"use client"

import { useActionState, useState } from "react"

import { updateHorariosAction, type ActionState } from "@/app/painel/actions"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"

const DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]

type HorarioDia = {
  diaSemana: number
  abreAs: string
  fechaAs: string
  fechado: boolean
}

function buildDefaults(horarios: HorarioDia[]): HorarioDia[] {
  return Array.from({ length: 7 }, (_, i) => {
    const h = horarios.find((x) => x.diaSemana === i)
    return h ?? { diaSemana: i, abreAs: "09:00", fechaAs: "18:00", fechado: false }
  })
}

export function HorariosForm({ horarios }: { horarios: HorarioDia[] }) {
  const [state, formAction, pending] = useActionState(updateHorariosAction, {} as ActionState)
  const [dias, setDias] = useState<HorarioDia[]>(() => buildDefaults(horarios))

  function update(i: number, patch: Partial<HorarioDia>) {
    setDias((prev) => prev.map((d, idx) => (idx === i ? { ...d, ...patch } : d)))
  }

  return (
    <form action={formAction} className="space-y-4">
      {dias.map((dia, i) => (
        <div
          key={dia.diaSemana}
          className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-4 transition-all hover:border-foreground/20"
        >
          {/* Dia label */}
          <div className="w-20 shrink-0">
            <p className="text-sm font-medium">{DIAS[i]}</p>
          </div>

          {/* Toggle fechado */}
          <div className="flex items-center gap-2">
            <Switch
              id={`fechado-${i}`}
              checked={!dia.fechado}
              onCheckedChange={(open) => update(i, { fechado: !open })}
              aria-label={`${DIAS[i]} aberto`}
            />
            <Label htmlFor={`fechado-${i}`} className="text-xs text-muted-foreground select-none">
              {dia.fechado ? "Fechado" : "Aberto"}
            </Label>
          </div>

          {/* Horários */}
          <div className={`flex items-center gap-2 ${dia.fechado ? "opacity-40 pointer-events-none" : ""}`}>
            <Input
              type="time"
              value={dia.abreAs}
              onChange={(e) => update(i, { abreAs: e.target.value })}
              className="h-8 w-28 text-sm"
              aria-label={`${DIAS[i]} abre às`}
            />
            <span className="text-xs text-muted-foreground">até</span>
            <Input
              type="time"
              value={dia.fechaAs}
              onChange={(e) => update(i, { fechaAs: e.target.value })}
              className="h-8 w-28 text-sm"
              aria-label={`${DIAS[i]} fecha às`}
            />
          </div>

          {/* Hidden fields */}
          <input type="hidden" name={`fechado_${i}`} value={String(dia.fechado)} />
          <input type="hidden" name={`abre_${i}`} value={dia.abreAs} />
          <input type="hidden" name={`fecha_${i}`} value={dia.fechaAs} />
        </div>
      ))}

      {state.error && (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{state.success}</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar horários"}
      </Button>
    </form>
  )
}

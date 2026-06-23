"use client"

import { useActionState, useState, useTransition } from "react"
import { Pencil, Plus, Trash2, ToggleLeft, ToggleRight, Tag } from "lucide-react"

import {
  createCupomAction,
  updateCupomAction,
  deleteCupomAction,
  toggleCupomAction,
  type ActionState,
} from "@/app/painel/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Cupom = {
  id: string
  codigo: string
  tipo: "PERCENTUAL" | "VALOR_FIXO"
  valor: number | string
  pedidoMinimo: number | string | null
  maxUsos: number | null
  usosAtuais: number
  validoDe: Date | string | null
  validoAte: Date | string | null
  ativo: boolean
}

function formatPreco(v: number | string) {
  return Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function toDateInput(v: Date | string | null): string {
  if (!v) return ""
  const d = new Date(v)
  return d.toISOString().slice(0, 10)
}

function CupomFields({ cupom }: { cupom?: Cupom }) {
  const [tipo, setTipo] = useState<"PERCENTUAL" | "VALOR_FIXO">(cupom?.tipo ?? "PERCENTUAL")

  return (
    <>
      <div className="space-y-1 w-36">
        <Label className="text-xs">Código</Label>
        <Input
          name="codigo"
          defaultValue={cupom?.codigo}
          placeholder="PROMO10"
          className="h-9 text-sm uppercase tracking-widest"
          required
        />
      </div>

      <div className="space-y-1 w-40">
        <Label className="text-xs">Tipo</Label>
        <input type="hidden" name="tipo" value={tipo} />
        <div className="flex h-9 rounded-lg border border-border overflow-hidden text-sm">
          {(["PERCENTUAL", "VALOR_FIXO"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTipo(t)}
              className={`flex-1 px-2 transition-colors ${
                tipo === t ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              {t === "PERCENTUAL" ? "%" : "R$"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1 w-24">
        <Label className="text-xs">{tipo === "PERCENTUAL" ? "Desconto (%)" : "Desconto (R$)"}</Label>
        <Input
          name="valor"
          defaultValue={cupom?.valor != null ? Number(cupom.valor).toFixed(2).replace(".", ",") : ""}
          placeholder={tipo === "PERCENTUAL" ? "10" : "5,00"}
          className="h-9 text-sm"
          required
        />
      </div>

      <div className="space-y-1 w-28">
        <Label className="text-xs">Mínimo (R$)</Label>
        <Input
          name="pedidoMinimo"
          defaultValue={cupom?.pedidoMinimo != null ? Number(cupom.pedidoMinimo).toFixed(2).replace(".", ",") : ""}
          placeholder="30,00"
          className="h-9 text-sm"
        />
      </div>

      <div className="space-y-1 w-20">
        <Label className="text-xs">Max usos</Label>
        <Input
          name="maxUsos"
          type="number"
          min="1"
          defaultValue={cupom?.maxUsos ?? ""}
          placeholder="100"
          className="h-9 text-sm"
        />
      </div>

      <div className="space-y-1 w-36">
        <Label className="text-xs">Válido de</Label>
        <Input
          name="validoDe"
          type="date"
          defaultValue={toDateInput(cupom?.validoDe ?? null)}
          className="h-9 text-sm"
        />
      </div>

      <div className="space-y-1 w-36">
        <Label className="text-xs">Válido até</Label>
        <Input
          name="validoAte"
          type="date"
          defaultValue={toDateInput(cupom?.validoAte ?? null)}
          className="h-9 text-sm"
        />
      </div>
    </>
  )
}

function CreateForm() {
  const [state, formAction, pending] = useActionState(createCupomAction, {} as ActionState)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo cupom
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-wrap items-end gap-3">
          <CupomFields />
          <Button size="sm" type="submit" disabled={pending} className="gap-1.5 self-end">
            <Plus className="h-3.5 w-3.5" />
            {pending ? "Salvando..." : "Criar"}
          </Button>
          {state.error && <p className="w-full text-sm text-destructive">{state.error}</p>}
          {state.success && <p className="w-full text-sm text-green-600">{state.success}</p>}
        </form>
      </CardContent>
    </Card>
  )
}

function EditForm({ cupom, onCancel }: { cupom: Cupom; onCancel: () => void }) {
  const action = updateCupomAction.bind(null, cupom.id)
  const [state, formAction, pending] = useActionState(action, {} as ActionState)

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3 mt-3 pt-3 border-t border-border">
      <CupomFields cupom={cupom} />
      <div className="flex gap-2 self-end">
        <Button size="sm" type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar"}
        </Button>
        <Button size="sm" variant="outline" type="button" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
      {state.error && <p className="w-full text-sm text-destructive">{state.error}</p>}
      {state.success && <p className="w-full text-sm text-green-600">{state.success}</p>}
    </form>
  )
}

function CupomRow({ cupom }: { cupom: Cupom }) {
  const [editing, setEditing] = useState(false)
  const [toggling, startToggle] = useTransition()
  const [deleting, startDelete] = useTransition()

  function handleToggle() {
    startToggle(async () => {
      await toggleCupomAction(cupom.id, !cupom.ativo)
    })
  }

  function handleDelete() {
    if (!confirm(`Excluir cupom "${cupom.codigo}"?`)) return
    startDelete(async () => {
      await deleteCupomAction(cupom.id)
    })
  }

  const esgotado = cupom.maxUsos != null && cupom.usosAtuais >= cupom.maxUsos
  const expirado = cupom.validoAte != null && new Date(cupom.validoAte) < new Date()

  return (
    <div className="rounded-xl border surface-light p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-sm font-mono tracking-wider">{cupom.codigo}</span>
            <Badge variant={cupom.ativo && !esgotado && !expirado ? "default" : "secondary"} className="text-xs">
              {!cupom.ativo ? "Inativo" : esgotado ? "Esgotado" : expirado ? "Expirado" : "Ativo"}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {cupom.tipo === "PERCENTUAL"
                ? `${Number(cupom.valor)}% OFF`
                : `${formatPreco(cupom.valor)} OFF`}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
            {cupom.pedidoMinimo != null && (
              <span>Mín: {formatPreco(cupom.pedidoMinimo)}</span>
            )}
            {cupom.maxUsos != null && (
              <span>Usos: {cupom.usosAtuais}/{cupom.maxUsos}</span>
            )}
            {cupom.validoDe && (
              <span>De: {new Date(cupom.validoDe).toLocaleDateString("pt-BR")}</span>
            )}
            {cupom.validoAte && (
              <span>Até: {new Date(cupom.validoAte).toLocaleDateString("pt-BR")}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleToggle}
            disabled={toggling}
            className="h-8 w-8 p-0"
            title={cupom.ativo ? "Desativar" : "Ativar"}
          >
            {cupom.ativo
              ? <ToggleRight className="h-4 w-4 text-green-600" />
              : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setEditing((e) => !e)}
            className="h-8 w-8 p-0"
            title="Editar"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            disabled={deleting}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            title="Excluir"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {editing && <EditForm cupom={cupom} onCancel={() => setEditing(false)} />}
    </div>
  )
}

export function CuponsManager({ cupons }: { cupons: Cupom[] }) {
  return (
    <div className="space-y-6">
      <CreateForm />

      <div className="space-y-3">
        {cupons.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
            <Tag className="h-10 w-10" />
            <p className="text-sm">Nenhum cupom criado ainda.</p>
          </div>
        ) : (
          <>
            <p className="text-sm font-medium text-muted-foreground">
              {cupons.length} cupom{cupons.length !== 1 ? "s" : ""}
            </p>
            {cupons.map((c) => (
              <CupomRow key={c.id} cupom={c} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}

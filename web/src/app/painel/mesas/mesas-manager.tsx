"use client"

import { useActionState, useEffect, useState } from "react"

import { createMesaAction, updateMesaAction, deleteMesaAction, type ActionState } from "@/app/painel/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, UtensilsCrossed } from "lucide-react"

type Mesa = {
  id: string
  numero: string
  nome: string | null
  ativa: boolean
  capacidade: number | null
}

function CreateMesaDialog() {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(createMesaAction, {} as ActionState)

  useEffect(() => {
    if (state.success) setOpen(false)
  }, [state])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Mesa
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Mesa</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="numero">Número / Identificador *</Label>
            <Input id="numero" name="numero" placeholder="01, Varanda, VIP..." required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nome">Nome descritivo (opcional)</Label>
            <Input id="nome" name="nome" placeholder="Mesa da janela..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="capacidade">Capacidade (pessoas)</Label>
            <Input id="capacidade" name="capacidade" type="number" min={1} max={50} placeholder="4" />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Criando..." : "Criar Mesa"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditMesaDialog({ mesa }: { mesa: Mesa }) {
  const [open, setOpen] = useState(false)
  const boundAction = updateMesaAction.bind(null, mesa.id)
  const [state, formAction, pending] = useActionState(boundAction, {} as ActionState)

  useEffect(() => {
    if (state.success) setOpen(false)
  }, [state])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="outline" className="h-8 w-8 text-gray-700 hover:text-foreground">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Mesa {mesa.numero}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`numero-${mesa.id}`}>Número / Identificador *</Label>
            <Input id={`numero-${mesa.id}`} name="numero" defaultValue={mesa.numero} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`nome-${mesa.id}`}>Nome descritivo (opcional)</Label>
            <Input id={`nome-${mesa.id}`} name="nome" defaultValue={mesa.nome ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`cap-${mesa.id}`}>Capacidade</Label>
            <Input id={`cap-${mesa.id}`} name="capacidade" type="number" min={1} defaultValue={mesa.capacidade ?? ""} />
          </div>
          <div className="flex items-center gap-2">
            <input
              id={`ativa-${mesa.id}`}
              name="ativa"
              type="checkbox"
              defaultChecked={mesa.ativa}
              className="h-4 w-4"
            />
            <Label htmlFor={`ativa-${mesa.id}`}>Mesa ativa</Label>
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteMesaButton({ mesaId }: { mesaId: string }) {
  const boundAction = deleteMesaAction.bind(null, mesaId)
  const [, formAction, pending] = useActionState(boundAction, {} as ActionState)
  return (
    <form action={formAction}>
        <Button
        type="submit"
        size="icon"
        variant="outline"
        disabled={pending}
        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:border-destructive/40"
        onClick={(e) => {
          if (!confirm("Excluir esta mesa?")) e.preventDefault()
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </form>
  )
}

function MesaCard({ mesa, slug }: { mesa: Mesa; slug: string }) {
  return (
    <div className={`relative rounded-2xl border-2 p-5 transition-all ${mesa.ativa ? "surface-light border-border hover:border-primary/40" : "bg-gray-50 text-gray-900 border-dashed border-gray-200 opacity-60"}`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary text-sm">
            {mesa.numero}
          </div>
          <div>
            {mesa.nome && <p className="font-semibold text-sm text-gray-800">{mesa.nome}</p>}
            {mesa.capacidade && (
              <p className="text-xs text-gray-500">{mesa.capacidade} pessoas</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <EditMesaDialog mesa={mesa} />
          <DeleteMesaButton mesaId={mesa.id} />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Badge variant={mesa.ativa ? "default" : "secondary"} className="text-xs">
          {mesa.ativa ? "Ativa" : "Inativa"}
        </Badge>
        <a
          href={`/${slug}/atendimento`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline"
        >
          App garçom ↗
        </a>
      </div>
    </div>
  )
}

export function MesasManager({ mesas, slug }: { mesas: Mesa[]; slug: string }) {
  const ativas = mesas.filter((m) => m.ativa)
  const inativas = mesas.filter((m) => !m.ativa)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {ativas.length} ativa{ativas.length !== 1 ? "s" : ""}
            {inativas.length > 0 && `, ${inativas.length} inativa${inativas.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <CreateMesaDialog />
      </div>

      {mesas.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-16 text-center">
          <UtensilsCrossed className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="font-medium text-muted-foreground">Nenhuma mesa cadastrada</p>
          <p className="text-sm text-muted-foreground mt-1">Crie mesas para habilitar o atendimento de salão</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {mesas.map((mesa) => (
            <MesaCard key={mesa.id} mesa={mesa} slug={slug} />
          ))}
        </div>
      )}
    </div>
  )
}

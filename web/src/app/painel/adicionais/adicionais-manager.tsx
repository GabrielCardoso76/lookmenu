"use client"

import { useActionState, useState } from "react"

import {
  createAdicionalAction,
  updateAdicionalAction,
  deleteAdicionalAction,
  toggleProdutoAdicionalAction,
  type ActionState,
} from "@/app/painel/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, Link2, Link2Off } from "lucide-react"

type Adicional = {
  id: string
  nome: string
  preco: number | string
  disponivel: boolean
  produtos: { produtoId: string }[]
}

type Produto = {
  id: string
  nome: string
}

function formatPreco(v: number | string) {
  return Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function CreateForm() {
  const [state, formAction, pending] = useActionState(createAdicionalAction, {} as ActionState)
  const [disponivel, setDisponivel] = useState(true)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo adicional
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-wrap items-end gap-3">
          <div className="space-y-1 flex-1 min-w-40">
            <Label className="text-xs">Nome</Label>
            <Input name="nome" placeholder="Ex: Queijo extra" className="h-9 text-sm" required />
          </div>
          <div className="space-y-1 w-32">
            <Label className="text-xs">Preço (R$)</Label>
            <Input name="preco" placeholder="2,00" className="h-9 text-sm" required />
          </div>
          <div className="flex items-center gap-2 pb-0.5">
            <input
              type="hidden"
              name="disponivel"
              value={disponivel ? "true" : "false"}
            />
            <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
              <input
                type="checkbox"
                checked={disponivel}
                onChange={(e) => setDisponivel(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              Disponível
            </label>
          </div>
          <Button size="sm" type="submit" disabled={pending} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            {pending ? "Salvando..." : "Adicionar"}
          </Button>
          {state.error && <p className="w-full text-sm text-destructive">{state.error}</p>}
          {state.success && <p className="w-full text-sm text-green-600">{state.success}</p>}
        </form>
      </CardContent>
    </Card>
  )
}

function EditForm({
  adicional,
  onCancel,
}: {
  adicional: Adicional
  onCancel: () => void
}) {
  const action = updateAdicionalAction.bind(null, adicional.id)
  const [state, formAction, pending] = useActionState(action, {} as ActionState)
  const [disponivel, setDisponivel] = useState(adicional.disponivel)

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3 mt-2">
      <div className="space-y-1 flex-1 min-w-40">
        <Label className="text-xs">Nome</Label>
        <Input name="nome" defaultValue={adicional.nome} className="h-9 text-sm" required />
      </div>
      <div className="space-y-1 w-32">
        <Label className="text-xs">Preço (R$)</Label>
        <Input
          name="preco"
          defaultValue={Number(adicional.preco).toFixed(2).replace(".", ",")}
          className="h-9 text-sm"
          required
        />
      </div>
      <div className="flex items-center gap-2 pb-0.5">
        <input type="hidden" name="disponivel" value={disponivel ? "true" : "false"} />
        <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
          <input
            type="checkbox"
            checked={disponivel}
            onChange={(e) => setDisponivel(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          Disponível
        </label>
      </div>
      <div className="flex items-center gap-2">
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

function ProdutosVinculados({
  adicional,
  produtos,
}: {
  adicional: Adicional
  produtos: Produto[]
}) {
  const [open, setOpen] = useState(false)
  const linkedIds = new Set(adicional.produtos.map((p) => p.produtoId))

  async function handleToggle(produtoId: string) {
    const linked = !linkedIds.has(produtoId)
    await toggleProdutoAdicionalAction(produtoId, adicional.id, linked)
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        {linkedIds.size} produto{linkedIds.size !== 1 ? "s" : ""} vinculado{linkedIds.size !== 1 ? "s" : ""}
      </button>
      {open && (
        <div className="mt-2 grid gap-1 sm:grid-cols-2">
          {produtos.map((p) => {
            const linked = linkedIds.has(p.id)
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleToggle(p.id)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all text-left ${
                  linked
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:border-foreground/30 text-muted-foreground"
                }`}
              >
                {linked ? <Link2 className="h-3.5 w-3.5 shrink-0" /> : <Link2Off className="h-3.5 w-3.5 shrink-0" />}
                {p.nome}
              </button>
            )
          })}
          {produtos.length === 0 && (
            <p className="text-xs text-muted-foreground col-span-2">Nenhum produto disponível.</p>
          )}
        </div>
      )}
    </div>
  )
}

function AdicionalRow({
  adicional,
  produtos,
}: {
  adicional: Adicional
  produtos: Produto[]
}) {
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`Excluir "${adicional.nome}"?`)) return
    setDeleting(true)
    await deleteAdicionalAction(adicional.id)
    setDeleting(false)
  }

  return (
    <div className="rounded-xl border surface-light p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm">{adicional.nome}</p>
              {!adicional.disponivel && (
                <Badge variant="secondary" className="text-xs">Indisponível</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{formatPreco(adicional.preco)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
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

      {editing && (
        <EditForm adicional={adicional} onCancel={() => setEditing(false)} />
      )}

      <ProdutosVinculados adicional={adicional} produtos={produtos} />
    </div>
  )
}

export function AdicionaisManager({
  adicionais,
  produtos,
}: {
  adicionais: Adicional[]
  produtos: Produto[]
}) {
  return (
    <div className="space-y-6">
      <CreateForm />

      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">
          {adicionais.length === 0
            ? "Nenhum adicional cadastrado."
            : `${adicionais.length} adicional${adicionais.length !== 1 ? "is" : ""}`}
        </p>
        {adicionais.map((a) => (
          <AdicionalRow key={a.id} adicional={a} produtos={produtos} />
        ))}
      </div>
    </div>
  )
}

"use client"

import { useActionState, useEffect, useState } from "react"

import {
  createFuncionarioAction,
  updateFuncionarioAction,
  deleteFuncionarioAction,
  type ActionState,
} from "@/app/painel/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Users } from "lucide-react"

type Funcionario = {
  id: string
  nome: string
  pin: string
  ativo: boolean
}

function CreateFuncionarioDialog() {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(createFuncionarioAction, {} as ActionState)

  useEffect(() => {
    if (state.success) setOpen(false)
  }, [state])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Funcionário
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastrar Funcionário</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input id="nome" name="nome" placeholder="João da Silva" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pin">PIN (4 a 6 dígitos) *</Label>
            <Input
              id="pin"
              name="pin"
              type="password"
              placeholder="1234"
              maxLength={6}
              inputMode="numeric"
              pattern="\d{4,6}"
              required
            />
            <p className="text-xs text-muted-foreground">O funcionário usará este PIN para entrar no app de atendimento.</p>
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditFuncionarioDialog({ func }: { func: Funcionario }) {
  const [open, setOpen] = useState(false)
  const boundAction = updateFuncionarioAction.bind(null, func.id)
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
          <DialogTitle>Editar — {func.nome}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`nome-${func.id}`}>Nome *</Label>
            <Input id={`nome-${func.id}`} name="nome" defaultValue={func.nome} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`pin-${func.id}`}>Novo PIN (deixe vazio para manter)</Label>
            <Input
              id={`pin-${func.id}`}
              name="pin"
              type="password"
              placeholder="Novo PIN..."
              maxLength={6}
              inputMode="numeric"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id={`ativo-${func.id}`}
              name="ativo"
              type="checkbox"
              defaultChecked={func.ativo}
              className="h-4 w-4"
            />
            <Label htmlFor={`ativo-${func.id}`}>Funcionário ativo</Label>
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

function DeleteFuncionarioButton({ funcId }: { funcId: string }) {
  const boundAction = deleteFuncionarioAction.bind(null, funcId)
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
          if (!confirm("Excluir este funcionário?")) e.preventDefault()
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </form>
  )
}

export function FuncionariosManager({ funcionarios, slug }: { funcionarios: Funcionario[]; slug: string }) {
  const ativos = funcionarios.filter((f) => f.ativo)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {ativos.length} ativo{ativos.length !== 1 ? "s" : ""}
          {funcionarios.length - ativos.length > 0 && `, ${funcionarios.length - ativos.length} inativo${funcionarios.length - ativos.length !== 1 ? "s" : ""}`}
        </p>
        <div className="flex items-center gap-3">
          <a
            href={`/${slug}/atendimento`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            App Garçom ↗
          </a>
          <CreateFuncionarioDialog />
        </div>
      </div>

      {funcionarios.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-16 text-center">
          <Users className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="font-medium text-muted-foreground">Nenhum funcionário cadastrado</p>
          <p className="text-sm text-muted-foreground mt-1">Cadastre garçons e atendentes para usar o app de salão</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden surface-light">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Nome</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">PIN</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {funcionarios.map((func) => (
                <tr key={func.id} className={!func.ativo ? "opacity-60" : ""}>
                  <td className="px-4 py-3 font-semibold text-gray-800">{func.nome}</td>
                  <td className="px-4 py-3">
                    <Badge variant={func.ativo ? "default" : "secondary"} className="text-xs">
                      {func.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-500">{"•".repeat(func.pin.length)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <EditFuncionarioDialog func={func} />
                      <DeleteFuncionarioButton funcId={func.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

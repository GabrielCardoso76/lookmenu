"use client"

import { useActionState } from "react"

import { updateLojaAction, type ActionState } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type EditarLojaFormProps = {
  loja: {
    id: string
    nome: string
    slug: string
    telefoneWhatsapp: string
    corPrimaria: string
    ativa: boolean
  }
}

export function EditarLojaForm({ loja }: EditarLojaFormProps) {
  const boundAction = updateLojaAction.bind(null, loja.id)
  const [state, formAction, pending] = useActionState(boundAction, {} as ActionState)

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome</Label>
        <Input id="nome" name="nome" defaultValue={loja.nome} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" defaultValue={loja.slug} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="telefoneWhatsapp">Telefone WhatsApp</Label>
        <Input id="telefoneWhatsapp" name="telefoneWhatsapp" defaultValue={loja.telefoneWhatsapp} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="corPrimaria">Cor primária</Label>
        <Input
          id="corPrimaria"
          name="corPrimaria"
          type="color"
          defaultValue={loja.corPrimaria}
          className="h-12 w-24 p-1"
        />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="ativa" name="ativa" defaultChecked={loja.ativa} className="h-4 w-4 accent-primary" />
        <Label htmlFor="ativa">Loja ativa</Label>
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-primary">{state.success}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar alterações"}
      </Button>
    </form>
  )
}

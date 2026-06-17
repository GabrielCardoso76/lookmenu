"use client"

import { useActionState } from "react"

import { createLojaAction, type ActionState } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const initialState: ActionState = {}

export function NovaLojaForm() {
  const [state, formAction, pending] = useActionState(createLojaAction, initialState)

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome</Label>
        <Input id="nome" name="nome" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug (URL)</Label>
        <Input id="slug" name="slug" placeholder="gerado automaticamente se vazio" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="telefoneWhatsapp">Telefone WhatsApp</Label>
        <Input id="telefoneWhatsapp" name="telefoneWhatsapp" placeholder="5511999999999" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="corPrimaria">Cor primária</Label>
        <Input id="corPrimaria" name="corPrimaria" type="color" defaultValue="#F59E0B" className="h-12 w-24 p-1" />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="ativa" name="ativa" defaultChecked className="h-4 w-4 accent-primary" />
        <Label htmlFor="ativa">Loja ativa</Label>
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Criar loja"}
      </Button>
    </form>
  )
}

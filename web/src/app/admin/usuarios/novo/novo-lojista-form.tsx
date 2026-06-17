"use client"

import { useActionState } from "react"

import { createLojistaAction, type ActionState } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type LojaOption = {
  id: string
  nome: string
  slug: string
  temLojista: boolean
}

type NovoLojistaFormProps = {
  lojas: LojaOption[]
}

const initialState: ActionState = {}

export function NovoLojistaForm({ lojas }: NovoLojistaFormProps) {
  const [state, formAction, pending] = useActionState(createLojistaAction, initialState)

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome</Label>
        <Input id="nome" name="nome" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="senha">Senha</Label>
        <Input id="senha" name="senha" type="password" minLength={6} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="lojaId">Loja</Label>
        <select
          id="lojaId"
          name="lojaId"
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          defaultValue=""
        >
          <option value="" disabled>
            Selecione uma loja
          </option>
          {lojas.map((loja) => (
            <option key={loja.id} value={loja.id} disabled={loja.temLojista}>
              {loja.nome} ({loja.slug}){loja.temLojista ? " — já tem lojista" : ""}
            </option>
          ))}
        </select>
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Criando..." : "Criar lojista"}
      </Button>
    </form>
  )
}

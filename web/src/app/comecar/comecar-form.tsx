"use client"

import Link from "next/link"
import { useActionState, useEffect, useState } from "react"

import { cadastrarLojaPublicaAction, type CadastroState } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function slugifyClient(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

const PLANOS = [
  { id: "START", label: "Start", desc: "Para quem está começando" },
  { id: "PLUS", label: "Plus", desc: "Recursos para crescer" },
] as const

export function ComecarForm({ planoInicial }: { planoInicial: "START" | "PLUS" }) {
  const [state, formAction, pending] = useActionState(cadastrarLojaPublicaAction, {} as CadastroState)

  const [nomeLoja, setNomeLoja] = useState(state.values?.nomeLoja ?? "")
  const [slug, setSlug] = useState(state.values?.slug ?? "")
  const [slugEditado, setSlugEditado] = useState(false)
  const [plano, setPlano] = useState<"START" | "PLUS">(
    (state.values?.plano as "START" | "PLUS") ?? planoInicial,
  )

  useEffect(() => {
    if (!slugEditado) setSlug(slugifyClient(nomeLoja))
  }, [nomeLoja, slugEditado])

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="nomeLoja">Nome do estabelecimento</Label>
        <Input
          id="nomeLoja"
          name="nomeLoja"
          value={nomeLoja}
          onChange={(e) => setNomeLoja(e.target.value)}
          placeholder="Burger do João"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Endereço do cardápio</Label>
        <div className="flex items-center gap-1 rounded-md border border-input bg-background px-3 focus-within:ring-2 focus-within:ring-ring">
          <span className="text-sm text-muted-foreground">lookmenu.app/</span>
          <input
            id="slug"
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlugEditado(true)
              setSlug(slugifyClient(e.target.value))
            }}
            placeholder="burger-do-joao"
            className="flex-1 bg-transparent py-2 text-sm outline-none"
            required
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Esse será o link público do seu cardápio. Você pode alterar depois.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="nomeResponsavel">Seu nome (responsável)</Label>
        <Input
          id="nomeResponsavel"
          name="nomeResponsavel"
          defaultValue={state.values?.nomeResponsavel ?? ""}
          placeholder="João Silva"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.values?.email ?? ""}
          placeholder="voce@exemplo.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="senha">Senha</Label>
        <Input
          id="senha"
          name="senha"
          type="password"
          autoComplete="new-password"
          minLength={6}
          placeholder="Mínimo 6 caracteres"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="telefoneWhatsapp">WhatsApp da loja</Label>
        <Input
          id="telefoneWhatsapp"
          name="telefoneWhatsapp"
          defaultValue={state.values?.telefoneWhatsapp ?? ""}
          placeholder="(11) 99999-9999"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Plano</Label>
        <input type="hidden" name="plano" value={plano} />
        <div className="grid grid-cols-2 gap-3">
          {PLANOS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPlano(p.id)}
              className={`rounded-xl border-2 p-3 text-left transition-all ${
                plano === p.id ? "border-primary bg-primary/5" : "border-border hover:border-foreground/30"
              }`}
            >
              <p className="text-sm font-semibold">{p.label}</p>
              <p className="text-xs text-muted-foreground">{p.desc}</p>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Comece com 14 dias grátis. Sem cobrança agora.
        </p>
      </div>

      {state.error ? (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{state.error}</p>
      ) : null}

      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "Criando sua loja..." : "Criar minha loja grátis"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Faça login
        </Link>
      </p>
    </form>
  )
}

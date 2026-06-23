"use client"

import { useActionState, useState } from "react"
import { loginFuncionarioAction, type AtendimentoLoginState } from "./actions"
import { Button } from "@/components/ui/button"
import { UtensilsCrossed } from "lucide-react"

type Funcionario = { id: string; nome: string }

type LojaData = {
  nome: string
  slug: string
  corPrimaria: string
  logoUrl: string | null
}

export function AtendimentoLogin({
  loja,
  funcionarios,
}: {
  loja: LojaData
  funcionarios: Funcionario[]
}) {
  const [selectedId, setSelectedId] = useState<string>("")
  const [pin, setPin] = useState("")

  const boundAction = loginFuncionarioAction.bind(null, loja.slug)
  const [state, formAction, pending] = useActionState(boundAction, {} as AtendimentoLoginState)

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 px-4"
    >
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          {loja.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={loja.logoUrl}
              alt={loja.nome}
              className="h-16 w-16 rounded-2xl object-contain mx-auto mb-4 border border-border bg-white p-1.5"
            />
          ) : (
            <div
              className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: loja.corPrimaria }}
            >
              <UtensilsCrossed className="h-8 w-8 text-white" />
            </div>
          )}
          <h1 className="text-2xl font-bold">{loja.nome}</h1>
          <p className="text-muted-foreground text-sm mt-1">App de Atendimento</p>
        </div>

        <div className="rounded-2xl border border-border bg-white shadow-sm p-6 space-y-5">
          <form action={formAction} className="space-y-5">
            {/* Select funcionário */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Quem está atendendo?</p>
              {funcionarios.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum funcionário cadastrado. <br />
                  Peça ao lojista para cadastrar funcionários no painel.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {funcionarios.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSelectedId(f.id)}
                      className={`rounded-xl border-2 p-3 text-sm font-medium text-center transition-all ${
                        selectedId === f.id
                          ? "text-white"
                          : "border-border hover:border-foreground/30"
                      }`}
                      style={selectedId === f.id ? { borderColor: loja.corPrimaria, backgroundColor: loja.corPrimaria } : {}}
                    >
                      {f.nome}
                    </button>
                  ))}
                </div>
              )}
              <input type="hidden" name="funcionarioId" value={selectedId} />
            </div>

            {/* PIN */}
            {selectedId && (
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="pin">
                  PIN
                </label>
                <input
                  id="pin"
                  name="pin"
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  autoFocus
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••"
                  className="w-full text-center text-2xl tracking-widest rounded-xl border border-border px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}

            {state.error && (
              <p className="text-sm text-destructive text-center">{state.error}</p>
            )}

            <Button
              type="submit"
              disabled={pending || !selectedId || pin.length < 4}
              className="w-full rounded-xl py-5 font-bold text-white"
              style={{ backgroundColor: loja.corPrimaria }}
            >
              {pending ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

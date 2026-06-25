"use client"

import { useActionState, useState, useTransition } from "react"

import {
  testarConexaoIfoodAction,
  updateIfoodAction,
  type ActionState,
} from "@/app/painel/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

type IfoodConfig = {
  ifoodEntregaFacilAtivo: boolean
  ifoodMerchantId: string | null
  conectado: boolean
  appConfigurado: boolean
}

export function IfoodForm({ config }: { config: IfoodConfig }) {
  const [state, formAction, pending] = useActionState(updateIfoodAction, {} as ActionState)
  const [ativo, setAtivo] = useState(config.ifoodEntregaFacilAtivo)
  const [testando, startTeste] = useTransition()
  const [testeResult, setTesteResult] = useState<ActionState | null>(null)

  function handleTestar() {
    startTeste(async () => {
      const res = await testarConexaoIfoodAction()
      setTesteResult(res)
    })
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="ifoodEntregaFacilAtivo" value={ativo ? "true" : "false"} />

      {!config.appConfigurado && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-semibold">Integração desconectada.</p>
          <p>
            As credenciais de aplicação do iFood (IFOOD_CLIENT_ID e IFOOD_CLIENT_SECRET) não estão
            configuradas no servidor. Configure-as no .env para habilitar a solicitação de entregadores.
            Veja <code>docs/ifood-entrega-facil-setup.md</code>.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between rounded-xl border border-border p-4">
        <div>
          <Label htmlFor="ifood-switch" className="text-base">
            iFood Entrega Fácil
          </Label>
          <p className="text-sm text-muted-foreground">
            Solicite entregadores do iFood para seus pedidos delivery direto do KDS.
          </p>
        </div>
        <Switch id="ifood-switch" checked={ativo} onCheckedChange={setAtivo} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ifoodMerchantId">Merchant ID (iFood)</Label>
        <p className="text-xs text-muted-foreground">
          Identificador da sua loja no iFood. Disponível no Portal do Parceiro.
        </p>
        <Input
          id="ifoodMerchantId"
          name="ifoodMerchantId"
          defaultValue={config.ifoodMerchantId ?? ""}
          placeholder="00000000-0000-0000-0000-000000000000"
        />
      </div>

      {state.error && (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{state.success}</p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar"}
        </Button>
        <Button type="button" variant="outline" onClick={handleTestar} disabled={testando}>
          {testando ? "Testando..." : "Testar conexão"}
        </Button>
      </div>

      {testeResult?.error && (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{testeResult.error}</p>
      )}
      {testeResult?.success && (
        <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{testeResult.success}</p>
      )}
    </form>
  )
}

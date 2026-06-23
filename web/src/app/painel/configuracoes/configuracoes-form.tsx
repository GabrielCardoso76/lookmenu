"use client"

import { useActionState, useState } from "react"

import { updatePagamentosAction, type ActionState } from "@/app/painel/actions"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

type ConfigPagamentos = {
  aceitaPixSite: boolean
  aceitaCartaoEntrega: boolean
  aceitaDinheiroEntrega: boolean
  pagamentoNoSite: boolean
  pagamentoNaMesa: boolean
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border surface-light p-4 transition-all hover:border-foreground/20">
      <div className="space-y-0.5">
        <p className="font-medium text-sm">{label}</p>
        {description && <p className="text-xs surface-light-muted">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} className="mt-0.5 shrink-0" aria-label={label} />
    </div>
  )
}

export function ConfiguracoesForm({ config }: { config: ConfigPagamentos }) {
  const [state, formAction, pending] = useActionState(updatePagamentosAction, {} as ActionState)

  const [aceitaPixSite, setAceitaPixSite] = useState(config.aceitaPixSite)
  const [aceitaCartaoEntrega, setAceitaCartaoEntrega] = useState(config.aceitaCartaoEntrega)
  const [aceitaDinheiroEntrega, setAceitaDinheiroEntrega] = useState(config.aceitaDinheiroEntrega)
  const [pagamentoNoSite, setPagamentoNoSite] = useState(config.pagamentoNoSite)
  const [pagamentoNaMesa, setPagamentoNaMesa] = useState(config.pagamentoNaMesa)

  return (
    <form action={formAction} className="space-y-8">
      {/* Métodos aceitos */}
      <div className="space-y-3">
        <Label className="text-base">Métodos de pagamento aceitos</Label>
        <p className="text-sm text-muted-foreground">
          Defina quais formas de pagamento seus clientes podem usar.
        </p>
        <div className="space-y-2">
          <Toggle
            checked={aceitaPixSite}
            onChange={setAceitaPixSite}
            label="PIX no site"
            description="Cliente paga via PIX direto no checkout (simulado)"
          />
          <Toggle
            checked={aceitaCartaoEntrega}
            onChange={setAceitaCartaoEntrega}
            label="Cartão na entrega / retirada"
            description="Maquininha na entrega ou no balcão"
          />
          <Toggle
            checked={aceitaDinheiroEntrega}
            onChange={setAceitaDinheiroEntrega}
            label="Dinheiro na entrega / retirada"
            description="Pagamento em espécie"
          />
        </div>
      </div>

      {/* Momento do pagamento — online */}
      <div className="space-y-3">
        <Label className="text-base">Checkout online</Label>
        <p className="text-sm text-muted-foreground">
          Controla se o cliente precisa pagar no site ou pode pagar na entrega/retirada.
        </p>
        <div className="space-y-2">
          <Toggle
            checked={pagamentoNoSite}
            onChange={setPagamentoNoSite}
            label="Exigir pagamento no checkout"
            description={
              pagamentoNoSite
                ? "Cliente deve pagar via PIX antes de confirmar o pedido"
                : "Cliente escolhe pagar na entrega ou retirada — pedido nasce como Pendente"
            }
          />
        </div>
      </div>

      {/* Momento do pagamento — salão */}
      <div className="space-y-3">
        <Label className="text-base">Salão / mesas</Label>
        <p className="text-sm text-muted-foreground">
          Controla o fluxo de fechamento de conta no app do garçom.
        </p>
        <div className="space-y-2">
          <Toggle
            checked={pagamentoNaMesa}
            onChange={setPagamentoNaMesa}
            label="Aceitar pagamento na mesa"
            description={
              pagamentoNaMesa
                ? "Garçom registra o método (dinheiro ou cartão) ao fechar a conta"
                : "Pagamento é gerenciado externamente — pedidos ficam como Pendente"
            }
          />
        </div>
      </div>

      {/* Hidden fields */}
      <input type="hidden" name="aceitaPixSite" value={String(aceitaPixSite)} />
      <input type="hidden" name="aceitaCartaoEntrega" value={String(aceitaCartaoEntrega)} />
      <input type="hidden" name="aceitaDinheiroEntrega" value={String(aceitaDinheiroEntrega)} />
      <input type="hidden" name="pagamentoNoSite" value={String(pagamentoNoSite)} />
      <input type="hidden" name="pagamentoNaMesa" value={String(pagamentoNaMesa)} />

      {state.error && (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{state.success}</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar configurações"}
      </Button>
    </form>
  )
}

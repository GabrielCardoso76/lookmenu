"use client"

import { useActionState, useState, useTransition } from "react"

import {
  movimentarEstoqueAction,
  toggleControlaEstoqueAction,
  type ActionState,
} from "@/app/painel/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

type ProdutoEstoque = {
  id: string
  nome: string
  categoriaNome: string
  controlaEstoque: boolean
  quantidadeEstoque: number
  estoqueMinimo: number | null
  disponivel: boolean
}

type MovimentacaoRow = {
  id: string
  tipo: string
  quantidade: number
  quantidadeAnterior: number
  quantidadeNova: number
  observacao: string | null
  criadoEm: string
  produtoNome: string
}

type EstoqueManagerProps = {
  produtos: ProdutoEstoque[]
  movimentacoes: MovimentacaoRow[]
}

type DialogConfig = {
  open: boolean
  produtoId: string
  produtoNome: string
  quantidadeAtual: number
  tipo: "ENTRADA" | "SAIDA" | "AJUSTE" | null
}

const TIPO_LABELS: Record<string, string> = {
  ENTRADA: "Entrada",
  SAIDA: "Saída",
  AJUSTE: "Ajuste",
  VENDA: "Venda",
  CANCELAMENTO: "Cancelamento",
}

const TIPO_COLORS: Record<string, string> = {
  ENTRADA: "bg-green-100 text-green-800",
  SAIDA: "bg-red-100 text-red-800",
  AJUSTE: "bg-blue-100 text-blue-800",
  VENDA: "bg-orange-100 text-orange-800",
  CANCELAMENTO: "bg-purple-100 text-purple-800",
}

function MovimentacaoDialog({
  config,
  onClose,
}: {
  config: DialogConfig
  onClose: () => void
}) {
  const boundAction = movimentarEstoqueAction
  const [state, action, pending] = useActionState(boundAction, {} as ActionState)

  if (state.success) {
    setTimeout(onClose, 800)
  }

  const tipoLabels = { ENTRADA: "Entrada de estoque", SAIDA: "Saída de estoque", AJUSTE: "Ajuste de estoque" }
  const tipoDescs = {
    ENTRADA: "Adiciona unidades ao estoque atual.",
    SAIDA: "Remove unidades do estoque atual.",
    AJUSTE: "Define a quantidade absoluta do estoque.",
  }

  return (
    <Dialog open={config.open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{config.tipo ? tipoLabels[config.tipo] : ""}</DialogTitle>
          <p className="text-sm text-muted-foreground">{config.produtoNome}</p>
        </DialogHeader>

        {config.tipo && (
          <form action={action} className="space-y-4">
            <input type="hidden" name="produtoId" value={config.produtoId} />
            <input type="hidden" name="tipo" value={config.tipo} />

            <p className="text-xs text-muted-foreground">
              {tipoDescs[config.tipo]} Estoque atual:{" "}
              <strong>{config.quantidadeAtual}</strong> unidades.
            </p>

            <div className="space-y-1">
              <Label>
                {config.tipo === "AJUSTE" ? "Nova quantidade (absoluta)" : "Quantidade"}
              </Label>
              <Input
                name="quantidade"
                type="number"
                min="1"
                step="1"
                required
                placeholder={config.tipo === "AJUSTE" ? String(config.quantidadeAtual) : "Ex: 10"}
                autoFocus
              />
            </div>

            <div className="space-y-1">
              <Label>Observação (opcional)</Label>
              <Textarea name="observacao" placeholder="Ex: Compra fornecedor X" rows={2} />
            </div>

            {state.error && <p className="text-xs text-destructive">{state.error}</p>}
            {state.success && <p className="text-xs text-green-600">{state.success}</p>}

            <div className="flex gap-2">
              <Button type="submit" disabled={pending} size="sm">
                {pending ? "Salvando..." : "Confirmar"}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

function ProdutoEstoqueRow({
  produto,
  onMovimentar,
}: {
  produto: ProdutoEstoque
  onMovimentar: (tipo: "ENTRADA" | "SAIDA" | "AJUSTE") => void
}) {
  const [isPending, startTransition] = useTransition()
  const emAlerta = produto.controlaEstoque && produto.estoqueMinimo != null && produto.quantidadeEstoque <= produto.estoqueMinimo
  const semEstoque = produto.controlaEstoque && produto.quantidadeEstoque === 0

  function handleToggle() {
    startTransition(async () => {
      await toggleControlaEstoqueAction(produto.id, !produto.controlaEstoque)
    })
  }

  return (
    <tr className="border-b hover:bg-muted/20">
      <td className="px-4 py-3">
        <div className="font-medium">{produto.nome}</div>
        <div className="text-xs text-muted-foreground">{produto.categoriaNome}</div>
      </td>
      <td className="px-4 py-3 text-center">
        {produto.controlaEstoque ? (
          <div className="flex flex-col items-center gap-1">
            <span className={`text-lg font-bold ${semEstoque ? "text-destructive" : ""}`}>
              {produto.quantidadeEstoque}
            </span>
            {emAlerta && !semEstoque && (
              <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                Baixo
              </Badge>
            )}
            {semEstoque && (
              <Badge variant="destructive" className="text-xs">
                Sem estoque
              </Badge>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-center text-sm text-muted-foreground">
        {produto.estoqueMinimo ?? "—"}
      </td>
      <td className="px-4 py-3 text-center">
        <Button
          type="button"
          variant={produto.controlaEstoque ? "default" : "outline"}
          size="sm"
          onClick={handleToggle}
          disabled={isPending}
          className="text-xs"
        >
          {produto.controlaEstoque ? "Ativo" : "Inativo"}
        </Button>
      </td>
      <td className="px-4 py-3">
        {produto.controlaEstoque ? (
          <div className="flex gap-1.5">
            <Button type="button" size="sm" variant="outline" className="text-xs h-7 px-2" onClick={() => onMovimentar("ENTRADA")}>
              + Entrada
            </Button>
            <Button type="button" size="sm" variant="outline" className="text-xs h-7 px-2" onClick={() => onMovimentar("SAIDA")}>
              − Saída
            </Button>
            <Button type="button" size="sm" variant="outline" className="text-xs h-7 px-2" onClick={() => onMovimentar("AJUSTE")}>
              Ajustar
            </Button>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">Ative o controle para movimentar</span>
        )}
      </td>
    </tr>
  )
}

export function EstoqueManager({ produtos, movimentacoes }: EstoqueManagerProps) {
  const [filtro, setFiltro] = useState<"todos" | "baixo" | "sem_controle">("todos")
  const [dialog, setDialog] = useState<DialogConfig>({
    open: false,
    produtoId: "",
    produtoNome: "",
    quantidadeAtual: 0,
    tipo: null,
  })

  const produtosFiltrados = produtos.filter((p) => {
    if (filtro === "baixo") {
      return p.controlaEstoque && p.estoqueMinimo != null && p.quantidadeEstoque <= p.estoqueMinimo
    }
    if (filtro === "sem_controle") return !p.controlaEstoque
    return true
  })

  const emAlertaCount = produtos.filter(
    (p) => p.controlaEstoque && p.estoqueMinimo != null && p.quantidadeEstoque <= p.estoqueMinimo,
  ).length

  function openDialog(produto: ProdutoEstoque, tipo: "ENTRADA" | "SAIDA" | "AJUSTE") {
    setDialog({
      open: true,
      produtoId: produto.id,
      produtoNome: produto.nome,
      quantidadeAtual: produto.quantidadeEstoque,
      tipo,
    })
  }

  function closeDialog() {
    setDialog((prev) => ({ ...prev, open: false }))
  }

  return (
    <div className="space-y-6">
      <MovimentacaoDialog config={dialog} onClose={closeDialog} />

      {/* Filtro tabs */}
      <Tabs value={filtro} onValueChange={(v) => setFiltro(v as typeof filtro)}>
        <TabsList>
          <TabsTrigger value="todos">Todos ({produtos.length})</TabsTrigger>
          <TabsTrigger value="baixo">
            Baixo estoque
            {emAlertaCount > 0 && (
              <Badge variant="destructive" className="ml-1.5 text-xs px-1.5 py-0">
                {emAlertaCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sem_controle">
            Sem controle ({produtos.filter((p) => !p.controlaEstoque).length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Produto</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground text-center">Qtd</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground text-center">Mínimo</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground text-center">Controle</th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      Nenhum produto encontrado para este filtro.
                    </td>
                  </tr>
                ) : (
                  produtosFiltrados.map((produto) => (
                    <ProdutoEstoqueRow
                      key={produto.id}
                      produto={produto}
                      onMovimentar={(tipo) => openDialog(produto, tipo)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Histórico */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Histórico recente (últimas 50 movimentações)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {movimentacoes.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-muted-foreground">Nenhuma movimentação registrada.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-4 py-2 font-semibold text-muted-foreground">Data/Hora</th>
                    <th className="px-4 py-2 font-semibold text-muted-foreground">Produto</th>
                    <th className="px-4 py-2 font-semibold text-muted-foreground">Tipo</th>
                    <th className="px-4 py-2 font-semibold text-muted-foreground text-center">Qtd</th>
                    <th className="px-4 py-2 font-semibold text-muted-foreground text-center">Antes → Depois</th>
                    <th className="px-4 py-2 font-semibold text-muted-foreground">Obs.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {movimentacoes.map((m) => (
                    <tr key={m.id} className="hover:bg-muted/20">
                      <td className="px-4 py-2 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(m.criadoEm).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-2 font-medium">{m.produtoNome}</td>
                      <td className="px-4 py-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TIPO_COLORS[m.tipo] ?? "bg-gray-100 text-gray-800"}`}>
                          {TIPO_LABELS[m.tipo] ?? m.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center font-mono">{m.quantidade}</td>
                      <td className="px-4 py-2 text-center text-xs text-muted-foreground">
                        {m.quantidadeAnterior} → <strong>{m.quantidadeNova}</strong>
                      </td>
                      <td className="px-4 py-2 text-xs text-muted-foreground max-w-[180px] truncate">
                        {m.observacao ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

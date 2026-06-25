"use client"

import { useActionState, useEffect, useState } from "react"

import { criarVendaPdvAction, type PdvActionState } from "@/app/painel/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

type ProdutoPdv = {
  id: string
  nome: string
  preco: number
  categoriaId: string
  categoriaNome: string
  controlaEstoque: boolean
  quantidadeEstoque: number
  estoqueMinimo: number | null
  imagemUrl: string | null
}

type CartItem = {
  produtoId: string
  nome: string
  preco: number
  quantidade: number
}

type PdvClientProps = {
  produtos: ProdutoPdv[]
}

function formatPreco(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function PdvClient({ produtos }: PdvClientProps) {
  const [busca, setBusca] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [state, action, pending] = useActionState(criarVendaPdvAction, {} as PdvActionState)

  useEffect(() => {
    if (state.success) {
      setCart([])
    }
  }, [state.success, state.pedidoId])

  const produtosFiltrados = produtos.filter(
    (p) =>
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.categoriaNome.toLowerCase().includes(busca.toLowerCase()),
  )

  const categorias = Array.from(new Set(produtosFiltrados.map((p) => p.categoriaNome)))

  function addToCart(produto: ProdutoPdv) {
    setCart((prev) => {
      const existing = prev.find((i) => i.produtoId === produto.id)
      if (existing) {
        return prev.map((i) =>
          i.produtoId === produto.id ? { ...i, quantidade: i.quantidade + 1 } : i,
        )
      }
      return [...prev, { produtoId: produto.id, nome: produto.nome, preco: produto.preco, quantidade: 1 }]
    })
  }

  function updateQty(produtoId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((i) => (i.produtoId === produtoId ? { ...i, quantidade: i.quantidade + delta } : i))
        .filter((i) => i.quantidade > 0),
    )
  }

  function removeItem(produtoId: string) {
    setCart((prev) => prev.filter((i) => i.produtoId !== produtoId))
  }

  const total = cart.reduce((s, i) => s + i.preco * i.quantidade, 0)
  const itemCount = cart.reduce((s, i) => s + i.quantidade, 0)

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      {/* Catálogo */}
      <div className="min-w-0 flex-1 space-y-4">
        <Input
          placeholder="Buscar produto ou categoria…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="max-w-sm"
        />

        {categorias.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum produto disponível.</p>
        ) : (
          categorias.map((cat) => (
            <div key={cat}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {cat}
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
                {produtosFiltrados
                  .filter((p) => p.categoriaNome === cat)
                  .map((produto) => {
                    const emAlerta =
                      produto.controlaEstoque &&
                      produto.estoqueMinimo != null &&
                      produto.quantidadeEstoque <= produto.estoqueMinimo
                    return (
                      <button
                        key={produto.id}
                        type="button"
                        onClick={() => addToCart(produto)}
                        className="group relative flex flex-col gap-1 rounded-xl border border-border bg-card p-3 text-left transition hover:border-primary hover:shadow-sm active:scale-[0.98]"
                      >
                        {produto.imagemUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={produto.imagemUrl}
                            alt={produto.nome}
                            className="mb-1 h-16 w-full rounded-lg object-cover"
                          />
                        )}
                        <span className="text-sm font-medium leading-tight">{produto.nome}</span>
                        <span className="text-sm font-bold text-primary">
                          {formatPreco(produto.preco)}
                        </span>
                        {produto.controlaEstoque && (
                          <span className="text-xs text-muted-foreground">
                            Estoque: {produto.quantidadeEstoque}
                          </span>
                        )}
                        {emAlerta && (
                          <Badge variant="destructive" className="absolute right-2 top-2 text-xs px-1">
                            Baixo
                          </Badge>
                        )}
                      </button>
                    )
                  })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Carrinho */}
      <div className="w-full lg:w-80 xl:w-96 shrink-0">
        <Card className="sticky top-6">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base">
              Carrinho
              {itemCount > 0 && (
                <Badge variant="secondary">{itemCount} item{itemCount !== 1 ? "s" : ""}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Clique em um produto para adicionar.
              </p>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {cart.map((item) => (
                  <div key={item.produtoId} className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatPreco(item.preco)} × {item.quantidade} = {formatPreco(item.preco * item.quantidade)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        className="flex h-6 w-6 items-center justify-center rounded border text-sm hover:bg-muted"
                        onClick={() => updateQty(item.produtoId, -1)}
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantidade}</span>
                      <button
                        type="button"
                        className="flex h-6 w-6 items-center justify-center rounded border text-sm hover:bg-muted"
                        onClick={() => updateQty(item.produtoId, 1)}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className="ml-1 text-xs text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(item.produtoId)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {cart.length > 0 && (
              <>
                <Separator />
                <div className="flex items-center justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-xl text-primary">{formatPreco(total)}</span>
                </div>

                <form action={action} className="space-y-3">
                  <input type="hidden" name="itens" value={JSON.stringify(cart.map(i => ({ produtoId: i.produtoId, quantidade: i.quantidade, precoUnitario: i.preco })))} />

                  <div className="space-y-1">
                    <Label className="text-xs">Cliente (opcional)</Label>
                    <Input name="nomeCliente" placeholder="Balcão / Nome do cliente" className="h-8 text-sm" />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Pagamento</Label>
                    <select
                      name="metodoPagamento"
                      defaultValue="DINHEIRO_ENTREGA"
                      className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                    >
                      <option value="DINHEIRO_ENTREGA">Dinheiro</option>
                      <option value="CARTAO_ENTREGA">Cartão</option>
                    </select>
                  </div>

                  {state.error && (
                    <p className="text-xs text-destructive">{state.error}</p>
                  )}
                  {state.success && (
                    <p className="text-xs font-medium text-green-600">{state.success}</p>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={pending || cart.length === 0}
                    size="lg"
                  >
                    {pending ? "Registrando…" : `Finalizar venda — ${formatPreco(total)}`}
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

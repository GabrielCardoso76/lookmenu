"use client"

import { useActionState, useRef, useState, useTransition } from "react"

import {
  createProdutoAction,
  deleteProdutoAction,
  updateProdutoAction,
  type ActionState,
} from "@/app/painel/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type CategoriaOption = { id: string; nome: string }

type ProdutoRow = {
  id: string
  nome: string
  descricao: string
  preco: string
  categoriaId: string
  categoriaNome: string
  disponivel: boolean
  emDestaque: boolean
  destinoPreparo: string
  imagemUrl: string | null
  controlaEstoque: boolean
  quantidadeEstoque: number
  estoqueMinimo: number | null
}

type ProdutosManagerProps = {
  produtos: ProdutoRow[]
  categorias: CategoriaOption[]
}

const DESTINO_OPTIONS = [
  { value: "NENHUM", label: "Nenhum" },
  { value: "COZINHA", label: "Cozinha" },
  { value: "BAR", label: "Bar" },
]

function ImagemUrlField({
  defaultValue,
  name,
}: {
  defaultValue?: string | null
  name: string
}) {
  const [preview, setPreview] = useState(defaultValue ?? "")
  const [uploading, startUpload] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    startUpload(async () => {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("path", `produtos/${Date.now()}-${file.name}`)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (res.ok) {
        const { url } = (await res.json()) as { url: string }
        setPreview(url)
      }
    })
  }

  return (
    <div className="space-y-2 sm:col-span-2">
      <Label className="text-xs">Imagem do produto</Label>
      <div className="flex items-start gap-3">
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="preview"
            className="h-16 w-16 shrink-0 rounded-lg border border-border object-cover"
          />
        )}
        <div className="flex-1 space-y-1.5">
          <Input
            name={name}
            value={preview}
            onChange={(e) => setPreview(e.target.value)}
            placeholder="https://... ou selecione um arquivo"
            className="text-sm"
          />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="text-xs"
            >
              {uploading ? "Enviando..." : "Escolher arquivo"}
            </Button>
            {preview && (
              <button
                type="button"
                onClick={() => setPreview("")}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                Remover
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
      </div>
    </div>
  )
}

function ProdutoRowItem({
  produto,
  categorias,
}: {
  produto: ProdutoRow
  categorias: CategoriaOption[]
}) {
  const boundUpdate = updateProdutoAction.bind(null, produto.id)
  const boundDelete = deleteProdutoAction.bind(null, produto.id)
  const [updateState, updateAction, updatePending] = useActionState(boundUpdate, {} as ActionState)
  const [deleteState, deleteAction, deletePending] = useActionState(boundDelete, {} as ActionState)

  return (
    <TableRow>
      <TableCell colSpan={3}>
        <form action={updateAction} className="grid gap-2 sm:grid-cols-2">
          <Input name="nome" defaultValue={produto.nome} placeholder="Nome" required />
          <Input name="preco" type="number" step="0.01" min="0.01" defaultValue={produto.preco} required />
          <Textarea name="descricao" defaultValue={produto.descricao} placeholder="Descrição" className="sm:col-span-2" required />
          <select
            name="categoriaId"
            defaultValue={produto.categoriaId}
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
          <select
            name="destinoPreparo"
            defaultValue={produto.destinoPreparo}
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {DESTINO_OPTIONS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
          <ImagemUrlField defaultValue={produto.imagemUrl} name="imagemUrl" />
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="disponivel" defaultChecked={produto.disponivel} className="h-4 w-4 accent-primary" />
              Disponível
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="emDestaque" defaultChecked={produto.emDestaque} className="h-4 w-4 accent-primary" />
              Destaque ⭐
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="controlaEstoque" defaultChecked={produto.controlaEstoque} className="h-4 w-4 accent-primary" />
              Controlar estoque
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:col-span-2">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Estoque mínimo (alerta)</label>
              <Input name="estoqueMinimo" type="number" min="0" step="1" defaultValue={produto.estoqueMinimo ?? ""} placeholder="Ex: 5" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Qtd atual: {produto.quantidadeEstoque}</label>
              <p className="text-xs text-muted-foreground pt-2">Ajuste via <a href="/painel/estoque" className="underline">Estoque</a></p>
            </div>
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" size="sm" disabled={updatePending}>
              Salvar
            </Button>
          </div>
          {updateState.error ? <p className="text-xs text-destructive sm:col-span-2">{updateState.error}</p> : null}
          {updateState.success ? <p className="text-xs text-primary sm:col-span-2">{updateState.success}</p> : null}
        </form>
        <form action={deleteAction} className="mt-2">
          <Button type="submit" size="sm" variant="destructive" disabled={deletePending}>
            Excluir
          </Button>
          {deleteState.error ? <p className="mt-1 text-xs text-destructive">{deleteState.error}</p> : null}
        </form>
      </TableCell>
    </TableRow>
  )
}

export function ProdutosManager({ produtos, categorias }: ProdutosManagerProps) {
  const [createState, createAction, createPending] = useActionState(createProdutoAction, {} as ActionState)

  if (categorias.length === 0) {
    return <p className="text-muted-foreground">Cadastre pelo menos uma categoria antes de adicionar produtos.</p>
  }

  return (
    <div className="space-y-8">
      <form action={createAction} className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="nome-novo">Novo produto</Label>
          <Input id="nome-novo" name="nome" placeholder="Nome" required />
        </div>
        <Textarea name="descricao" placeholder="Descrição" className="sm:col-span-2" required />
        <Input name="preco" type="number" step="0.01" min="0.01" placeholder="Preço" required />
        <select
          name="categoriaId"
          required
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          defaultValue={categorias[0]?.id}
        >
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
        <select
          name="destinoPreparo"
          defaultValue="NENHUM"
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {DESTINO_OPTIONS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
        <ImagemUrlField name="imagemUrl" />
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="disponivel" defaultChecked className="h-4 w-4 accent-primary" />
            Disponível
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="emDestaque" className="h-4 w-4 accent-primary" />
            Destaque ⭐
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="controlaEstoque" className="h-4 w-4 accent-primary" />
            Controlar estoque
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:col-span-2">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Quantidade inicial</label>
            <Input name="quantidadeEstoque" type="number" min="0" step="1" defaultValue="0" placeholder="0" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Estoque mínimo (alerta)</label>
            <Input name="estoqueMinimo" type="number" min="0" step="1" placeholder="Ex: 5" />
          </div>
        </div>
        <Button type="submit" disabled={createPending} className="sm:col-span-2 sm:w-fit">
          Adicionar produto
        </Button>
        {createState.error ? <p className="text-sm text-destructive sm:col-span-2">{createState.error}</p> : null}
        {createState.success ? <p className="text-sm text-primary sm:col-span-2">{createState.success}</p> : null}
      </form>

      <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead colSpan={3}>Produtos ({produtos.length})</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {produtos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-muted-foreground">
                Nenhum produto cadastrado.
              </TableCell>
            </TableRow>
          ) : (
            produtos.map((produto) => (
              <ProdutoRowItem key={produto.id} produto={produto} categorias={categorias} />
            ))
          )}
        </TableBody>
      </Table>
      </div>
    </div>
  )
}

"use client"

import { useActionState } from "react"

import {
  createCategoriaAction,
  deleteCategoriaAction,
  updateCategoriaAction,
  type ActionState,
} from "@/app/painel/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type CategoriaRow = {
  id: string
  nome: string
  ordem: number
  produtosCount: number
}

type CategoriasManagerProps = {
  categorias: CategoriaRow[]
}

function CategoriaRowItem({ categoria }: { categoria: CategoriaRow }) {
  const boundUpdate = updateCategoriaAction.bind(null, categoria.id)
  const boundDelete = deleteCategoriaAction.bind(null, categoria.id)
  const [updateState, updateAction, updatePending] = useActionState(boundUpdate, {} as ActionState)
  const [deleteState, deleteAction, deletePending] = useActionState(boundDelete, {} as ActionState)

  return (
    <TableRow>
      <TableCell>
        <form action={updateAction} className="flex gap-2">
          <Input name="nome" defaultValue={categoria.nome} className="h-8" required />
          <Input name="ordem" type="number" defaultValue={categoria.ordem} className="h-8 w-16" />
          <Button type="submit" size="sm" variant="outline" disabled={updatePending}>
            OK
          </Button>
        </form>
        {updateState.error ? <p className="mt-1 text-xs text-destructive">{updateState.error}</p> : null}
      </TableCell>
      <TableCell>{categoria.produtosCount}</TableCell>
      <TableCell className="text-right">
        <form action={deleteAction}>
          <Button
            type="submit"
            variant="destructive"
            size="sm"
            disabled={deletePending || categoria.produtosCount > 0}
          >
            Excluir
          </Button>
        </form>
        {deleteState.error ? <p className="mt-1 text-xs text-destructive">{deleteState.error}</p> : null}
      </TableCell>
    </TableRow>
  )
}

export function CategoriasManager({ categorias }: CategoriasManagerProps) {
  const [createState, createAction, createPending] = useActionState(createCategoriaAction, {} as ActionState)

  return (
    <div className="space-y-8">
      <form action={createAction} className="flex flex-wrap items-end gap-3 rounded-lg border border-border p-4">
        <div className="space-y-1">
          <Label htmlFor="nome-nova">Nova categoria</Label>
          <Input id="nome-nova" name="nome" placeholder="Ex: Bebidas" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="ordem-nova">Ordem</Label>
          <Input id="ordem-nova" name="ordem" type="number" defaultValue={categorias.length + 1} className="w-24" />
        </div>
        <Button type="submit" disabled={createPending}>
          Adicionar
        </Button>
        {createState.error ? <p className="w-full text-sm text-destructive">{createState.error}</p> : null}
        {createState.success ? <p className="w-full text-sm text-primary">{createState.success}</p> : null}
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome / Ordem</TableHead>
            <TableHead>Produtos</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categorias.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-muted-foreground">
                Nenhuma categoria cadastrada.
              </TableCell>
            </TableRow>
          ) : (
            categorias.map((categoria) => (
              <CategoriaRowItem key={categoria.id} categoria={categoria} />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

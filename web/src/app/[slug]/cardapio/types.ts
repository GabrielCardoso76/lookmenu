export type ProdutoCardapio = {
  id: string
  nome: string
  descricao: string
  preco: number
  imagemUrl: string | null
  disponivel: boolean
  emDestaque: boolean
}

export type CategoriaCardapio = {
  id: string
  nome: string
  ordem: number
  produtos: ProdutoCardapio[]
}

export type LojaCardapio = {
  id: string
  nome: string
  slug: string
  corPrimaria: string
  paletaPreset: string | null
  texturaFundo: "NENHUMA" | "GRAIN" | "DOTS" | "WAVES"
  categorias: CategoriaCardapio[]
}

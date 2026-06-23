export type ProdutoCardapio = {
  id: string
  nome: string
  descricao: string
  preco: number
  imagemUrl: string | null
  disponivel: boolean
  emDestaque: boolean
  destinoPreparo: "COZINHA" | "BAR" | "NENHUM"
}

export type CategoriaCardapio = {
  id: string
  nome: string
  ordem: number
  produtos: ProdutoCardapio[]
}

export type TexturaFundoValue =
  | "NENHUMA"
  | "GRAIN"
  | "DOTS"
  | "WAVES"
  | "STRIPES"
  | "CHECKS"
  | "CIRCLES"
  | "FOOD"

export type LojaCardapio = {
  id: string
  nome: string
  slug: string
  subtituloCardapio: string | null
  corPrimaria: string
  paletaPreset: string | null
  texturaFundo: TexturaFundoValue
  logoUrl: string | null
  fontePreset: string | null
  categorias: CategoriaCardapio[]
  lojaFechada?: boolean
  mensagemFechada?: string
  proximaAbertura?: string
}

import Link from "next/link"

export default function CardapioNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-bold">Loja não encontrada</h1>
      <p className="text-muted-foreground">
        Este cardápio não existe ou a loja está inativa.
      </p>
      <Link href="/" className="text-sm font-medium underline underline-offset-4">
        Voltar para o LookMenu
      </Link>
    </div>
  )
}

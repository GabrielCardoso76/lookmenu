import Link from "next/link"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ComecarForm } from "./comecar-form"

type PageProps = {
  searchParams: Promise<{ plano?: string }>
}

export const metadata = {
  title: "Criar minha loja grátis | LookMenu",
  description: "Crie seu cardápio digital automatizado em minutos. 14 dias grátis.",
}

export default async function ComecarPage({ searchParams }: PageProps) {
  const { plano } = await searchParams
  const planoInicial = plano?.toUpperCase() === "PLUS" ? "PLUS" : "START"

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="font-display text-2xl font-bold">
              Look<span className="text-primary">Menu</span>
            </span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Crie sua loja grátis</CardTitle>
            <CardDescription>
              Seu cardápio digital automatizado, pronto em minutos. 14 dias grátis, sem cartão.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ComecarForm planoInicial={planoInicial} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { nome?: string; loja?: string; whatsapp?: string }
    const { nome, loja, whatsapp } = body

    if (!nome || !whatsapp) {
      return NextResponse.json({ error: "Preencha nome e WhatsApp." }, { status: 400 })
    }

    await prisma.ticketSuporte.create({
      data: {
        assunto: "Contato via landing page",
        mensagem: `Nome: ${nome}\nLoja: ${loja ?? "—"}\nWhatsApp: ${whatsapp}`,
      },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erro interno." }, { status: 500 })
  }
}

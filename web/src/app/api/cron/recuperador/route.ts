import { NextRequest, NextResponse } from "next/server"

import { processarRecuperacoesPendentes } from "@/lib/recuperador"

/**
 * Endpoint de cron para o recuperador de vendas.
 *
 * Protegido por `Authorization: Bearer <CRON_SECRET>`.
 *
 * Como rodar manualmente (PowerShell):
 *   curl -Method POST http://localhost:3000/api/cron/recuperador -Headers @{ Authorization = "Bearer $env:CRON_SECRET" }
 *
 * Como rodar manualmente (bash):
 *   curl -X POST http://localhost:3000/api/cron/recuperador -H "Authorization: Bearer $CRON_SECRET"
 *
 * Em produção, agende a cada ~5 min (Vercel Cron, GitHub Actions, cron do servidor, etc).
 */
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET não configurado no servidor." }, { status: 500 })
  }

  const auth = req.headers.get("authorization")
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  }

  try {
    const resultado = await processarRecuperacoesPendentes()
    return NextResponse.json({ ok: true, ...resultado })
  } catch (err) {
    console.error("[cron/recuperador] Erro ao processar recuperações:", err)
    return NextResponse.json({ error: "Erro ao processar recuperações." }, { status: 500 })
  }
}

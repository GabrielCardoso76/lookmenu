/**
 * Feature-gating por plano.
 * TODO (Fase 5): integrar com billing real — verificar plano ativo da loja.
 */

import { prisma } from "@/lib/prisma"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function canUseCupons(_lojaId: string): Promise<boolean> {
  return true
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function canUseRecuperador(_lojaId: string): Promise<boolean> {
  return true
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function canUseIfood(_lojaId: string): Promise<boolean> {
  return true
}

export type TrialStatus = {
  /** Existe um trial configurado para a loja. */
  temTrial: boolean
  /** Trial ainda vigente. */
  ativo: boolean
  /** Trial já passou da data de expiração. */
  expirado: boolean
  /** Data de expiração, se houver. */
  expiraEm: Date | null
  /** Dias restantes (>= 0) quando ativo. */
  diasRestantes: number | null
}

/**
 * Status do período de teste gratuito de uma loja.
 * No MVP não bloqueia funcionalidades — apenas alimenta o banner do painel.
 */
export async function getTrialStatus(lojaId: string): Promise<TrialStatus> {
  const loja = await prisma.loja.findUnique({
    where: { id: lojaId },
    select: { trialExpiraEm: true },
  })

  const expiraEm = loja?.trialExpiraEm ?? null
  if (!expiraEm) {
    return { temTrial: false, ativo: false, expirado: false, expiraEm: null, diasRestantes: null }
  }

  const agora = new Date()
  const ativo = expiraEm.getTime() > agora.getTime()
  const diffMs = expiraEm.getTime() - agora.getTime()
  const diasRestantes = ativo ? Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24))) : 0

  return {
    temTrial: true,
    ativo,
    expirado: !ativo,
    expiraEm,
    diasRestantes,
  }
}

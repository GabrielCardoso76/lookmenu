import { prisma } from "@/lib/prisma"
import { verifyPassword } from "@/lib/password"
import { getSession, type SessionUser } from "@/lib/session"

export type { SessionUser } from "@/lib/session"
export { createSession, destroySession, getSession, SESSION_COOKIE } from "@/lib/session"

export async function verifyCredentials(email: string, senha: string) {
  const usuario = await prisma.usuario.findUnique({ where: { email } })
  if (!usuario || !usuario.ativo) return null

  const valid = await verifyPassword(senha, usuario.senhaHash)
  if (!valid) return null

  return usuario
}

export async function requireSuperAdmin(): Promise<SessionUser> {
  const session = await getSession()
  if (!session || session.papel !== "SUPER_ADMIN") {
    throw new Error("Acesso negado")
  }
  return session
}

export async function requireLojista(): Promise<SessionUser & { lojaId: string }> {
  const session = await getSession()
  if (!session || session.papel !== "LOJISTA" || !session.lojaId) {
    throw new Error("Acesso negado")
  }
  return { ...session, lojaId: session.lojaId }
}

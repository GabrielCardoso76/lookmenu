import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"

export const ATENDIMENTO_COOKIE = "atendimento_session"
const SESSION_MAX_AGE = 60 * 60 * 12 // 12 horas

export type AtendimentoSession = {
  funcionarioId: string
  funcionarioNome: string
  lojaId: string
  lojaSlug: string
}

function getSecret() {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error("AUTH_SECRET não definida.")
  return new TextEncoder().encode(secret)
}

export async function createAtendimentoSession(data: AtendimentoSession) {
  const token = await new SignJWT({
    funcionarioId: data.funcionarioId,
    funcionarioNome: data.funcionarioNome,
    lojaId: data.lojaId,
    lojaSlug: data.lojaSlug,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(getSecret())

  const cookieStore = await cookies()
  cookieStore.set(ATENDIMENTO_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  })
}

export async function getAtendimentoSession(slug: string): Promise<AtendimentoSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(ATENDIMENTO_COOKIE)?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, getSecret())
    const session: AtendimentoSession = {
      funcionarioId: payload.funcionarioId as string,
      funcionarioNome: payload.funcionarioNome as string,
      lojaId: payload.lojaId as string,
      lojaSlug: payload.lojaSlug as string,
    }
    if (session.lojaSlug !== slug) return null
    return session
  } catch {
    return null
  }
}

export async function destroyAtendimentoSession() {
  const cookieStore = await cookies()
  cookieStore.delete(ATENDIMENTO_COOKIE)
}

import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"

export const SESSION_COOKIE = "lookmenu_session"
const SESSION_MAX_AGE = 60 * 60 * 24 * 7

export type SessionUser = {
  id: string
  email: string
  nome: string
  papel: "SUPER_ADMIN" | "LOJISTA"
  lojaId: string | null
}

function getSecret() {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    throw new Error("AUTH_SECRET não definida. Configure em .env na raiz do projeto.")
  }
  return new TextEncoder().encode(secret)
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({
    email: user.email,
    nome: user.nome,
    papel: user.papel,
    lojaId: user.lojaId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret())

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  })
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, getSecret())
    if (!payload.sub) return null

    return {
      id: payload.sub,
      email: payload.email as string,
      nome: payload.nome as string,
      papel: payload.papel as SessionUser["papel"],
      lojaId: (payload.lojaId as string | null) ?? null,
    }
  } catch {
    return null
  }
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

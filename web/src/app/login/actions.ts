"use server"

import { redirect } from "next/navigation"

import { createSession, verifyCredentials } from "@/lib/auth"
import { destroySession } from "@/lib/session"

export type LoginState = {
  error?: string
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const senha = String(formData.get("senha") ?? "")

  if (!email || !senha) {
    return { error: "Preencha email e senha." }
  }

  const usuario = await verifyCredentials(email, senha)
  if (!usuario) {
    return { error: "Email ou senha inválidos." }
  }

  if (usuario.papel === "LOJISTA" && !usuario.lojaId) {
    return { error: "Conta de lojista sem loja vinculada." }
  }

  if (usuario.papel === "LOJISTA" && usuario.lojaId) {
    const { prisma } = await import("@/lib/prisma")
    const loja = await prisma.loja.findUnique({ where: { id: usuario.lojaId }, select: { ativa: true } })
    if (loja && !loja.ativa) {
      return { error: "Loja desativada — contate o suporte." }
    }
  }

  await createSession({
    id: usuario.id,
    email: usuario.email,
    nome: usuario.nome,
    papel: usuario.papel,
    lojaId: usuario.lojaId,
  })

  redirect(usuario.papel === "SUPER_ADMIN" ? "/admin" : "/painel")
}

export async function logoutAction() {
  await destroySession()
  redirect("/login")
}

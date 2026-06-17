"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requireSuperAdmin } from "@/lib/auth"
import { hashPassword } from "@/lib/password"
import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/slug"

export type ActionState = {
  error?: string
  success?: string
}

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim()
}

export async function createLojaAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireSuperAdmin()
  } catch {
    return { error: "Acesso negado." }
  }

  const nome = getString(formData, "nome")
  const slugInput = getString(formData, "slug")
  const slug = slugInput || slugify(nome)
  const telefoneWhatsapp = getString(formData, "telefoneWhatsapp")
  const corPrimaria = getString(formData, "corPrimaria") || "#F59E0B"
  const ativa = formData.get("ativa") === "on"

  if (!nome || !slug || !telefoneWhatsapp) {
    return { error: "Preencha nome, slug e telefone WhatsApp." }
  }

  const existing = await prisma.loja.findUnique({ where: { slug } })
  if (existing) {
    return { error: "Este slug já está em uso." }
  }

  const loja = await prisma.loja.create({
    data: { nome, slug, telefoneWhatsapp, corPrimaria, ativa },
  })

  revalidatePath("/admin")
  redirect(`/admin/lojas/${loja.id}`)
}

export async function updateLojaAction(
  lojaId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireSuperAdmin()
  } catch {
    return { error: "Acesso negado." }
  }

  const nome = getString(formData, "nome")
  const slug = getString(formData, "slug")
  const telefoneWhatsapp = getString(formData, "telefoneWhatsapp")
  const corPrimaria = getString(formData, "corPrimaria")
  const ativa = formData.get("ativa") === "on"

  if (!nome || !slug || !telefoneWhatsapp || !corPrimaria) {
    return { error: "Preencha todos os campos obrigatórios." }
  }

  const conflict = await prisma.loja.findFirst({
    where: { slug, NOT: { id: lojaId } },
  })
  if (conflict) {
    return { error: "Este slug já está em uso por outra loja." }
  }

  await prisma.loja.update({
    where: { id: lojaId },
    data: { nome, slug, telefoneWhatsapp, corPrimaria, ativa },
  })

  revalidatePath("/admin")
  revalidatePath(`/admin/lojas/${lojaId}`)
  return { success: "Loja atualizada." }
}

export async function createLojistaAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireSuperAdmin()
  } catch {
    return { error: "Acesso negado." }
  }

  const nome = getString(formData, "nome")
  const email = getString(formData, "email").toLowerCase()
  const senha = getString(formData, "senha")
  const lojaId = getString(formData, "lojaId")

  if (!nome || !email || !senha || !lojaId) {
    return { error: "Preencha todos os campos." }
  }

  if (senha.length < 6) {
    return { error: "A senha deve ter pelo menos 6 caracteres." }
  }

  const loja = await prisma.loja.findUnique({ where: { id: lojaId } })
  if (!loja) {
    return { error: "Loja não encontrada." }
  }

  const lojistaExistente = await prisma.usuario.findFirst({
    where: { lojaId, papel: "LOJISTA", ativo: true },
  })
  if (lojistaExistente) {
    return { error: "Esta loja já possui um lojista ativo." }
  }

  const emailExistente = await prisma.usuario.findUnique({ where: { email } })
  if (emailExistente) {
    return { error: "Este email já está em uso." }
  }

  await prisma.usuario.create({
    data: {
      nome,
      email,
      senhaHash: await hashPassword(senha),
      papel: "LOJISTA",
      lojaId,
    },
  })

  revalidatePath("/admin")
  redirect("/admin")
}

export async function toggleLojaAtivaAction(lojaId: string, _formData: FormData): Promise<void> {
  try {
    await requireSuperAdmin()
  } catch {
    return
  }

  const loja = await prisma.loja.findUnique({ where: { id: lojaId } })
  if (!loja) return

  await prisma.loja.update({
    where: { id: lojaId },
    data: { ativa: !loja.ativa },
  })

  revalidatePath("/admin")
  revalidatePath(`/admin/lojas/${lojaId}`)
}

export async function toggleUsuarioAtivoAction(usuarioId: string, _formData: FormData): Promise<void> {
  try {
    await requireSuperAdmin()
  } catch {
    return
  }

  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } })
  if (!usuario) return

  await prisma.usuario.update({
    where: { id: usuarioId },
    data: { ativo: !usuario.ativo },
  })

  revalidatePath("/admin")
  if (usuario.lojaId) revalidatePath(`/admin/lojas/${usuario.lojaId}`)
}

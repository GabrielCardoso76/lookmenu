"use server"

import { redirect } from "next/navigation"

import { createSession } from "@/lib/auth"
import { hashPassword } from "@/lib/password"
import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/slug"

export type CadastroState = {
  error?: string
  /** Mantém os valores preenchidos para reexibir no formulário em caso de erro. */
  values?: {
    nomeLoja?: string
    slug?: string
    nomeResponsavel?: string
    email?: string
    telefoneWhatsapp?: string
    plano?: string
  }
}

const TRIAL_DIAS = 14

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim()
}

export async function cadastrarLojaPublicaAction(
  _prev: CadastroState,
  formData: FormData,
): Promise<CadastroState> {
  const nomeLoja = getString(formData, "nomeLoja")
  const slugInput = getString(formData, "slug")
  const nomeResponsavel = getString(formData, "nomeResponsavel")
  const email = getString(formData, "email").toLowerCase()
  const senha = getString(formData, "senha")
  const telefoneWhatsapp = getString(formData, "telefoneWhatsapp")
  const planoRaw = getString(formData, "plano").toUpperCase()
  const plano = planoRaw === "PLUS" ? "PLUS" : "START"

  const values = { nomeLoja, slug: slugInput, nomeResponsavel, email, telefoneWhatsapp, plano }

  if (!nomeLoja || !nomeResponsavel || !email || !senha || !telefoneWhatsapp) {
    return { error: "Preencha todos os campos.", values }
  }

  if (senha.length < 6) {
    return { error: "A senha deve ter pelo menos 6 caracteres.", values }
  }

  const slug = slugify(slugInput || nomeLoja)
  if (!slug) {
    return { error: "Não foi possível gerar um endereço (slug) válido. Use letras e números.", values }
  }

  const telefoneDigits = telefoneWhatsapp.replace(/\D/g, "")
  if (telefoneDigits.length < 10) {
    return { error: "Telefone WhatsApp inválido. Use DDD + número.", values }
  }

  const [slugExistente, emailExistente] = await Promise.all([
    prisma.loja.findUnique({ where: { slug }, select: { id: true } }),
    prisma.usuario.findUnique({ where: { email }, select: { id: true } }),
  ])

  if (emailExistente) {
    return { error: "Este email já está cadastrado. Faça login para acessar seu painel.", values }
  }
  if (slugExistente) {
    return { error: `O endereço "/${slug}" já está em uso. Escolha outro.`, values }
  }

  const senhaHash = await hashPassword(senha)
  const trialExpiraEm = new Date(Date.now() + TRIAL_DIAS * 24 * 60 * 60 * 1000)

  let usuario: { id: string; email: string; nome: string; lojaId: string | null }
  try {
    usuario = await prisma.$transaction(async (tx) => {
      const loja = await tx.loja.create({
        data: {
          nome: nomeLoja,
          slug,
          telefoneWhatsapp: telefoneDigits,
          corPrimaria: "#F59E0B",
          ativa: true,
          trialExpiraEm,
          planoInteresse: plano,
          horarios: {
            create: Array.from({ length: 7 }, (_, dia) => ({
              diaSemana: dia,
              abreAs: "11:00",
              fechaAs: "23:00",
              fechado: false,
            })),
          },
        },
      })

      const novoUsuario = await tx.usuario.create({
        data: {
          nome: nomeResponsavel,
          email,
          senhaHash,
          papel: "LOJISTA",
          lojaId: loja.id,
        },
        select: { id: true, email: true, nome: true, lojaId: true },
      })

      return novoUsuario
    })
  } catch {
    return { error: "Não foi possível concluir o cadastro. Tente novamente.", values }
  }

  await createSession({
    id: usuario.id,
    email: usuario.email,
    nome: usuario.nome,
    papel: "LOJISTA",
    lojaId: usuario.lojaId,
  })

  redirect("/painel?bemvindo=1")
}

import "dotenv/config"

import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"
import { PrismaClient } from "../web/node_modules/.prisma/client"

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL não definida. Configure em .env na raiz do projeto.")
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL ?? "admin@lookmenu.local"
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD ?? "admin123"
  const lojistaEmail = process.env.LOJISTA_DEMO_EMAIL ?? "lojista@burger-king-demo.local"
  const lojistaPassword = process.env.LOJISTA_DEMO_PASSWORD ?? "lojista123"

  const loja = await prisma.loja.upsert({
    where: { slug: "burger-king-demo" },
    update: {
      pedidoMinimo: 25,
      taxaEntregaFixa: 8,
      freteGratisAcima: 80,
    },
    create: {
      nome: "Burger King Demo",
      slug: "burger-king-demo",
      telefoneWhatsapp: "5511999999999",
      corPrimaria: "#D62300",
      exigirCadastro: false,
      ativa: true,
      templateCardapio: "CLASSICO",
      paletaPreset: "custom",
      texturaFundo: "NENHUMA",
      fontePreset: "Poppins",
      pedidoMinimo: 25,
      taxaEntregaFixa: 8,
      freteGratisAcima: 80,
    },
  })

  await prisma.produto.deleteMany({ where: { lojaId: loja.id } })
  await prisma.categoria.deleteMany({ where: { lojaId: loja.id } })

  const hamburgueres = await prisma.categoria.create({
    data: { lojaId: loja.id, nome: "Hambúrgueres", ordem: 1 },
  })

  const acompanhamentos = await prisma.categoria.create({
    data: { lojaId: loja.id, nome: "Acompanhamentos", ordem: 2 },
  })

  const bebidas = await prisma.categoria.create({
    data: { lojaId: loja.id, nome: "Bebidas", ordem: 3 },
  })

  await prisma.produto.createMany({
    data: [
      {
        lojaId: loja.id,
        categoriaId: hamburgueres.id,
        nome: "Whopper",
        descricao: "Hambúrguer com carne grelhada, alface, tomate, cebola e maionese.",
        preco: 32.9,
        disponivel: true,
        emDestaque: true,
        destinoPreparo: "COZINHA",
      },
      {
        lojaId: loja.id,
        categoriaId: hamburgueres.id,
        nome: "Cheeseburger",
        descricao: "Clássico com queijo cheddar derretido e molho especial.",
        preco: 24.9,
        disponivel: true,
        emDestaque: false,
        destinoPreparo: "COZINHA",
      },
      {
        lojaId: loja.id,
        categoriaId: acompanhamentos.id,
        nome: "Batata Média",
        descricao: "Porção média de batatas fritas crocantes.",
        preco: 12.9,
        disponivel: true,
        destinoPreparo: "COZINHA",
      },
      {
        lojaId: loja.id,
        categoriaId: bebidas.id,
        nome: "Refrigerante Lata",
        descricao: "350ml — Coca-Cola, Guaraná ou Sprite.",
        preco: 7.9,
        disponivel: true,
        destinoPreparo: "BAR",
      },
      {
        lojaId: loja.id,
        categoriaId: bebidas.id,
        nome: "Milk Shake",
        descricao: "400ml — sabores chocolate, morango ou baunilha.",
        preco: 15.9,
        disponivel: true,
        emDestaque: true,
        destinoPreparo: "BAR",
      },
    ],
  })

  // Mesas demo
  await prisma.mesa.deleteMany({ where: { lojaId: loja.id } })
  await prisma.mesa.createMany({
    data: [
      { lojaId: loja.id, numero: "01", nome: "Entrada", capacidade: 4, ativa: true },
      { lojaId: loja.id, numero: "02", capacidade: 2, ativa: true },
      { lojaId: loja.id, numero: "03", capacidade: 4, ativa: true },
      { lojaId: loja.id, numero: "04", nome: "Varanda", capacidade: 6, ativa: true },
      { lojaId: loja.id, numero: "05", capacidade: 4, ativa: true },
      { lojaId: loja.id, numero: "06", capacidade: 2, ativa: false },
    ],
  })

  // Funcionários demo (PINs hasheados com bcrypt)
  await prisma.funcionario.deleteMany({ where: { lojaId: loja.id } })
  const [pin1234, pin5678] = await Promise.all([
    bcrypt.hash("1234", 10),
    bcrypt.hash("5678", 10),
  ])
  await prisma.funcionario.createMany({
    data: [
      { lojaId: loja.id, nome: "João Garçom", pin: pin1234, ativo: true },
      { lojaId: loja.id, nome: "Maria Atendente", pin: pin5678, ativo: true },
    ],
  })

  const superAdminHash = await bcrypt.hash(superAdminPassword, 12)

  await prisma.usuario.upsert({
    where: { email: superAdminEmail },
    update: {
      senhaHash: superAdminHash,
      nome: "Super Admin",
      papel: "SUPER_ADMIN",
      lojaId: null,
      ativo: true,
    },
    create: {
      email: superAdminEmail,
      senhaHash: superAdminHash,
      nome: "Super Admin",
      papel: "SUPER_ADMIN",
      ativo: true,
    },
  })

  const lojistaHash = await bcrypt.hash(lojistaPassword, 12)

  await prisma.usuario.upsert({
    where: { email: lojistaEmail },
    update: {
      senhaHash: lojistaHash,
      nome: "Lojista Demo",
      papel: "LOJISTA",
      lojaId: loja.id,
      ativo: true,
    },
    create: {
      email: lojistaEmail,
      senhaHash: lojistaHash,
      nome: "Lojista Demo",
      papel: "LOJISTA",
      lojaId: loja.id,
      ativo: true,
    },
  })

  // Horários de funcionamento demo
  await prisma.horarioFuncionamento.deleteMany({ where: { lojaId: loja.id } })
  await prisma.horarioFuncionamento.createMany({
    data: [
      { lojaId: loja.id, diaSemana: 0, abreAs: "12:00", fechaAs: "22:00", fechado: true },  // Domingo — fechado
      { lojaId: loja.id, diaSemana: 1, abreAs: "11:00", fechaAs: "23:00", fechado: false }, // Segunda
      { lojaId: loja.id, diaSemana: 2, abreAs: "11:00", fechaAs: "23:00", fechado: false }, // Terça
      { lojaId: loja.id, diaSemana: 3, abreAs: "11:00", fechaAs: "23:00", fechado: false }, // Quarta
      { lojaId: loja.id, diaSemana: 4, abreAs: "11:00", fechaAs: "23:00", fechado: false }, // Quinta
      { lojaId: loja.id, diaSemana: 5, abreAs: "11:00", fechaAs: "00:00", fechado: false }, // Sexta (fecha meia-noite — sem cruzar dia)
      { lojaId: loja.id, diaSemana: 6, abreAs: "12:00", fechaAs: "22:00", fechado: false }, // Sábado
    ],
  })

  // Cupom demo
  await prisma.cupom.upsert({
    where: { lojaId_codigo: { lojaId: loja.id, codigo: "DEMO10" } },
    update: {},
    create: {
      lojaId: loja.id,
      codigo: "DEMO10",
      tipo: "PERCENTUAL",
      valor: 10,
      pedidoMinimo: 30,
      maxUsos: 100,
      usosAtuais: 0,
      ativo: true,
    },
  })

  console.log(`Seed OK: loja "${loja.slug}" em http://localhost:3000/${loja.slug}`)
  console.log(`Super admin: ${superAdminEmail} / ${superAdminPassword}`)
  console.log(`Lojista demo: ${lojistaEmail} / ${lojistaPassword}`)
  console.log(`App garçom: http://localhost:3000/${loja.slug}/atendimento`)
  console.log(`  João Garçom — PIN: 1234`)
  console.log(`  Maria Atendente — PIN: 5678`)
  console.log(`Financeiro: http://localhost:3000/painel/financeiro`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

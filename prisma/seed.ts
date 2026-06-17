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
    update: {},
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
      },
      {
        lojaId: loja.id,
        categoriaId: hamburgueres.id,
        nome: "Cheeseburger",
        descricao: "Clássico com queijo cheddar derretido e molho especial.",
        preco: 24.9,
        disponivel: true,
        emDestaque: false,
      },
      {
        lojaId: loja.id,
        categoriaId: acompanhamentos.id,
        nome: "Batata Média",
        descricao: "Porção média de batatas fritas crocantes.",
        preco: 12.9,
        disponivel: true,
      },
      {
        lojaId: loja.id,
        categoriaId: bebidas.id,
        nome: "Refrigerante Lata",
        descricao: "350ml — Coca-Cola, Guaraná ou Sprite.",
        preco: 7.9,
        disponivel: true,
      },
      {
        lojaId: loja.id,
        categoriaId: bebidas.id,
        nome: "Milk Shake",
        descricao: "400ml — sabores chocolate, morango ou baunilha.",
        preco: 15.9,
        disponivel: true,
        emDestaque: true,
      },
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

  console.log(`Seed OK: loja "${loja.slug}" em http://localhost:3000/${loja.slug}`)
  console.log(`Super admin: ${superAdminEmail} / ${superAdminPassword}`)
  console.log(`Lojista demo: ${lojistaEmail} / ${lojistaPassword}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

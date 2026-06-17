import { config } from "dotenv"
import { resolve } from "path"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../node_modules/.prisma/client"

if (!process.env.DATABASE_URL) {
  config({ path: resolve(process.cwd(), "../.env") })
}

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL não definida. Configure em .env na raiz do projeto.")
}

const adapter = new PrismaPg({ connectionString })

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

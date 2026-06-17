-- CreateEnum
CREATE TYPE "PapelUsuario" AS ENUM ('SUPER_ADMIN', 'LOJISTA');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "papel" "PapelUsuario" NOT NULL,
    "loja_id" UUID,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_loja_id_idx" ON "usuarios"("loja_id");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_loja_id_fkey" FOREIGN KEY ("loja_id") REFERENCES "lojas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

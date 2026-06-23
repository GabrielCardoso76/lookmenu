-- CreateEnum
CREATE TYPE "DestinoPreparo" AS ENUM ('COZINHA', 'BAR', 'NENHUM');

-- AlterEnum
ALTER TYPE "TipoEntrega" ADD VALUE 'SALAO_MESA';

-- AlterTable
ALTER TABLE "lojas" ADD COLUMN     "fonte_preset" TEXT,
ADD COLUMN     "logo_url" TEXT;

-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN     "funcionario_id" UUID,
ADD COLUMN     "mesa_id" UUID;

-- AlterTable
ALTER TABLE "produtos" ADD COLUMN     "destino_preparo" "DestinoPreparo" NOT NULL DEFAULT 'NENHUM';

-- CreateTable
CREATE TABLE "mesas" (
    "id" UUID NOT NULL,
    "loja_id" UUID NOT NULL,
    "numero" TEXT NOT NULL,
    "nome" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "capacidade" INTEGER,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mesas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funcionarios" (
    "id" UUID NOT NULL,
    "loja_id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "pin" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "funcionarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mesas_loja_id_idx" ON "mesas"("loja_id");

-- CreateIndex
CREATE UNIQUE INDEX "mesas_loja_id_numero_key" ON "mesas"("loja_id", "numero");

-- CreateIndex
CREATE INDEX "funcionarios_loja_id_idx" ON "funcionarios"("loja_id");

-- CreateIndex
CREATE INDEX "pedidos_mesa_id_idx" ON "pedidos"("mesa_id");

-- CreateIndex
CREATE INDEX "pedidos_funcionario_id_idx" ON "pedidos"("funcionario_id");

-- AddForeignKey
ALTER TABLE "mesas" ADD CONSTRAINT "mesas_loja_id_fkey" FOREIGN KEY ("loja_id") REFERENCES "lojas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funcionarios" ADD CONSTRAINT "funcionarios_loja_id_fkey" FOREIGN KEY ("loja_id") REFERENCES "lojas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_mesa_id_fkey" FOREIGN KEY ("mesa_id") REFERENCES "mesas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_funcionario_id_fkey" FOREIGN KEY ("funcionario_id") REFERENCES "funcionarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

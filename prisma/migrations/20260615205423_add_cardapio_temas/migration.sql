-- CreateEnum
CREATE TYPE "TemplateCardapio" AS ENUM ('CLASSICO', 'MODERNO', 'DARK');

-- CreateEnum
CREATE TYPE "TexturaFundo" AS ENUM ('NENHUMA', 'GRAIN', 'DOTS', 'WAVES');

-- AlterTable
ALTER TABLE "lojas" ADD COLUMN     "paleta_preset" TEXT,
ADD COLUMN     "template_cardapio" "TemplateCardapio" NOT NULL DEFAULT 'CLASSICO',
ADD COLUMN     "textura_fundo" "TexturaFundo" NOT NULL DEFAULT 'NENHUMA';

-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN     "nome_cliente" TEXT,
ADD COLUMN     "observacoes" TEXT;

-- AlterTable
ALTER TABLE "produtos" ADD COLUMN     "em_destaque" BOOLEAN NOT NULL DEFAULT false;

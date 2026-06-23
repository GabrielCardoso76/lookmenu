-- AlterTable
ALTER TABLE "lojas" ADD COLUMN     "aceita_cartao_entrega" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "aceita_dinheiro_entrega" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "aceita_pix_site" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "pagamento_na_mesa" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "pagamento_no_site" BOOLEAN NOT NULL DEFAULT true;

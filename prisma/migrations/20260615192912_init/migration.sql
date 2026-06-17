-- CreateEnum
CREATE TYPE "EstadoPedido" AS ENUM ('NOVO', 'EM_PREPARACAO', 'PRONTO', 'EM_ENTREGA', 'CONCLUIDO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "TipoEntrega" AS ENUM ('DELIVERY', 'RETIRADA_BALCAO');

-- CreateEnum
CREATE TYPE "EstadoPagamento" AS ENUM ('PENDENTE', 'PAGO', 'RECUSADO');

-- CreateEnum
CREATE TYPE "MetodoPagamento" AS ENUM ('PIX_ONLINE', 'CARTAO_ENTREGA', 'DINHEIRO_ENTREGA');

-- CreateTable
CREATE TABLE "lojas" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "telefone_whatsapp" TEXT NOT NULL,
    "cor_primaria" TEXT NOT NULL,
    "exigir_cadastro" BOOLEAN NOT NULL DEFAULT false,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lojas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" UUID NOT NULL,
    "telefone" TEXT NOT NULL,
    "nome" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enderecos" (
    "id" UUID NOT NULL,
    "cliente_id" UUID NOT NULL,
    "rua" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "ponto_referencia" TEXT,

    CONSTRAINT "enderecos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" UUID NOT NULL,
    "loja_id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" UUID NOT NULL,
    "loja_id" UUID NOT NULL,
    "categoria_id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL,
    "imagem_url" TEXT,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" UUID NOT NULL,
    "loja_id" UUID NOT NULL,
    "cliente_id" UUID,
    "estado_pedido" "EstadoPedido" NOT NULL,
    "tipo_entrega" "TipoEntrega" NOT NULL,
    "endereco_entrega_id" UUID,
    "total" DECIMAL(10,2) NOT NULL,
    "estado_pagamento" "EstadoPagamento" NOT NULL,
    "metodo_pagamento" "MetodoPagamento" NOT NULL,
    "id_pagamento_gateway" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_pedido" (
    "id" UUID NOT NULL,
    "pedido_id" UUID NOT NULL,
    "produto_id" UUID NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "preco_unitario" DECIMAL(10,2) NOT NULL,
    "observacao" TEXT,

    CONSTRAINT "itens_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lojas_slug_key" ON "lojas"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_telefone_key" ON "clientes"("telefone");

-- CreateIndex
CREATE INDEX "enderecos_cliente_id_idx" ON "enderecos"("cliente_id");

-- CreateIndex
CREATE INDEX "categorias_loja_id_idx" ON "categorias"("loja_id");

-- CreateIndex
CREATE INDEX "produtos_loja_id_idx" ON "produtos"("loja_id");

-- CreateIndex
CREATE INDEX "produtos_categoria_id_idx" ON "produtos"("categoria_id");

-- CreateIndex
CREATE INDEX "pedidos_loja_id_idx" ON "pedidos"("loja_id");

-- CreateIndex
CREATE INDEX "pedidos_cliente_id_idx" ON "pedidos"("cliente_id");

-- CreateIndex
CREATE INDEX "pedidos_endereco_entrega_id_idx" ON "pedidos"("endereco_entrega_id");

-- CreateIndex
CREATE INDEX "itens_pedido_pedido_id_idx" ON "itens_pedido"("pedido_id");

-- CreateIndex
CREATE INDEX "itens_pedido_produto_id_idx" ON "itens_pedido"("produto_id");

-- AddForeignKey
ALTER TABLE "enderecos" ADD CONSTRAINT "enderecos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_loja_id_fkey" FOREIGN KEY ("loja_id") REFERENCES "lojas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_loja_id_fkey" FOREIGN KEY ("loja_id") REFERENCES "lojas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_loja_id_fkey" FOREIGN KEY ("loja_id") REFERENCES "lojas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_endereco_entrega_id_fkey" FOREIGN KEY ("endereco_entrega_id") REFERENCES "enderecos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_pedido" ADD CONSTRAINT "itens_pedido_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_pedido" ADD CONSTRAINT "itens_pedido_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

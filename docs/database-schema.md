LookMenu - Modelação da Base de Dados e Autenticação

Este documento define a estrutura de dados (PostgreSQL) para o sistema SaaS Multi-tenant LookMenu. A arquitetura foi desenhada para suportar múltiplas lojas, mantendo o isolamento de catálogo e pedidos, mas utilizando um sistema global de clientes para reduzir a fricção no checkout.

1. Autenticação de Clientes (Global & Passwordless)

O LookMenu utiliza um modelo de "Rede Global". O cliente não se regista numa loja específica, mas sim na plataforma LookMenu, utilizando o seu número de WhatsApp como identificador único.

Fluxo de Login (OTP via WhatsApp):

O cliente acede ao cardápio de uma loja.

O sistema solicita o número de WhatsApp.

O bot do LookMenu envia um código (OTP) de 4 a 6 dígitos para o telemóvel do cliente.

O cliente insere o código no site e o token de sessão é gerado (guardado no browser).

Nas próximas visitas (mesmo a outras lojas da plataforma), o cliente já estará autenticado.

2. Esquema de Tabelas (Modelo Relacional)

Abaixo estão as tabelas principais mapeadas com os seus campos e relações:

2.1. Tabela Lojas (Tenant)

Gere as configurações individuais de cada negócio subscritor da plataforma.

id (UUID) - Chave Primária

nome (String) - Nome do estabelecimento

slug (String, Único) - Identificador para o URL (ex: lookmenu.com.br/burguer-do-ze)

telefone_whatsapp (String) - Número que será associado ao bot da Evolution API

cor_primaria (String) - Código HEX para personalização visual (ex: #FF0000)

exigir_cadastro (Booleano) - true: Obriga o login/OTP para ver o carrinho. false: Permite checkout como convidado.

ativa (Booleano) - Estado da subscrição do lojista (Padrão: true)

criado_em (DateTime)

2.2. Tabela Clientes (Global)

Registo único de utilizadores finais da plataforma.

id (UUID) - Chave Primária

telefone (String, Único) - Número de WhatsApp (Identificador global)

nome (String)

criado_em (DateTime)

2.3. Tabela Enderecos

Moradas associadas aos clientes para entregas rápidas. Um cliente pode ter várias moradas.

id (UUID) - Chave Primária

cliente_id (UUID) - Chave Estrangeira -> Clientes

rua, numero, bairro, cidade (Strings)

ponto_referencia (String, Opcional)

2.4. Tabela Categorias

Organização do menu (ex: Bebidas, Promoções).

id (UUID) - Chave Primária

loja_id (UUID) - Chave Estrangeira -> Lojas

nome (String)

ordem (Inteiro) - Define a ordem de apresentação no cardápio digital

2.5. Tabela Produtos

Itens do cardápio vinculados a uma categoria e a uma loja.

id (UUID) - Chave Primária

loja_id (UUID) - Chave Estrangeira -> Lojas

categoria_id (UUID) - Chave Estrangeira -> Categorias

nome (String)

descricao (Texto)

preco (Decimal)

imagem_url (String, Opcional)

disponivel (Booleano) - Controlo rápido de stock (Padrão: true)

2.6. Tabela Pedidos

O coração do KDS (Kitchen Display System). Liga o cliente, a loja e o gateway de pagamento.

id (UUID) - Chave Primária

loja_id (UUID) - Chave Estrangeira -> Lojas

cliente_id (UUID, Opcional se for convidado) - Chave Estrangeira -> Clientes

estado_pedido (Enum) - NOVO, EM_PREPARACAO, PRONTO, EM_ENTREGA, CONCLUIDO, CANCELADO

tipo_entrega (Enum) - DELIVERY, RETIRADA_BALCAO

endereco_entrega_id (UUID, Opcional) - Chave Estrangeira -> Enderecos

total (Decimal) - Valor final da encomenda

estado_pagamento (Enum) - PENDENTE, PAGO, RECUSADO

metodo_pagamento (Enum) - PIX_ONLINE, CARTAO_ENTREGA, DINHEIRO_ENTREGA

id_pagamento_gateway (String, Opcional) - ID da transação no Mercado Pago

criado_em (DateTime)

2.7. Tabela Itens_Pedido

Produtos específicos dentro de uma encomenda, congelando o preço no momento da compra.

id (UUID) - Chave Primária

pedido_id (UUID) - Chave Estrangeira -> Pedidos

produto_id (UUID) - Chave Estrangeira -> Produtos

quantidade (Inteiro)

preco_unitario (Decimal) - Preço cobrado no momento do pedido

observacao (Texto, Opcional) - Ex: "Tirar a cebola"

3. Considerações Técnicas para o ORM (Prisma)

Ao implementar este modelo no Prisma com TypeScript, todas as tabelas (exceto Clientes e Enderecos) devem ter índices aplicados ao campo loja_id. Isto garante que as consultas à base de dados sejam extremamente rápidas quando o sistema precisar de carregar o cardápio ou os pedidos de um único inquilino (Tenant).
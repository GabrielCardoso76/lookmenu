LookMenu - Documento de Arquitetura e Escopo

1. Visão Geral do Produto

O LookMenu é uma plataforma SaaS Multi-tenant (Múltiplos Inquilinos) voltada para a gestão e atendimento digital de lanchonetes e pequenos restaurantes locais. O sistema foca em eliminar o atrito do pedido via delivery, automatizar o atendimento via WhatsApp e organizar o fluxo de produção na cozinha, substituindo métodos manuais por uma interface digital rápida e centralizada.

Modelo de Negócio (MVP): Venda de assinaturas recorrentes (ex: R$ 49,90/mês) para donos de restaurantes locais.

2. Escopo da Versão 1.0 (MVP)

A versão inicial focará exclusivamente no modelo "Delivery / Retirada" para validar o sistema rápido. Funcionalidades complexas como Gestão de Salão (garçons/mesas complexas) ficam para a V2.

2.1. Funcionalidades do Lojista (Painel Administrativo)

Gestão de Catálogo: Cadastro, edição e exclusão de Produtos, Categorias (ex: Hambúrgueres, Bebidas) e Adicionais (ex: +Bacon).

Personalização da Loja: Escolha de paleta de cores primárias e fonte principal para refletir a marca no cardápio digital do cliente.

KDS (Kitchen Display System): Tela de gestão de pedidos estilo Kanban (Novo Pedido -> Em Preparo -> Pronto/Saiu para Entrega).

Integração WhatsApp: Geração do QR Code para vincular o número de WhatsApp da loja ao bot de autoatendimento.

Geração de QR Code Estático: PDF com QR Code gerado pelo sistema para imprimir e deixar na mesa (direciona para a versão estática do cardápio).

2.2. Funcionalidades do Cliente Final

Bot Receptivo no WhatsApp: O cliente envia uma mensagem e recebe automaticamente um menu inicial com o link do cardápio e orientações.

Cardápio Digital Responsivo: Visualização rápida do catálogo com o design da loja. Carrinho de compras integrado.

Checkout Sem Fricção: Pedido realizado apenas com Nome, Telefone (WhatsApp) e Endereço de Entrega (ou seleção de Retirada).

Pagamento Automatizado: Geração de cobrança PIX via API do Mercado Pago na tela de checkout e verificação automática do pagamento.

Notificações de Status: Recebimento de atualizações de status do pedido via bot do WhatsApp (ex: "Seu pedido está em preparo!").

3. Stack Tecnológica (A Base do Código)

A escolha da stack foca no compartilhamento de tipos (Isomorfismo), velocidade de deploy e adequação ao ecossistema de APIs de comunicação brasileiras.

Linguagem Principal: TypeScript (Utilizado de ponta a ponta: Front, Back e Bot).

Front-end & API do Painel: Next.js (React) + Tailwind CSS.

Justificativa: Geração estática rápida para os cardápios (SEO) e reatividade para o KDS do lojista na mesma base de código.

Back-end (Runtime): Bun.

Justificativa: Substitui o Node.js para garantir instalações ultrarrápidas de pacotes e maior performance de execução do servidor.

Banco de Dados: PostgreSQL.

Justificativa: Relacional, ideal para conectar lojas, catálogos e histórico de pedidos de forma estruturada.

ORM (Comunicação de Dados): Prisma ou Drizzle ORM.

4. Infraestrutura e Hospedagem (Arquitetura)

O sistema será dividido para que as conexões em tempo real do WhatsApp não travem as requisições web do painel.

Hospedagem Front-end/Dashboard: Vercel ou Render. (Foco em deploy contínuo via GitHub).

Servidor do Banco de Dados: Supabase ou Neon Tech (PostgreSQL como serviço).

Servidor do Bot (WhatsApp API): Máquina virtual dedicada (VPS) na Hetzner, DigitalOcean ou AWS Lightsail rodando Docker.

Segurança e Cache: Cloudflare (DNS, Proteção DDoS e cache de imagens do cardápio).

Domínio: .com.br no Registro.br.

5. Integrações Externas (APIs)

Gateway de Pagamento: Mercado Pago (Geração dinâmica de PIX e Webhooks de confirmação automática).

Mensageria (WhatsApp): Evolution API (Solução Open Source via QR Code rodando no VPS dedicado).

Logística (V1.5+): Integração com a API aberta do iFood para recebimento de pedidos no mesmo KDS e solicitação de motoboys parceiros.
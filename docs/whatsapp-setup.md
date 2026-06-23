# WhatsApp — Setup com Evolution API

O LookMenu usa a **Evolution API** para enviar mensagens WhatsApp automáticas aos clientes.

---

## Pré-requisitos

- Docker e Docker Compose instalados
- Número de WhatsApp disponível para escanear (não pode ser o principal se quiser manter separado)

---

## 1. Subir a Evolution API

Na raiz do projeto (`lookmenu/`):

```bash
docker compose up -d
```

Aguarde o contêiner iniciar (5–10 segundos) e verifique:

```bash
docker compose logs evolution-api
# Deve aparecer: "HTTP server listening on port 8080"
```

Acesse o Swagger da API: [http://localhost:8080/docs](http://localhost:8080/docs)

---

## 2. Criar a instância WhatsApp

A instância é um "slot" que representa um número WhatsApp conectado.

### Via curl (ou Swagger):

```bash
curl -X POST http://localhost:8080/instance/create \
  -H "Content-Type: application/json" \
  -H "apikey: change-this-evolution-key" \
  -d '{"instanceName": "lookmenu", "integration": "WHATSAPP-BAILEYS"}'
```

Resposta esperada:
```json
{
  "instance": { "instanceName": "lookmenu", "status": "created" },
  "hash": { "apikey": "..." }
}
```

> O `instanceName` deve coincidir com `EVOLUTION_INSTANCE` no `.env`.

---

## 3. Configurar o `.env`

Copie `.env.example` para `.env` e preencha:

```env
WHATSAPP_ENABLED=true
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=change-this-evolution-key
EVOLUTION_INSTANCE=lookmenu
```

> **Importante:** a chave `EVOLUTION_API_KEY` deve ser a mesma definida em `docker-compose.yml` na variável `AUTHENTICATION_API_KEY`.

Reinicie o servidor Next.js após alterar o `.env`:

```bash
bun dev
```

---

## 4. Escanear o QR Code no Painel

1. Acesse o painel da loja: `/painel/whatsapp`
2. Clique em **"Gerar QR Code"**
3. No seu celular, abra o WhatsApp → **Dispositivos conectados** → **Conectar dispositivo**
4. Escaneie o QR exibido na tela
5. Aguarde a confirmação (status ficará **Conectado**)

> O QR Code expira em ~30 segundos. A página atualiza automaticamente.

---

## 5. Verificar o funcionamento

Faça um pedido de teste no checkout e confira se a mensagem chega no WhatsApp.

Logs úteis:

```bash
# Ver logs da Evolution API
docker compose logs -f evolution-api

# Ver logs do Next.js (notificações)
# Procure por linhas com [notificacoes]
```

---

## Mensagens enviadas

| Evento | Quando |
|--------|--------|
| **Pedido criado** | Cliente finaliza o checkout (ou garçom registra comanda) |
| **Em preparação** | KDS avança do estado Novo |
| **Pronto** | KDS avança para Pronto |
| **Em entrega** | KDS avança para Em entrega (apenas delivery) |
| **Concluído** | Garçom fecha conta (salão) ou KDS avança para Concluído (delivery) |

> Pedidos de mesa sem telefone cadastrado são silenciados automaticamente.

---

## Parar / reiniciar

```bash
# Parar
docker compose stop

# Reiniciar
docker compose restart

# Parar e remover contêiner (mantém volume com instâncias)
docker compose down
```

---

## Produção

Em produção, configure:

- `SERVER_URL` no `docker-compose.yml` com a URL pública da Evolution API (ex: `https://evo.suaempresa.com`)
- Use um proxy reverso (nginx, Caddy) com HTTPS
- Substitua a `AUTHENTICATION_API_KEY` por uma chave segura
- Considere Redis e banco externo para persistência (configure no `docker-compose.yml`)

Consulte a [documentação oficial da Evolution API](https://doc.evolution-api.com) para configurações avançadas.

"use client"

import { useEffect, useState, useTransition } from "react"
import { Wifi, WifiOff, QrCode, RefreshCw, LogOut, AlertCircle, CheckCircle2, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { gerarQRCodeAction, getWhatsAppStatusAction, desconectarWhatsAppAction } from "./actions"

type Status = {
  connected: boolean
  state: string
  configured: boolean
}

type QRResult = {
  base64: string | null
  pairingCode: string | null
  error: string | null
}

const STATE_LABEL: Record<string, string> = {
  open: "Conectado",
  close: "Desconectado",
  connecting: "Conectando...",
  not_configured: "Não configurado",
  unreachable: "API inacessível",
  error: "Erro",
  unknown: "Desconhecido",
}

export function WhatsAppClient({ initialStatus }: { initialStatus: Status }) {
  const [status, setStatus] = useState(initialStatus)
  const [qr, setQr] = useState<QRResult | null>(null)
  const [showQr, setShowQr] = useState(false)
  const [qrPending, startQr] = useTransition()
  const [statusPending, startStatus] = useTransition()
  const [disconnectPending, startDisconnect] = useTransition()
  const [disconnectError, setDisconnectError] = useState<string | null>(null)

  // Auto-refresh status every 15s
  useEffect(() => {
    const interval = setInterval(() => {
      startStatus(async () => {
        const s = await getWhatsAppStatusAction()
        setStatus(s)
        if (s.connected) {
          setShowQr(false)
          setQr(null)
        }
      })
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  // Auto-refresh QR every 25s when showing (QR expires ~30s)
  useEffect(() => {
    if (!showQr || status.connected) return
    const interval = setInterval(() => {
      startQr(async () => {
        const result = await gerarQRCodeAction()
        setQr(result)
      })
    }, 25000)
    return () => clearInterval(interval)
  }, [showQr, status.connected])

  function handleGerarQR() {
    setShowQr(true)
    startQr(async () => {
      const result = await gerarQRCodeAction()
      setQr(result)
    })
  }

  function handleRefreshStatus() {
    startStatus(async () => {
      const s = await getWhatsAppStatusAction()
      setStatus(s)
    })
  }

  function handleDesconectar() {
    setDisconnectError(null)
    startDisconnect(async () => {
      const { error } = await desconectarWhatsAppAction()
      if (error) {
        setDisconnectError(error)
      } else {
        setShowQr(false)
        setQr(null)
        const s = await getWhatsAppStatusAction()
        setStatus(s)
      }
    })
  }

  if (!status.configured) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-base text-amber-800">Evolution API não configurada</CardTitle>
          </div>
          <CardDescription className="text-amber-700">
            Configure as variáveis de ambiente para ativar o WhatsApp.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-amber-800">
          <div className="rounded-lg border border-amber-200 surface-light p-3 font-mono text-xs space-y-1">
            <p>WHATSAPP_ENABLED=true</p>
            <p>EVOLUTION_API_URL=http://localhost:8080</p>
            <p>EVOLUTION_API_KEY=sua-chave-aqui</p>
            <p>EVOLUTION_INSTANCE=lookmenu</p>
          </div>
          <p className="text-xs">
            Consulte{" "}
            <code className="rounded bg-amber-100 px-1">docs/whatsapp-setup.md</code>{" "}
            para instruções de setup com Docker.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {status.connected ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-muted-foreground" />
              )}
              <CardTitle className="text-base">
                {status.connected ? "WhatsApp conectado" : "WhatsApp desconectado"}
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              disabled={statusPending}
              onClick={handleRefreshStatus}
              className="gap-1 text-xs text-muted-foreground"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${statusPending ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>
          <CardDescription>
            Estado: <span className="font-medium">{STATE_LABEL[status.state] ?? status.state}</span>
          </CardDescription>
        </CardHeader>

        {status.connected ? (
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
              <Wifi className="h-4 w-4 text-green-600 shrink-0" />
              <p className="text-sm text-green-800">
                Mensagens automáticas estão sendo enviadas aos clientes.
              </p>
            </div>
            {disconnectError && (
              <p className="text-sm text-destructive">{disconnectError}</p>
            )}
            <Button
              variant="outline"
              size="sm"
              disabled={disconnectPending}
              onClick={handleDesconectar}
              className="gap-1.5 text-destructive hover:text-destructive"
            >
              <LogOut className="h-3.5 w-3.5" />
              {disconnectPending ? "Desconectando..." : "Desconectar WhatsApp"}
            </Button>
          </CardContent>
        ) : (
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Escaneie o QR Code com o WhatsApp do número que irá enviar as mensagens automáticas.
            </p>
            <Button onClick={handleGerarQR} disabled={qrPending} className="gap-2">
              <QrCode className="h-4 w-4" />
              {qrPending ? "Gerando QR..." : showQr ? "Gerar novo QR" : "Gerar QR Code"}
            </Button>
          </CardContent>
        )}
      </Card>

      {/* QR Code */}
      {showQr && !status.connected && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code
            </CardTitle>
            <CardDescription>
              Abra o WhatsApp → Dispositivos conectados → Conectar dispositivo → Escanear QR
            </CardDescription>
          </CardHeader>
          <CardContent>
            {qrPending ? (
              <div className="flex h-64 items-center justify-center rounded-xl border border-dashed">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : qr?.error ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                {qr.error}
              </div>
            ) : qr?.base64 ? (
              <div className="flex flex-col items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qr.base64.startsWith("data:") ? qr.base64 : `data:image/png;base64,${qr.base64}`}
                  alt="QR Code WhatsApp"
                  className="h-64 w-64 rounded-xl border border-border object-contain"
                />
                {qr.pairingCode && (
                  <p className="text-sm text-muted-foreground">
                    Código de emparelhamento:{" "}
                    <span className="font-mono font-bold text-foreground">{qr.pairingCode}</span>
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  O QR expira em ~30 segundos. A página atualiza automaticamente.
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Info section */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
            <Settings className="h-4 w-4" />
            Mensagens automáticas configuradas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span><strong>Pedido criado</strong> — Confirmação com itens e total</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span><strong>Em preparação</strong> — Aviso quando a cozinha começa</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span><strong>Pronto</strong> — Aviso de pedido pronto para retirada/entrega</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span><strong>Em entrega</strong> — Aviso de entregador a caminho (delivery)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span><strong>Concluído</strong> — Agradecimento final</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-muted-foreground/60">○</span>
              <span className="text-muted-foreground/70">Pedidos de mesa sem telefone → sem notificação</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

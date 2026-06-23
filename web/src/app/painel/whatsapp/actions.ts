"use server"

import { requireLojista } from "@/lib/auth"

function evolutionConfig() {
  const url = process.env.EVOLUTION_API_URL?.replace(/\/$/, "") ?? ""
  const key = process.env.EVOLUTION_API_KEY ?? ""
  const instance = process.env.EVOLUTION_INSTANCE ?? ""
  return { url, key, instance }
}

function isConfigured() {
  const { url, key, instance } = evolutionConfig()
  return Boolean(url && key && instance)
}

type EvolutionStatus = {
  connected: boolean
  state: string
  configured: boolean
}

export async function getWhatsAppStatusAction(): Promise<EvolutionStatus> {
  try {
    await requireLojista()
  } catch {
    return { connected: false, state: "unauthorized", configured: false }
  }

  if (!isConfigured()) {
    return { connected: false, state: "not_configured", configured: false }
  }

  const { url, key, instance } = evolutionConfig()

  try {
    const res = await fetch(`${url}/instance/connectionState/${instance}`, {
      headers: { apikey: key },
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    })

    if (!res.ok) {
      return { connected: false, state: "error", configured: true }
    }

    const data = (await res.json()) as { instance?: { state?: string } }
    const state = data?.instance?.state ?? "unknown"
    return { connected: state === "open", state, configured: true }
  } catch {
    return { connected: false, state: "unreachable", configured: true }
  }
}

type QRResult = {
  base64: string | null
  pairingCode: string | null
  error: string | null
}

export async function gerarQRCodeAction(): Promise<QRResult> {
  try {
    await requireLojista()
  } catch {
    return { base64: null, pairingCode: null, error: "Acesso negado." }
  }

  if (!isConfigured()) {
    return {
      base64: null,
      pairingCode: null,
      error: "Evolution API não configurada. Configure EVOLUTION_API_URL, EVOLUTION_API_KEY e EVOLUTION_INSTANCE no .env.",
    }
  }

  const { url, key, instance } = evolutionConfig()

  try {
    const res = await fetch(`${url}/instance/connect/${instance}`, {
      headers: { apikey: key },
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    })

    if (!res.ok) {
      const body = await res.text()
      return { base64: null, pairingCode: null, error: `Evolution API retornou ${res.status}: ${body}` }
    }

    const data = (await res.json()) as {
      qrcode?: { base64?: string; pairingCode?: string }
      base64?: string
    }

    const base64 = data?.qrcode?.base64 ?? data?.base64 ?? null
    const pairingCode = data?.qrcode?.pairingCode ?? null

    if (!base64 && !pairingCode) {
      return {
        base64: null,
        pairingCode: null,
        error: "QR Code não disponível. A instância pode já estar conectada ou o WhatsApp foi escaneado recentemente.",
      }
    }

    return { base64, pairingCode, error: null }
  } catch (err) {
    return {
      base64: null,
      pairingCode: null,
      error: `Erro ao conectar com Evolution API: ${err instanceof Error ? err.message : "Desconhecido"}`,
    }
  }
}

export async function desconectarWhatsAppAction(): Promise<{ error: string | null }> {
  try {
    await requireLojista()
  } catch {
    return { error: "Acesso negado." }
  }

  if (!isConfigured()) return { error: "Evolution API não configurada." }

  const { url, key, instance } = evolutionConfig()

  try {
    const res = await fetch(`${url}/instance/logout/${instance}`, {
      method: "DELETE",
      headers: { apikey: key },
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) {
      return { error: `Evolution API retornou ${res.status}` }
    }

    return { error: null }
  } catch (err) {
    return { error: `Erro: ${err instanceof Error ? err.message : "Desconhecido"}` }
  }
}

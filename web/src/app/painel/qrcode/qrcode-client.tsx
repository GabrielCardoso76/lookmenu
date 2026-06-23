"use client"

import { useState } from "react"
import { Copy, Download, QrCode } from "lucide-react"

import { Button } from "@/components/ui/button"

type QRCardProps = {
  label: string
  url: string
  dataUrl: string
  filename: string
}

export function QRCard({ label, url, dataUrl, filename }: QRCardProps) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    void navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownload() {
    const a = document.createElement("a")
    a.href = dataUrl
    a.download = filename
    a.click()
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-white p-5 shadow-sm">
      {/* QR preview */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={dataUrl} alt={`QR Code — ${label}`} className="h-40 w-40 rounded-lg" />

      <p className="text-center text-sm font-semibold">{label}</p>
      <p className="max-w-[220px] truncate text-center text-xs text-muted-foreground">{url}</p>

      <div className="flex w-full gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={handleCopy}>
          <Copy className="mr-1.5 h-3.5 w-3.5" />
          {copied ? "Copiado!" : "Copiar link"}
        </Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={handleDownload}>
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Baixar PNG
        </Button>
      </div>
    </div>
  )
}

export function QREmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
      <QrCode className="h-12 w-12" />
      <p className="text-sm">Nenhuma mesa cadastrada.</p>
      <p className="text-xs">Crie mesas em <strong>Painel → Mesas</strong> para gerar QR Codes individuais.</p>
    </div>
  )
}

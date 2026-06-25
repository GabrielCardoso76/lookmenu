"use client"

import { useState } from "react"
import { Monitor, Smartphone } from "lucide-react"

import { AparenciaForm } from "@/app/painel/aparencia/aparencia-form"

type LojaAparencia = {
  nome: string
  slug: string
  corPrimaria: string
  templateCardapio: string
  paletaPreset: string | null
  texturaFundo: string
  logoUrl: string | null
  fontePreset: string | null
  subtituloCardapio: string | null
  tituloAba: string | null
}

type PreviewState = {
  corPrimaria: string
  template: string
  textura: string
  fonte: string
  logoUrl: string
  subtitulo: string
  tituloAba: string
}

export function AparenciaShell({ loja }: { loja: LojaAparencia }) {
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("mobile")
  const [previewState, setPreviewState] = useState<PreviewState>({
    corPrimaria: loja.corPrimaria,
    template: loja.templateCardapio || "CLASSICO",
    textura: loja.texturaFundo || "NENHUMA",
    fonte: loja.fontePreset || "Inter",
    logoUrl: loja.logoUrl || "",
    subtitulo: loja.subtituloCardapio ?? "",
    tituloAba: loja.tituloAba ?? "",
  })

  function handlePreviewChange(state: PreviewState) {
    setPreviewState(state)
  }

  function buildIframeSrc() {
    const params = new URLSearchParams({
      _preview: "1",
      _cor: previewState.corPrimaria,
      _template: previewState.template,
      _textura: previewState.textura,
      _fonte: previewState.fonte,
      ...(previewState.logoUrl ? { _logo: previewState.logoUrl } : {}),
      ...(previewState.subtitulo ? { _subtitulo: previewState.subtitulo } : {}),
      _tituloAba: previewState.tituloAba,
    })
    return `/${loja.slug}?${params.toString()}`
  }

  const iframeSrc = buildIframeSrc()

  return (
    <div className="flex flex-col xl:flex-row gap-6 min-h-[600px]">
      {/* Formulário */}
      <div className="w-full xl:w-[40%] shrink-0">
        <AparenciaForm loja={loja} onPreviewChange={handlePreviewChange} />
      </div>

      {/* Preview */}
      <div className="flex-1 hidden xl:flex flex-col gap-3 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">Preview do cardápio</p>
          <div className="flex items-center gap-1">
            {/* Toggle Desktop/Mobile */}
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => setPreviewMode("desktop")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                  previewMode === "desktop"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-muted-foreground"
                }`}
              >
                <Monitor className="h-3.5 w-3.5" />
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode("mobile")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                  previewMode === "mobile"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-muted-foreground"
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                Mobile
              </button>
            </div>
            <a
              href={`/${loja.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-xs text-primary hover:underline"
            >
              Abrir ↗
            </a>
          </div>
        </div>

        {/* Preview container */}
        <div className="flex-1 flex items-start justify-center overflow-hidden rounded-2xl bg-zinc-900 p-6">
          {previewMode === "desktop" ? (
            /* Desktop frame */
            <div className="w-full h-full rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-white">
              <div className="h-7 bg-gray-100 border-b border-gray-200 flex items-center gap-1.5 px-3">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                <div className="mx-3 flex-1 h-4 rounded bg-gray-200 max-w-xs truncate px-2 text-[10px] leading-4 text-gray-500">
                  {previewState.tituloAba.trim() || loja.nome}
                </div>
              </div>
              <iframe
                src={iframeSrc}
                className="w-full"
                style={{ height: "calc(100% - 28px)", minHeight: "560px" }}
                title="Preview desktop do cardápio"
              />
            </div>
          ) : (
            /* Mobile phone frame */
            <div className="relative mx-auto" style={{ width: 390 }}>
              {/* Phone shell */}
              <div
                className="relative rounded-[3rem] border-[12px] border-gray-800 shadow-[0_30px_80px_rgba(0,0,0,0.6)] bg-gray-800 overflow-hidden"
                style={{ height: 790 }}
              >
                {/* Dynamic island */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-900 rounded-full z-10" />
                {/* Screen — no white bg; iframe fills it */}
                <div className="w-full h-full overflow-hidden rounded-[2.25rem]">
                  <iframe
                    src={iframeSrc}
                    className="w-full h-full border-0"
                    style={{
                      transform: "scale(0.75)",
                      transformOrigin: "top left",
                      width: "133.33%",
                      height: "133.33%",
                    }}
                    title="Preview mobile do cardápio"
                  />
                </div>
              </div>
              {/* Home indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-24 h-1 bg-white/30 rounded-full" />
            </div>
          )}
        </div>
      </div>

      {/* Mobile: preview abaixo do form */}
      <div className="flex xl:hidden flex-col gap-3 mt-4">
        <p className="text-sm font-medium text-muted-foreground">Preview (mobile)</p>
        <div className="flex justify-center bg-zinc-900 rounded-2xl p-4">
          <div className="relative mx-auto" style={{ width: 300 }}>
            <div
              className="relative rounded-[2.5rem] border-[10px] border-gray-800 shadow-2xl bg-gray-800 overflow-hidden"
              style={{ height: 580 }}
            >
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-900 rounded-full z-10" />
              <div className="w-full h-full overflow-hidden rounded-[1.75rem]">
                <iframe
                  src={iframeSrc}
                  className="w-full h-full border-0"
                  style={{
                    transform: "scale(0.72)",
                    transformOrigin: "top left",
                    width: "138.88%",
                    height: "138.88%",
                  }}
                  title="Preview mobile"
                />
              </div>
            </div>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-20 h-1 bg-white/30 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

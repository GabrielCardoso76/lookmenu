"use client"

import { useActionState, useRef, useState, useTransition } from "react"

import { updateAparenciaAction, type ActionState } from "@/app/painel/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

type PreviewState = {
  corPrimaria: string
  template: string
  textura: string
  fonte: string
  logoUrl: string
  subtitulo: string
  tituloAba: string
}

type AparenciaFormProps = {
  loja: {
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
  onPreviewChange?: (state: PreviewState) => void
}

const PALETAS = [
  { id: "amber", label: "Âmbar", cor: "#F59E0B" },
  { id: "rose", label: "Rosa", cor: "#F43F5E" },
  { id: "emerald", label: "Verde", cor: "#10B981" },
  { id: "violet", label: "Violeta", cor: "#7C3AED" },
  { id: "neutro", label: "Neutro", cor: "#374151" },
  { id: "red", label: "Vermelho", cor: "#DC2626" },
  { id: "yellow", label: "Amarelo", cor: "#EAB308" },
  { id: "orange", label: "Laranja", cor: "#EA580C" },
]

const TEMPLATES = [
  {
    id: "CLASSICO",
    label: "Clássico",
    desc: "Cards com bordas, layout limpo",
    preview: "bg-white border-2 border-gray-200",
  },
  {
    id: "MODERNO",
    label: "Moderno",
    desc: "Linhas horizontais, hero colorido",
    preview: "bg-gray-100 border-2 border-gray-300",
  },
  {
    id: "DARK",
    label: "Dark",
    desc: "Fundo escuro, visual premium",
    preview: "bg-gray-900 border-2 border-gray-700",
  },
]

const TEXTURAS = [
  { id: "NENHUMA",  label: "Nenhuma" },
  { id: "GRAIN",   label: "Granulado" },
  { id: "DOTS",    label: "Pontos" },
  { id: "WAVES",   label: "Ondas" },
  { id: "STRIPES", label: "Listras" },
  { id: "CHECKS",  label: "Grade" },
  { id: "CIRCLES", label: "Anéis" },
  { id: "FOOD",    label: "🍔 Lanches" },
]

const FONTES = [
  { id: "Inter", label: "Inter", preview: "font-sans" },
  { id: "Poppins", label: "Poppins", style: "'Poppins', sans-serif" },
  { id: "Montserrat", label: "Montserrat", style: "'Montserrat', sans-serif" },
  { id: "Nunito", label: "Nunito", style: "'Nunito', sans-serif" },
  { id: "Raleway", label: "Raleway", style: "'Raleway', sans-serif" },
  { id: "Open Sans", label: "Open Sans", style: "'Open Sans', sans-serif" },
  { id: "Oswald", label: "Oswald", style: "'Oswald', sans-serif" },
  { id: "Playfair Display", label: "Playfair", style: "'Playfair Display', serif" },
  { id: "Lato", label: "Lato", style: "'Lato', sans-serif" },
  { id: "Roboto", label: "Roboto", style: "'Roboto', sans-serif" },
]

export function AparenciaForm({ loja, onPreviewChange }: AparenciaFormProps) {
  const [state, formAction, pending] = useActionState(updateAparenciaAction, {} as ActionState)
  const [uploadPending, startUpload] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)

  const [nome, setNome] = useState(loja.nome)
  const [subtitulo, setSubtitulo] = useState(loja.subtituloCardapio ?? "")
  const [tituloAba, setTituloAba] = useState(loja.tituloAba ?? "")
  const [corPrimaria, setCorPrimaria] = useState(loja.corPrimaria)
  const [template, setTemplate] = useState(loja.templateCardapio || "CLASSICO")
  const [paleta, setPaleta] = useState(loja.paletaPreset || "custom")
  const [textura, setTextura] = useState(loja.texturaFundo || "NENHUMA")
  const [logoUrl, setLogoUrl] = useState(loja.logoUrl || "")
  const [fonte, setFonte] = useState(loja.fontePreset || "Inter")

  function notifyPreview(overrides: Partial<PreviewState> = {}) {
    onPreviewChange?.({
      corPrimaria,
      template,
      textura,
      fonte,
      logoUrl,
      subtitulo,
      tituloAba,
      ...overrides,
    })
  }

  function selecionarPaleta(p: { id: string; cor: string }) {
    setPaleta(p.id)
    setCorPrimaria(p.cor)
    notifyPreview({ corPrimaria: p.cor })
  }

  function selecionarTemplate(t: string) {
    setTemplate(t)
    notifyPreview({ template: t })
  }

  function selecionarTextura(t: string) {
    setTextura(t)
    notifyPreview({ textura: t })
  }

  function selecionarFonte(f: string) {
    setFonte(f)
    notifyPreview({ fonte: f })
  }

  function handleLogoUrlChange(url: string) {
    setLogoUrl(url)
    notifyPreview({ logoUrl: url })
  }

  function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    startUpload(async () => {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("path", `logos/${Date.now()}-${file.name}`)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      if (res.ok) {
        const { url } = (await res.json()) as { url: string }
        setLogoUrl(url)
        notifyPreview({ logoUrl: url })
      }
    })
  }

  return (
    <form action={formAction} className="space-y-8">
      {/* Nome da loja */}
      <div className="space-y-2">
        <Label htmlFor="nome">Nome da loja</Label>
        <Input
          id="nome"
          name="nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
      </div>

      {/* Título da aba */}
      <div className="space-y-2">
        <Label htmlFor="tituloAba">Título da aba do navegador</Label>
        <Input
          id="tituloAba"
          name="tituloAba"
          placeholder={loja.nome}
          value={tituloAba}
          onChange={(e) => {
            setTituloAba(e.target.value)
            notifyPreview({ tituloAba: e.target.value })
          }}
        />
        <p className="text-xs text-muted-foreground">
          Texto exibido na aba do browser ao abrir o cardápio. Deixe vazio para usar o nome da loja
          {nome.trim() ? ` (“${nome.trim()}”)` : ""}.
        </p>
      </div>

      {/* Subtítulo */}
      <div className="space-y-2">
        <Label htmlFor="subtituloCardapio">Subtítulo do cardápio</Label>
        <Input
          id="subtituloCardapio"
          name="subtituloCardapio"
          placeholder="Cardápio digital"
          value={subtitulo}
          onChange={(e) => {
            setSubtitulo(e.target.value)
            notifyPreview({ subtitulo: e.target.value })
          }}
        />
        <p className="text-xs text-muted-foreground">Aparece abaixo do nome da loja no topo do cardápio.</p>
      </div>

      {/* Logo */}
      <div className="space-y-3">
        <Label htmlFor="logoUrl">Logo da loja</Label>
        <div className="flex items-start gap-3">
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt="Preview do logo"
              className="h-16 w-16 shrink-0 rounded-xl border border-border object-contain bg-white p-1"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
            />
          )}
          <div className="flex-1 space-y-1.5">
            <Input
              id="logoUrl"
              name="logoUrl"
              type="url"
              placeholder="https://exemplo.com/logo.png"
              value={logoUrl}
              onChange={(e) => handleLogoUrlChange(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploadPending}
                onClick={() => fileRef.current?.click()}
                className="text-xs"
              >
                {uploadPending ? "Enviando..." : "Escolher arquivo"}
              </Button>
              {logoUrl && (
                <button
                  type="button"
                  onClick={() => handleLogoUrlChange("")}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  Remover
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoFile} />
            <p className="text-xs text-muted-foreground">PNG, JPG ou SVG. Aparece no topo do cardápio.</p>
          </div>
        </div>
      </div>

      {/* Fonte */}
      <div className="space-y-3">
        <Label>Fonte do cardápio</Label>
        <div className="flex flex-wrap gap-2">
          {FONTES.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => selecionarFonte(f.id)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                fonte === f.id
                  ? "border-2 border-primary bg-primary/5 text-primary"
                  : "border-border hover:border-foreground/30"
              }`}
              style={f.style ? { fontFamily: f.style } : {}}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Paletas pré-montadas */}
      <div className="space-y-3">
        <Label>Paleta de cor</Label>
        <div className="flex flex-wrap gap-2">
          {PALETAS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => selecionarPaleta(p)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                paleta === p.id
                  ? "border-2 shadow-md"
                  : "border-border hover:border-foreground/30"
              }`}
              style={paleta === p.id ? { borderColor: p.cor, color: p.cor } : {}}
            >
              <span
                className="h-4 w-4 rounded-full border border-white/30"
                style={{ backgroundColor: p.cor }}
              />
              {p.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPaleta("custom")}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
              paleta === "custom" ? "border-2 border-foreground" : "border-border hover:border-foreground/30"
            }`}
          >
            Personalizada
          </button>
        </div>

        {/* Color picker */}
        <div className="flex items-center gap-3">
          <Input
            id="corPrimaria"
            name="corPrimaria"
            type="color"
            value={corPrimaria}
            onChange={(e) => {
              setCorPrimaria(e.target.value)
              setPaleta("custom")
              notifyPreview({ corPrimaria: e.target.value })
            }}
            className="h-12 w-16 cursor-pointer rounded-lg p-1"
          />
          <span className="font-mono text-sm text-muted-foreground">{corPrimaria}</span>
          <div
            className="h-8 w-8 rounded-full border border-border"
            style={{ backgroundColor: corPrimaria }}
          />
        </div>
      </div>

      {/* Template selector */}
      <div className="space-y-3">
        <Label>Template do cardápio</Label>
        <div className="grid grid-cols-3 gap-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => selecionarTemplate(t.id)}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all ${
                template === t.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-foreground/30"
              }`}
            >
              <div className={`h-12 w-full rounded-lg ${t.preview} flex items-center justify-center`}>
                <div
                  className={`h-2 w-8 rounded-full ${template === t.id ? "opacity-100" : "opacity-40"}`}
                  style={{ backgroundColor: corPrimaria }}
                />
              </div>
              <p className="font-semibold text-sm">{t.label}</p>
              <p className="text-xs text-muted-foreground">{t.desc}</p>
              {template === t.id && (
                <Badge variant="default" className="text-xs">Selecionado</Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Textura de fundo */}
      <div className="space-y-3">
        <Label>Textura de fundo</Label>
        <div className="flex flex-wrap gap-2">
          {TEXTURAS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => selecionarTextura(t.id)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                textura === t.id
                  ? "border-2 border-primary bg-primary/5 text-primary"
                  : "border-border hover:border-foreground/30"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hidden fields */}
      <input type="hidden" name="templateCardapio" value={template} />
      <input type="hidden" name="paletaPreset" value={paleta} />
      <input type="hidden" name="texturaFundo" value={textura} />
      <input type="hidden" name="fontePreset" value={fonte} />
      <input type="hidden" name="subtituloCardapio" value={subtitulo} />

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-green-600">{state.success}</p> : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar aparência"}
        </Button>
        <a
          href={`/${loja.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground underline hover:text-foreground"
        >
          Abrir cardápio em nova aba ↗
        </a>
      </div>
    </form>
  )
}

"use client"

import { useActionState, useState } from "react"

import { updateAparenciaAction, type ActionState } from "@/app/painel/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

type AparenciaFormProps = {
  loja: {
    nome: string
    slug: string
    corPrimaria: string
    templateCardapio: string
    paletaPreset: string | null
    texturaFundo: string
  }
}

const PALETAS = [
  { id: "amber", label: "Âmbar", cor: "#F59E0B" },
  { id: "rose", label: "Rosa", cor: "#F43F5E" },
  { id: "emerald", label: "Verde", cor: "#10B981" },
  { id: "violet", label: "Violeta", cor: "#7C3AED" },
  { id: "neutro", label: "Neutro", cor: "#374151" },
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
  { id: "NENHUMA", label: "Nenhuma" },
  { id: "GRAIN", label: "Granulado" },
  { id: "DOTS", label: "Pontos" },
  { id: "WAVES", label: "Ondas" },
]

export function AparenciaForm({ loja }: AparenciaFormProps) {
  const [state, formAction, pending] = useActionState(updateAparenciaAction, {} as ActionState)

  const [nome, setNome] = useState(loja.nome)
  const [corPrimaria, setCorPrimaria] = useState(loja.corPrimaria)
  const [template, setTemplate] = useState(loja.templateCardapio || "CLASSICO")
  const [paleta, setPaleta] = useState(loja.paletaPreset || "custom")
  const [textura, setTextura] = useState(loja.texturaFundo || "NENHUMA")

  function selecionarPaleta(p: { id: string; cor: string }) {
    setPaleta(p.id)
    setCorPrimaria(p.cor)
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
              onClick={() => setTemplate(t.id)}
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
              onClick={() => setTextura(t.id)}
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

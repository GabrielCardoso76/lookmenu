/** Título da aba do navegador no cardápio (padrão: nome da loja). */
export function tituloAbaCardapio(loja: { nome: string; tituloAba?: string | null }): string {
  const custom = loja.tituloAba?.trim()
  return custom || loja.nome
}

/**
 * Utilitários de configuração de loja.
 *
 * Limitação conhecida: horários que cruzam meia-noite (ex: 22:00–02:00) NÃO são
 * suportados. Se `abreAs > fechaAs`, o horário é ignorado e o dia é tratado como
 * fechado. Para suporte a madrugada, divida em dois registros de dia.
 */

// ─── Taxa de entrega ──────────────────────────────────────────────────────────

export type TotaisPedidoInput = {
  subtotal: number
  tipoEntrega: "DELIVERY" | "RETIRADA_BALCAO" | "SALAO_MESA"
  pedidoMinimo?: number | null
  taxaEntregaFixa?: number | null
  freteGratisAcima?: number | null
  desconto?: number
}

export type TotaisPedido = {
  subtotal: number
  taxaEntrega: number
  desconto: number
  total: number
}

/**
 * Calcula subtotal, taxa de entrega e total de um pedido.
 * - Taxa só se aplica em DELIVERY.
 * - freteGratisAcima: zera a taxa se subtotal >= limite.
 * - desconto: cupom/promoção (padrão 0, não implementado neste MVP).
 */
export function calcularTotaisPedido({
  subtotal,
  tipoEntrega,
  taxaEntregaFixa,
  freteGratisAcima,
  desconto = 0,
}: TotaisPedidoInput): TotaisPedido {
  let taxaEntrega = 0

  if (tipoEntrega === "DELIVERY" && taxaEntregaFixa && taxaEntregaFixa > 0) {
    taxaEntrega = taxaEntregaFixa
    if (freteGratisAcima != null && subtotal >= freteGratisAcima) {
      taxaEntrega = 0
    }
  }

  const total = Math.max(0, subtotal + taxaEntrega - desconto)

  return { subtotal, taxaEntrega, desconto, total }
}

export type HorarioFuncionamentoDia = {
  diaSemana: number
  abreAs: string
  fechaAs: string
  fechado: boolean
}

export type LojaEstaAbertaInput = {
  timezone: string
  horarios: HorarioFuncionamentoDia[]
  now?: Date
}

export type LojaEstaAbertaResult = {
  aberta: boolean
  proximaAbertura?: string
  mensagem: string
}

const DIAS_PT = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"]

function horaToMinutos(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

function formatarProximaAbertura(
  diaSemana: number,
  abreAs: string,
  timezone: string,
): string {
  const nomeDia = DIAS_PT[diaSemana] ?? "em breve"
  return `${nomeDia} às ${abreAs} (${timezone})`
}

export function lojaEstaAberta({
  timezone,
  horarios,
  now,
}: LojaEstaAbertaInput): LojaEstaAbertaResult {
  const referencia = now ?? new Date()

  // Converte o instante atual para o fuso horário da loja usando Intl
  const partes = new Intl.DateTimeFormat("pt-BR", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hour12: false,
  }).formatToParts(referencia)

  const horaStr = partes.find((p) => p.type === "hour")?.value ?? "00"
  const minStr = partes.find((p) => p.type === "minute")?.value ?? "00"
  const minutosAgora = parseInt(horaStr, 10) * 60 + parseInt(minStr, 10)

  // Dia da semana no fuso da loja (0=dom … 6=sáb)
  const dataLocal = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
  }).format(referencia)

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  }
  const diaAtual = weekdayMap[dataLocal] ?? referencia.getDay()

  const horarioHoje = horarios.find((h) => h.diaSemana === diaAtual)

  if (horarioHoje && !horarioHoje.fechado) {
    const abre = horaToMinutos(horarioHoje.abreAs)
    const fecha = horaToMinutos(horarioHoje.fechaAs)

    if (abre < fecha && minutosAgora >= abre && minutosAgora < fecha) {
      return { aberta: true, mensagem: `Aberto até ${horarioHoje.fechaAs}` }
    }

    if (minutosAgora < abre) {
      return {
        aberta: false,
        proximaAbertura: formatarProximaAbertura(diaAtual, horarioHoje.abreAs, timezone),
        mensagem: `Abre hoje às ${horarioHoje.abreAs}`,
      }
    }
  }

  // Procura o próximo dia com abertura (até 7 dias à frente)
  for (let offset = 1; offset <= 7; offset++) {
    const proximoDia = (diaAtual + offset) % 7
    const h = horarios.find((x) => x.diaSemana === proximoDia)
    if (h && !h.fechado) {
      const label = formatarProximaAbertura(proximoDia, h.abreAs, timezone)
      return {
        aberta: false,
        proximaAbertura: label,
        mensagem: `Fechado — próxima abertura: ${label}`,
      }
    }
  }

  return {
    aberta: false,
    mensagem: "Fechado no momento.",
  }
}

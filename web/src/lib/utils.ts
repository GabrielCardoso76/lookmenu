import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Texto legível (#fff ou #171717) sobre um fundo em hex (#RRGGBB). */
export function contrastingTextColor(hex: string): '#ffffff' | '#171717' {
  const normalized = hex.replace('#', '').trim()
  if (normalized.length !== 6 && normalized.length !== 3) return '#ffffff'

  const expand = normalized.length === 3
    ? normalized.split('').map((c) => c + c).join('')
    : normalized

  const r = parseInt(expand.slice(0, 2), 16)
  const g = parseInt(expand.slice(2, 4), 16)
  const b = parseInt(expand.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  return luminance > 0.55 ? '#171717' : '#ffffff'
}

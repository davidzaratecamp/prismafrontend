/** Formateadores compartidos por el panel de Retell IA. */

import { parseDbDate } from '@/lib/time'

/** Zona horaria en la que se muestran todas las fechas/horas del panel. */
export const RETELL_TZ = 'America/Bogota'

/** Offset fijo de Bogotá respecto a UTC, en ms (UTC−5, sin horario de verano). */
export const RETELL_TZ_OFFSET_MS = -5 * 60 * 60 * 1000

/**
 * Formatea una fecha de MySQL (UTC, 'YYYY-MM-DD HH:MM:SS') a hora de Bogotá.
 */
export function fmtBogota(
  dbUtc: string | null | undefined,
  opts: Intl.DateTimeFormatOptions = { dateStyle: 'short', timeStyle: 'short' },
): string {
  if (!dbUtc) return '—'
  const d = parseDbDate(dbUtc)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('es-CO', { timeZone: RETELL_TZ, ...opts })
}

export function usd(n: number | null | undefined, dp = 2): string {
  if (n == null) return '—'
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  })
}

export function pct(n: number | null | undefined): string {
  if (n == null) return '—'
  return `${Math.round(n * 100)}%`
}

export function num(n: number | null | undefined): string {
  if (n == null) return '—'
  return n.toLocaleString('es-CO')
}

/** segundos -> "2m 03s" / "45s" */
export function dur(seconds: number | null | undefined): string {
  if (seconds == null) return '—'
  const s = Math.round(seconds)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const rem = s % 60
  return `${m}m ${String(rem).padStart(2, '0')}s`
}

export function ms(n: number | null | undefined): string {
  if (n == null) return '—'
  return `${Math.round(n)} ms`
}

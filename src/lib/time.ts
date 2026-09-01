import { useEffect, useState } from 'react'
import { parseISO } from 'date-fns'

/** Fechas de MySQL vienen como 'YYYY-MM-DD HH:MM:SS' en UTC (sin zona). */
export function parseDbDate(s: string): Date {
  const iso = s.includes('T') ? s : s.replace(' ', 'T')
  return new Date(/[Z+]/.test(iso.slice(10)) ? iso : `${iso}Z`)
}

/** Re-renderiza cada `ms` para mantener vivos los contadores. */
export function useNow(ms = 60_000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms)
    return () => clearInterval(id)
  }, [ms])
  return now
}

export interface Countdown {
  /** milisegundos restantes (negativo si ya venció) */
  ms: number
  overdue: boolean
  days: number
  hours: number
  /** texto corto: "faltan 3 d 7 h", "vence en 5 h", "venció hace 2 d" */
  label: string
  /** texto largo para encabezados */
  long: string
}

export function countdownTo(dateStr: string, now = Date.now()): Countdown {
  const target = parseISO(dateStr).getTime()
  const diff = target - now
  const overdue = diff < 0
  const abs = Math.abs(diff)
  const days = Math.floor(abs / 86_400_000)
  const hours = Math.floor((abs % 86_400_000) / 3_600_000)

  let label: string
  let long: string
  if (overdue) {
    label = days >= 1 ? `venció hace ${days} d` : `venció hace ${hours} h`
    long = days >= 1 ? `Venció hace ${days} día${days === 1 ? '' : 's'}` : `Venció hace ${hours} hora${hours === 1 ? '' : 's'}`
  } else if (days >= 1) {
    label = `faltan ${days} d ${hours} h`
    long = `Faltan ${days} día${days === 1 ? '' : 's'} y ${hours} hora${hours === 1 ? '' : 's'}`
  } else {
    label = `vence en ${hours} h`
    long = `Vence en ${hours} hora${hours === 1 ? '' : 's'}`
  }
  return { ms: diff, overdue, days, hours, label, long }
}

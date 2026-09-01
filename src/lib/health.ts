import { differenceInCalendarDays, parseISO } from 'date-fns'
import type { ProjectStatus } from './types'

export type HealthKey =
  | 'ontrack'
  | 'risk'
  | 'delayed'
  | 'attention'
  | 'completed'
  | 'paused'
  | 'nodate'

interface HealthMeta {
  key: HealthKey
  label: string
  /** clases tailwind para el pill (texto + fondo suave) */
  badge: string
  /** color sólido para puntos/barras */
  dot: string
  /** cuenta como "necesita atención" en los KPIs */
  needsAttention: boolean
}

const META: Record<HealthKey, Omit<HealthMeta, 'key'>> = {
  ontrack: {
    label: 'En fecha',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    dot: '#10b981',
    needsAttention: false,
  },
  risk: {
    label: 'En riesgo',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    dot: '#f59e0b',
    needsAttention: true,
  },
  delayed: {
    label: 'Con retraso',
    badge: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
    dot: '#ef4444',
    needsAttention: true,
  },
  attention: {
    label: 'Bloqueado',
    badge: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
    dot: '#ef4444',
    needsAttention: true,
  },
  completed: {
    label: 'Entregado',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    dot: '#3b82f6',
    needsAttention: false,
  },
  paused: {
    label: 'En pausa',
    badge: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    dot: '#a1a1aa',
    needsAttention: false,
  },
  nodate: {
    label: 'Sin fecha',
    badge: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    dot: '#94a3b8',
    needsAttention: false,
  },
}

/** Umbrales del semáforo */
export const RISK_DAYS = 10
export const RISK_PROGRESS = 70

export interface HealthInput {
  status: ProjectStatus
  due_date: string | null
  progress_cached: number
}

export function projectHealth(p: HealthInput): HealthMeta {
  let key: HealthKey

  if (p.status === 'completed') key = 'completed'
  else if (p.status === 'paused') key = 'paused'
  else if (p.status === 'blocked') key = 'attention'
  else if (!p.due_date) key = 'nodate'
  else {
    const daysLeft = differenceInCalendarDays(parseISO(p.due_date), new Date())
    if (daysLeft < 0 && p.progress_cached < 100) key = 'delayed'
    else if (daysLeft <= RISK_DAYS && p.progress_cached < RISK_PROGRESS) key = 'risk'
    else key = 'ontrack'
  }

  return { key, ...META[key] }
}

export function healthCounts(projects: HealthInput[]) {
  const c = { ontrack: 0, risk: 0, delayed: 0, attention: 0, completed: 0, paused: 0, nodate: 0 }
  for (const p of projects) c[projectHealth(p).key]++
  return {
    ...c,
    needsAttention: c.risk + c.delayed + c.attention,
  }
}

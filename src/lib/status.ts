import type { Priority, ProjectStatus, TaskStatus } from './types'

interface Meta {
  label: string
  /** clases tailwind para badge (texto + fondo suave) */
  badge: string
  /** color sólido para barras/puntos */
  dot: string
}

export const PROJECT_STATUS: Record<ProjectStatus, Meta> = {
  planned: { label: 'Planeado', badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', dot: '#64748b' },
  in_progress: { label: 'En progreso', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300', dot: '#3b82f6' },
  testing: { label: 'En pruebas', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300', dot: '#f59e0b' },
  blocked: { label: 'Bloqueado', badge: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300', dot: '#ef4444' },
  paused: { label: 'Pausado', badge: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400', dot: '#a1a1aa' },
  completed: { label: 'Completado', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300', dot: '#10b981' },
}

export const TASK_STATUS: Record<TaskStatus, Meta> = {
  todo: { label: 'Por hacer', badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', dot: '#94a3b8' },
  in_progress: { label: 'En progreso', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300', dot: '#3b82f6' },
  testing: { label: 'En pruebas', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300', dot: '#f59e0b' },
  blocked: { label: 'Bloqueado', badge: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300', dot: '#ef4444' },
  done: { label: 'Hecho', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300', dot: '#10b981' },
}

export const PRIORITY: Record<Priority, Meta> = {
  low: { label: 'Baja', badge: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400', dot: '#94a3b8' },
  medium: { label: 'Media', badge: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300', dot: '#0ea5e9' },
  high: { label: 'Alta', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300', dot: '#f97316' },
  critical: { label: 'Crítica', badge: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300', dot: '#ef4444' },
}

export const PROJECT_STATUS_OPTIONS = Object.entries(PROJECT_STATUS).map(([value, m]) => ({
  value: value as ProjectStatus,
  label: m.label,
}))
export const TASK_STATUS_OPTIONS = Object.entries(TASK_STATUS).map(([value, m]) => ({
  value: value as TaskStatus,
  label: m.label,
}))
export const PRIORITY_OPTIONS = Object.entries(PRIORITY).map(([value, m]) => ({
  value: value as Priority,
  label: m.label,
}))

export const KANBAN_COLUMNS: TaskStatus[] = ['todo', 'in_progress', 'testing', 'done', 'blocked']

export function progressTone(pct: number): string {
  if (pct >= 100) return '#10b981'
  if (pct >= 60) return '#3b82f6'
  if (pct >= 30) return '#f59e0b'
  return '#94a3b8'
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

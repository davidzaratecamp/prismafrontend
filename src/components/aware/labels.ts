/** Etiquetas legibles para los valores de Aware. */

export const HANGUP_LABEL: Record<string, string> = {
  call_transfer: 'Transferida a asesor',
  user_hangup: 'Colgó el cliente',
  agent_hangup: 'Colgó el bot',
  inactivity: 'Cerrada por inactividad',
  sin_dato: 'Sin dato / en curso',
}

export const HANGUP_COLOR: Record<string, string> = {
  call_transfer: '#6366f1',
  user_hangup: '#ef4444',
  agent_hangup: '#f59e0b',
  inactivity: '#94a3b8',
  sin_dato: '#cbd5e1',
}

export const SENTIMENT_LABEL: Record<string, string> = {
  Positive: 'Positivo',
  Neutral: 'Neutral',
  Negative: 'Negativo',
  Unknown: 'Desconocido',
}

export const SENTIMENT_COLOR: Record<string, string> = {
  Positive: '#10b981',
  Neutral: '#94a3b8',
  Negative: '#ef4444',
  Unknown: '#cbd5e1',
}

export const hangupLabel = (v: string | null | undefined) =>
  v ? HANGUP_LABEL[v] ?? v : 'Sin dato'
export const sentimentLabel = (v: string | null | undefined) =>
  v ? SENTIMENT_LABEL[v] ?? v : '—'

/* ── entregable por llamada ── */

export const ESTADO_COLOR: Record<string, string> = {
  Transferido: '#6366f1',
  'Abandonado en cola': '#ef4444',
  'Transferencia fallida': '#f97316',
  'En curso': '#f59e0b',
  'Gestión IA': '#94a3b8',
}

/** Clases de badge por estado del entregable. */
export const ESTADO_BADGE: Record<string, string> = {
  Transferido: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300',
  'Abandonado en cola': 'bg-red-500/15 text-red-700 dark:text-red-300',
  'Transferencia fallida': 'bg-orange-500/15 text-orange-700 dark:text-orange-300',
  'En curso': 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  'Gestión IA': 'bg-muted text-muted-foreground',
}

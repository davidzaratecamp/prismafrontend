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

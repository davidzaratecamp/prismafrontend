import { ArrowDown, ArrowUp, Minus, ArrowLeftRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AwarePeriodComparison } from '@/lib/types'
import { num, pct } from '@/lib/analyticsFormat'
import { cn } from '@/lib/utils'

/** true = que suba es bueno (transferir, atender, éxito, positivo); false = que suba es malo. */
const ROWS: { key: keyof AwarePeriodComparison['deltas']; label: string; goodUp: boolean; isPct?: boolean }[] = [
  { key: 'total_calls_pct', label: 'Llamadas', goodUp: true, isPct: true },
  { key: 'transfer_rate_pp', label: 'Tasa de transferencia', goodUp: true },
  { key: 'atendidas_rate_pp', label: 'Transferencias atendidas', goodUp: true },
  { key: 'conversion_rate_pp', label: 'Conversión a ÚTIL POSITIVO', goodUp: true },
  { key: 'success_rate_pp', label: 'Éxito del bot', goodUp: true },
  { key: 'user_hangup_rate_pp', label: 'Colgó el cliente', goodUp: false },
  { key: 'agent_hangup_rate_pp', label: 'Colgó el bot', goodUp: false },
  { key: 'positive_rate_pp', label: 'Sentimiento positivo', goodUp: true },
]

function DeltaChip({ value, goodUp, isPct }: { value: number | null; goodUp: boolean; isPct?: boolean }) {
  if (value == null) return <span className="text-xs text-muted-foreground">—</span>
  const up = value > 0
  const flat = Math.abs(value) < (isPct ? 0.005 : 0.0005)
  const good = flat ? null : up === goodUp
  const text = isPct ? `${up ? '+' : ''}${Math.round(value * 100)}%` : `${up ? '+' : ''}${Math.round(value * 100)} pp`
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium tabular-nums',
        flat ? 'text-muted-foreground' : good ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
      )}
    >
      {flat ? <Minus className="size-3" /> : up ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
      {text}
    </span>
  )
}

export function PeriodComparisonCard({ data }: { data?: AwarePeriodComparison }) {
  if (!data) return null
  const { current: c, previous: p, deltas: d } = data

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ArrowLeftRight className="size-4" /> Vs. los {data.days} día(s) anteriores
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="mb-2 flex justify-between text-[11px] text-muted-foreground">
          <span>{p.from} → {p.to}</span>
          <span>{c.from} → {c.to} (actual)</span>
        </div>
        {ROWS.map((r) => (
          <div key={r.key} className="flex items-center justify-between border-t py-1.5 text-sm first:border-t-0">
            <span className="text-muted-foreground">{r.label}</span>
            <div className="flex items-center gap-3">
              <span className="tabular-nums text-muted-foreground">
                {r.key === 'total_calls_pct' ? num(p.total_calls) : '—'}
              </span>
              <DeltaChip value={d[r.key]} goodUp={r.goodUp} isPct={r.isPct} />
              <span className="w-14 text-right tabular-nums font-medium">
                {r.key === 'total_calls_pct' ? num(c.total_calls) : pct(currentValue(c, r.key))}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function currentValue(c: AwarePeriodComparison['current'], deltaKey: string): number | null {
  const map: Record<string, keyof AwarePeriodComparison['current']> = {
    transfer_rate_pp: 'transfer_rate',
    atendidas_rate_pp: 'atendidas_rate',
    conversion_rate_pp: 'conversion_rate',
    success_rate_pp: 'success_rate',
    user_hangup_rate_pp: 'user_hangup_rate',
    agent_hangup_rate_pp: 'agent_hangup_rate',
    positive_rate_pp: 'positive_rate',
  }
  const key = map[deltaKey]
  return key ? (c[key] as number | null) : null
}

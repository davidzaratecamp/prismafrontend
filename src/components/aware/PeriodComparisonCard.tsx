import { useState } from 'react'
import { ArrowDown, ArrowUp, Minus, ArrowLeftRight, RotateCcw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { AwarePeriodStats } from '@/lib/types'
import { useAwarePeriodComparison, type AwareFilters } from '@/hooks/aware'
import { dur, num, pct } from '@/lib/analyticsFormat'
import { cn } from '@/lib/utils'

type Kind = 'count' | 'rate' | 'seconds'

/** goodUp: true = que suba es bueno; false = que suba es malo; null = neutro (sin color). */
const GROUPS: { title: string; rows: { key: keyof AwarePeriodStats; label: string; kind: Kind; goodUp: boolean | null }[] }[] = [
  {
    title: 'Volumen',
    rows: [
      { key: 'total_calls', label: 'Llamadas entrantes', kind: 'count', goodUp: null },
      { key: 'calls_per_day', label: 'Llamadas por día (promedio)', kind: 'count', goodUp: null },
      { key: 'transfers', label: 'Transferidas a asesor', kind: 'count', goodUp: null },
      { key: 'transfer_rate', label: 'Tasa de transferencia', kind: 'rate', goodUp: true },
    ],
  },
  {
    title: 'Asesor humano',
    rows: [
      { key: 'atendidas', label: 'Atendidas por un asesor', kind: 'count', goodUp: true },
      { key: 'atendidas_rate', label: '% de transferencias atendidas', kind: 'rate', goodUp: true },
      { key: 'sin_asesor', label: 'Sin asesor', kind: 'count', goodUp: false },
      { key: 'abandono_cola', label: 'Abandono en cola', kind: 'count', goodUp: false },
      { key: 'ventas', label: 'Ventas exitosas', kind: 'count', goodUp: true },
      { key: 'conversion_rate', label: 'Conversión a venta', kind: 'rate', goodUp: true },
    ],
  },
  {
    title: 'SOFIA',
    rows: [
      { key: 'success_rate', label: 'Éxito del bot', kind: 'rate', goodUp: true },
      { key: 'user_hangup_rate', label: 'Colgó el cliente', kind: 'rate', goodUp: false },
      { key: 'agent_hangup_rate', label: 'Colgó el bot', kind: 'rate', goodUp: false },
      { key: 'inactivity_rate', label: 'Inactividad', kind: 'rate', goodUp: false },
      { key: 'avg_duration_seconds', label: 'Duración promedio', kind: 'seconds', goodUp: null },
      { key: 'positive_rate', label: 'Sentimiento positivo', kind: 'rate', goodUp: true },
      { key: 'negative_rate', label: 'Sentimiento negativo', kind: 'rate', goodUp: false },
    ],
  },
]

function fmt(v: number | string | null | undefined, kind: Kind): string {
  if (v == null || typeof v === 'string') return '—'
  if (kind === 'rate') return pct(v)
  if (kind === 'seconds') return dur(v)
  return num(v)
}

/** Variación del periodo A respecto al B: tasas en puntos (pp), conteos en %. */
function DeltaChip({ value, goodUp, kind }: { value: number | null | undefined; goodUp: boolean | null; kind: Kind }) {
  if (value == null) return <span className="text-xs text-muted-foreground">—</span>
  const isRate = kind === 'rate'
  const up = value > 0
  const flat = Math.abs(value) < (isRate ? 0.0005 : 0.005)
  const good = flat || goodUp == null ? null : up === goodUp
  const text = `${up ? '+' : ''}${Math.round(value * 100)}${isRate ? ' pp' : '%'}`
  return (
    <span
      className={cn(
        'inline-flex items-center justify-end gap-1 text-xs font-medium tabular-nums',
        good == null ? 'text-muted-foreground' : good ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
      )}
    >
      {flat ? <Minus className="size-3" /> : up ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
      {text}
    </span>
  )
}

const todayCo = () => new Date(Date.now() - 5 * 3600000).toISOString().slice(0, 10)

interface Ranges {
  aFrom: string
  aTo: string
  bFrom: string
  bTo: string
}

function RangeInputs({
  label,
  from,
  to,
  onChange,
}: {
  label: string
  from: string
  to: string
  onChange: (from: string, to: string) => void
}) {
  const input =
    'w-[124px] bg-transparent text-sm text-foreground [color-scheme:light] dark:[color-scheme:dark]'
  // Sin min/max cruzados entre "desde" y "hasta": impedían mover un rango
  // (p. ej. B en septiembre no dejaba elegir un "desde" de octubre). Si el
  // rango queda al revés, se arrastra el otro extremo.
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-20 text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex h-8 items-center gap-1 rounded-md border px-2">
        <input
          type="date"
          value={from}
          max={todayCo()}
          onChange={(e) => {
            const f = e.target.value
            if (f) onChange(f, f > to ? f : to)
          }}
          className={input}
          title="Desde"
        />
        <span className="text-xs text-muted-foreground">→</span>
        <input
          type="date"
          value={to}
          max={todayCo()}
          onChange={(e) => {
            const t = e.target.value
            if (t) onChange(t < from ? t : from, t)
          }}
          className={input}
          title="Hasta"
        />
      </div>
    </div>
  )
}

/**
 * Comparación de dos tramos de fechas. Por defecto sigue el filtro de la
 * página (periodo A) contra el tramo anterior de igual duración (periodo B);
 * al tocar cualquiera de las fechas, los dos rangos pasan a ser libres.
 */
export function PeriodComparisonCard({ filters }: { filters: AwareFilters }) {
  const [sel, setSel] = useState<Ranges | null>(null)
  const query = useAwarePeriodComparison(
    sel ? { ...filters, from: sel.aFrom, to: sel.aTo, cmpFrom: sel.bFrom, cmpTo: sel.bTo } : filters,
  )
  const data = query.data
  const a = data?.current
  const b = data?.previous

  // Fechas a mostrar: las elegidas, o las que resolvió el backend.
  const shown: Ranges | null = sel ?? (a && b ? { aFrom: a.from, aTo: a.to, bFrom: b.from, bTo: b.to } : null)
  function update(patch: Partial<Ranges>) {
    if (!shown) return
    setSel({ ...shown, ...patch })
  }

  return (
    <Card>
      <CardHeader className="space-y-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ArrowLeftRight className="size-4" /> Comparar periodos
          {sel && (
            <Button variant="ghost" size="sm" className="ml-auto h-7 text-xs" onClick={() => setSel(null)}>
              <RotateCcw className="size-3.5" /> Restablecer
            </Button>
          )}
        </CardTitle>
        {shown && (
          <div className="space-y-2">
            <RangeInputs label="Periodo A" from={shown.aFrom} to={shown.aTo} onChange={(f, t) => update({ aFrom: f, aTo: t })} />
            <RangeInputs label="vs Periodo B" from={shown.bFrom} to={shown.bTo} onChange={(f, t) => update({ bFrom: f, bTo: t })} />
            {!sel && (
              <p className="text-[11px] text-muted-foreground">
                Periodo A sigue el filtro de la página; B es el tramo anterior de igual duración. Cambia cualquier fecha
                para comparar dos rangos libres.
              </p>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {!a || !b ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {query.isError ? 'No se pudo cargar la comparación.' : 'Cargando…'}
          </p>
        ) : (
          <div className={cn('transition-opacity', query.isFetching && 'opacity-60')}>
            <div className="grid grid-cols-[1fr_auto_auto_4.5rem] gap-x-3 pb-1 text-[11px] font-medium text-muted-foreground">
              <span />
              <span className="w-16 text-right">A</span>
              <span className="w-16 text-right">B</span>
              <span className="text-right">A vs B</span>
            </div>
            {GROUPS.map((g) => (
              <div key={g.title} className="mt-2">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{g.title}</p>
                {g.rows.map((r) => (
                  <div
                    key={r.key}
                    className="grid grid-cols-[1fr_auto_auto_4.5rem] items-center gap-x-3 border-t py-1.5 text-sm first:border-t-0"
                  >
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className="w-16 text-right font-medium tabular-nums">{fmt(a[r.key], r.kind)}</span>
                    <span className="w-16 text-right tabular-nums text-muted-foreground">{fmt(b[r.key], r.kind)}</span>
                    <DeltaChip value={data.deltas[r.key]} goodUp={r.goodUp} kind={r.kind} />
                  </div>
                ))}
              </div>
            ))}
            <p className="mt-3 text-[11px] text-muted-foreground">
              A: {a.days} día(s) · B: {b.days} día(s). Si los rangos tienen distinta duración, compara el promedio
              diario y las tasas, no los totales. Tasas en puntos (pp); conteos en %.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

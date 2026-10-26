import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AwareFunnel } from '@/lib/types'
import { num, pct } from '@/lib/analyticsFormat'

type Row = {
  key: string
  label: string
  count: number
  rate: number | null
  rateLabel: string
  barClass: string
  barOpacity?: number
}

export function FunnelCard({ data }: { data?: AwareFunnel }) {
  if (!data) return null
  const top = data.stages[0]?.count || 1
  const transferidas = data.stages.find((s) => s.key === 'transferidas')?.count ?? 0
  const share = (n: number) => (transferidas ? n / transferidas : null)

  const rows: Row[] = data.stages.map((s, i) => ({
    key: s.key,
    label: s.label,
    count: s.count,
    rate: s.of_prev,
    rateLabel: 'del paso anterior',
    barClass: 'bg-primary/80',
    barOpacity: 1 - i * 0.12,
  }))
  // Desglose de las transferidas que no están en "Atendidas".
  if (data.in_progress) {
    rows.push({
      key: 'en_curso',
      label: 'En curso',
      count: data.in_progress,
      rate: share(data.in_progress),
      rateLabel: 'de las transferidas',
      barClass: 'bg-amber-500/80',
    })
  }
  rows.push({
    key: 'sin_asesor',
    label: 'Sin asesor',
    count: data.not_attended,
    rate: share(data.not_attended),
    rateLabel: 'de las transferidas',
    barClass: 'bg-red-500/70',
  })
  if (data.attended_untyped) {
    rows.push({
      key: 'sin_tipificar',
      label: 'Atendidas sin tipificar',
      count: data.attended_untyped,
      rate: data.attended_untyped_rate ?? null,
      rateLabel: 'de las atendidas',
      barClass: 'bg-slate-400/70',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recorrido de la llamada</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.map((r) => (
          <div key={r.key}>
            <div className="mb-0.5 flex items-baseline justify-between text-sm">
              <span className="text-muted-foreground">{r.label}</span>
              <span className="tabular-nums font-medium">
                {num(r.count)}
                {r.rate != null && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    {pct(r.rate)} {r.rateLabel}
                  </span>
                )}
              </span>
            </div>
            <div className="h-6 overflow-hidden rounded bg-muted">
              <div
                className={`h-full rounded ${r.barClass}`}
                style={{ width: `${Math.max(r.count ? 4 : 0, (r.count / top) * 100)}%`, opacity: r.barOpacity ?? 1 }}
              />
            </div>
          </div>
        ))}
        <p className="pt-1 text-[11px] text-muted-foreground">
          Aproximado: la llamada del bot se cruza con la de la cola por teléfono y hora.
        </p>
      </CardContent>
    </Card>
  )
}

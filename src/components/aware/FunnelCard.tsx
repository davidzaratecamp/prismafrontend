import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AwareFunnel } from '@/lib/types'
import { num, pct } from '@/lib/analyticsFormat'

export function FunnelCard({ data }: { data?: AwareFunnel }) {
  if (!data) return null
  const top = data.stages[0]?.count || 1

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recorrido de la llamada</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {data.stages.map((s, i) => {
          const w = Math.max(4, (s.count / top) * 100)
          return (
            <div key={s.key}>
              <div className="mb-0.5 flex items-baseline justify-between text-sm">
                <span className="text-muted-foreground">{s.label}</span>
                <span className="tabular-nums font-medium">
                  {num(s.count)}
                  {s.of_prev != null && (
                    <span className="ml-2 text-xs text-muted-foreground">{pct(s.of_prev)} del paso anterior</span>
                  )}
                </span>
              </div>
              <div className="h-6 overflow-hidden rounded bg-muted">
                <div
                  className="h-full rounded bg-primary/80"
                  style={{ width: `${w}%`, opacity: 1 - i * 0.12 }}
                />
              </div>
            </div>
          )
        })}
        <p className="pt-1 text-[11px] text-muted-foreground">
          {num(data.not_attended)} transferencias sin asesor ({pct(data.not_attended_rate)}). "Atendidas"
          es aproximado (empatado por teléfono + fecha + hora).
        </p>
      </CardContent>
    </Card>
  )
}

import { CalendarClock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/common/EmptyState'
import type { RetellHeatCell } from '@/lib/types'

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

/** Cuándo entran las llamadas: 7 filas (día de semana) × 24 columnas (hora UTC). */
export function HourHeatmap({ data }: { data: RetellHeatCell[] }) {
  const total = data.reduce((s, c) => s + c.calls, 0)
  const grid = new Map<string, number>()
  let max = 0
  for (const c of data) {
    grid.set(`${c.weekday}-${c.hour}`, c.calls)
    if (c.calls > max) max = c.calls
  }

  const color = (n: number) => {
    if (!n) return 'var(--color-muted)'
    const t = Math.min(1, n / (max || 1))
    // interpola opacidad sobre el color primary
    return `color-mix(in oklab, var(--color-primary) ${Math.round(15 + t * 85)}%, transparent)`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Llamadas por hora y día (UTC)</CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <EmptyState icon={CalendarClock} title="Sin llamadas en el rango" />
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[560px]">
              <div className="grid grid-cols-[32px_repeat(24,1fr)] gap-0.5 text-[10px] text-muted-foreground">
                <div />
                {Array.from({ length: 24 }, (_, h) => (
                  <div key={h} className="text-center tabular-nums">
                    {h % 3 === 0 ? h : ''}
                  </div>
                ))}
                {DAYS.map((label, wd) => (
                  <FragmentRow key={wd} label={label}>
                    {Array.from({ length: 24 }, (_, h) => {
                      const n = grid.get(`${wd}-${h}`) ?? 0
                      return (
                        <div
                          key={h}
                          title={`${label} ${String(h).padStart(2, '0')}:00 · ${n} llamadas`}
                          className="aspect-square rounded-[3px]"
                          style={{ background: color(n) }}
                        />
                      )
                    })}
                  </FragmentRow>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Máx. {max.toLocaleString('es-CO')} llamadas en una celda · horas en UTC
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function FragmentRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <div className="flex items-center justify-end pr-1 tabular-nums">{label}</div>
      {children}
    </>
  )
}

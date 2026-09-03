import { useState } from 'react'
import { CalendarClock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/common/EmptyState'

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export interface HeatCell {
  hour: number
  weekday: number // 0 = lunes … 6 = domingo
  calls: number
}

interface Hover {
  weekday: number
  hour: number
  calls: number
}

/** Mapa de calor: 7 filas (día de semana) × 24 columnas (hora). */
export function HourHeatmap({
  data,
  title = 'Llamadas por hora y día',
  note = 'Hora de Colombia',
}: {
  data: HeatCell[]
  title?: string
  note?: string
}) {
  const [hover, setHover] = useState<Hover | null>(null)

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
    return `color-mix(in oklab, var(--color-primary) ${Math.round(15 + t * 85)}%, transparent)`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <CardTitle className="text-base">{title}</CardTitle>
          <span className="text-xs tabular-nums text-muted-foreground">
            {hover
              ? `${DAYS[hover.weekday]} ${String(hover.hour).padStart(2, '0')}:00 — ${hover.calls.toLocaleString('es-CO')} llamadas`
              : 'Pasa el cursor por una celda'}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <EmptyState icon={CalendarClock} title="Sin llamadas en el rango" />
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[560px]" onMouseLeave={() => setHover(null)}>
              <div className="grid grid-cols-[32px_repeat(24,1fr)] gap-0.5 text-[10px] text-muted-foreground">
                <div />
                {Array.from({ length: 24 }, (_, h) => (
                  <div key={h} className="text-center tabular-nums">
                    {h % 3 === 0 ? h : ''}
                  </div>
                ))}
                {DAYS.map((label, wd) => (
                  <Row key={wd} label={label}>
                    {Array.from({ length: 24 }, (_, h) => {
                      const n = grid.get(`${wd}-${h}`) ?? 0
                      const active = hover?.weekday === wd && hover?.hour === h
                      return (
                        <div
                          key={h}
                          onMouseEnter={() => setHover({ weekday: wd, hour: h, calls: n })}
                          title={`${label} ${String(h).padStart(2, '0')}:00 · ${n} llamadas`}
                          className="aspect-square rounded-[3px] ring-offset-1 ring-offset-background transition-[box-shadow]"
                          style={{
                            background: color(n),
                            boxShadow: active ? '0 0 0 2px var(--color-primary)' : undefined,
                          }}
                        />
                      )
                    })}
                  </Row>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                {note} · máx. {max.toLocaleString('es-CO')} llamadas en una celda
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <div className="flex items-center justify-end pr-1 tabular-nums">{label}</div>
      {children}
    </>
  )
}

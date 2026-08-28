import { Fragment, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  addMonths,
  differenceInCalendarDays,
  eachMonthOfInterval,
  endOfMonth,
  format,
  max as dateMax,
  min as dateMin,
  parseISO,
  startOfMonth,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { PROJECT_STATUS, progressTone } from '@/lib/status'
import { cn } from '@/lib/utils'
import type { RoadmapProject } from '@/lib/types'

const DAY_PX = 4 // ancho por día
const LABEL_W = 220

export function RoadmapGantt({ projects }: { projects: RoadmapProject[] }) {
  const dated = projects.filter((p) => p.start_date || p.due_date)

  const { start, end, months } = useMemo(() => {
    const today = new Date()
    const dates: Date[] = []
    for (const p of dated) {
      if (p.start_date) dates.push(parseISO(p.start_date))
      if (p.due_date) dates.push(parseISO(p.due_date))
      for (const m of p.milestones) dates.push(parseISO(m.date))
    }
    const s = startOfMonth(dates.length ? dateMin([...dates, today]) : today)
    const e = endOfMonth(dates.length ? dateMax([...dates, addMonths(today, 2)]) : addMonths(today, 3))
    return { start: s, end: e, months: eachMonthOfInterval({ start: s, end: e }) }
  }, [dated])

  const totalDays = differenceInCalendarDays(end, start) + 1
  const width = totalDays * DAY_PX
  const todayOffset = differenceInCalendarDays(new Date(), start) * DAY_PX

  const groups = useMemo(() => {
    const map = new Map<string, RoadmapProject[]>()
    for (const p of dated) {
      const key = p.area_name
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(p)
    }
    return [...map.entries()]
  }, [dated])

  if (dated.length === 0) {
    return (
      <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Ningún proyecto tiene fechas de inicio o entrega. Añádelas para verlas en el roadmap.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <div style={{ width: LABEL_W + width, minWidth: '100%' }}>
        {/* Cabecera de meses */}
        <div className="flex border-b bg-muted/40 text-xs font-medium">
          <div className="shrink-0 border-r p-2" style={{ width: LABEL_W }}>
            Proyecto
          </div>
          <div className="relative" style={{ width }}>
            <div className="flex">
              {months.map((m) => {
                const days = differenceInCalendarDays(endOfMonth(m), m) + 1
                return (
                  <div
                    key={m.toISOString()}
                    className="shrink-0 border-r p-2 capitalize text-muted-foreground"
                    style={{ width: days * DAY_PX }}
                  >
                    {format(m, 'MMM yyyy', { locale: es })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="relative">
          {/* Línea de hoy */}
          {todayOffset >= 0 && todayOffset <= width && (
            <div
              className="pointer-events-none absolute top-0 z-10 h-full w-px bg-red-500/70"
              style={{ left: LABEL_W + todayOffset }}
            >
              <span className="absolute -top-0 left-1 rounded bg-red-500 px-1 text-[10px] text-white">
                hoy
              </span>
            </div>
          )}

          {groups.map(([areaName, rows]) => (
            <Fragment key={areaName}>
              <div
                className="flex items-center gap-2 border-b bg-muted/20 px-3 py-1.5 text-xs font-semibold"
                style={{ background: `${rows[0].area_color}12` }}
              >
                <span className="size-2 rounded-full" style={{ background: rows[0].area_color }} />
                {areaName}
              </div>
              {rows.map((p) => {
                const s = p.start_date ? parseISO(p.start_date) : parseISO(p.due_date!)
                const e = p.due_date ? parseISO(p.due_date) : parseISO(p.start_date!)
                const left = Math.max(0, differenceInCalendarDays(s, start)) * DAY_PX
                const barDays = Math.max(1, differenceInCalendarDays(e, s) + 1)
                const barWidth = barDays * DAY_PX

                return (
                  <div key={p.id} className="flex border-b last:border-0 hover:bg-accent/30">
                    <div className="shrink-0 border-r p-2" style={{ width: LABEL_W }}>
                      <Link
                        to={`/projects/${p.id}`}
                        className="line-clamp-1 text-sm font-medium hover:text-primary"
                      >
                        {p.name}
                      </Link>
                      <p className="text-[11px] text-muted-foreground">
                        {PROJECT_STATUS[p.status].label} · {p.progress_cached}%
                      </p>
                    </div>
                    <div className="relative py-3" style={{ width }}>
                      <div
                        className="absolute top-1/2 h-5 -translate-y-1/2 rounded-md"
                        style={{
                          left,
                          width: barWidth,
                          background: `${p.area_color}30`,
                          border: `1px solid ${p.area_color}`,
                        }}
                      >
                        <div
                          className="h-full rounded-l-md"
                          style={{
                            width: `${p.progress_cached}%`,
                            background: progressTone(p.progress_cached),
                          }}
                        />
                      </div>
                      {p.milestones.map((m) => {
                        const off = differenceInCalendarDays(parseISO(m.date), start) * DAY_PX
                        if (off < 0 || off > width) return null
                        return (
                          <div
                            key={m.id}
                            title={`${m.title} — ${format(parseISO(m.date), 'd MMM', { locale: es })}`}
                            className={cn(
                              'absolute top-1/2 size-2.5 -translate-y-1/2 rotate-45 border',
                              m.done ? 'bg-emerald-500 border-emerald-600' : 'bg-background border-foreground',
                            )}
                            style={{ left: off - 5 }}
                          />
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

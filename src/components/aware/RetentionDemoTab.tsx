import { useEffect, useMemo, useRef, useState } from 'react'
import { CheckCircle2, Clock, Download, FlaskConical, Play, RotateCcw, ShieldCheck, Trash2, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { cn } from '@/lib/utils'
import { ESTADO_BADGE } from './labels'

/**
 * Pestaña de DEMOSTRACIÓN (datos ficticios) del proceso de retención de 24 h
 * que pidió Legal de Claro para el número real del cliente. Hoy Aware solo
 * entrega un consecutivo genérico; cuando Claro empiece a entregar el número
 * real, cada número debe eliminarse a las 24 h en todos los lugares donde
 * exista. No hay histórico con números reales, así que el borrado aplica solo
 * desde la activación en adelante.
 *
 * Todo vive en el navegador: no consulta ni modifica datos reales. El reloj
 * se puede acelerar (24 h = 2 min) para ver el borrado durante una reunión.
 */

const HOUR = 3600_000
const RETENTION_MS = 24 * HOUR
const JOB_EVERY_MS = 15 * 60_000 // el proceso de borrado corre cada 15 min
const ACCEL = (24 * HOUR) / (2 * 60_000) // 24 h simuladas en 2 min reales
const N_CALLS = 36

const UBICACIONES = [
  { id: 'aware', nombre: 'Aware — base de datos de llamadas', detalle: 'Registro de la llamada, central telefónica y gestión del asesor', responsable: 'Aware (proveedor)' },
  { id: 'espejo', nombre: 'Prisma — base de datos (copia de Aware)', detalle: 'Tablas aware_mirror_* en MySQL', responsable: 'Proceso automático Prisma' },
  { id: 'cache', nombre: 'Prisma — caché del servidor', detalle: 'Memoria temporal de consultas (vence en minutos)', responsable: 'Proceso automático Prisma' },
  { id: 'logs', nombre: 'Prisma — registros del servidor (logs)', detalle: 'El número nunca se escribe en logs; se verifica en cada ejecución', responsable: 'Proceso automático Prisma' },
  { id: 'respaldos', nombre: 'Copias de respaldo', detalle: 'Los respaldos excluyen el número real', responsable: 'Proceso automático Prisma' },
] as const

const CAMPANAS = ['Claro Hogar', 'Claro TyT'] as const
const ESTADOS = ['Transferido', 'Gestión IA', 'Transferido', 'Abandonado en cola', 'Gestión IA', 'Transferido'] as const
const TIPIF = ['Venta exitosa', 'No venta', 'Soporte / fallas', 'Facturación', 'Cliente cuelga IA', 'Volver a llamar']

interface DemoCall {
  id: string
  creado: number // ms (reloj simulado)
  numero: string | null // null = eliminado
  eliminado: number | null
  campana: string
  estado: string
  tipificacion: string
}

interface LogEntry {
  run: number
  ts: number
  ubicacion: string
  eliminados: number
  restantes: number
  responsable: string
}

function rnd(n: number) {
  return Math.floor(Math.random() * n)
}

/** Número ficticio, siempre enmascarado en pantalla (nunca se muestra completo). */
function fakeNumber() {
  return `3${rnd(3)}${rnd(10)}${String(rnd(10_000_000)).padStart(7, '0')}`
}
function mask(n: string) {
  return `${n.slice(0, 3)} *** **${n.slice(-2)}`
}

function makeCalls(now: number): DemoCall[] {
  return Array.from({ length: N_CALLS }, (_, i) => {
    // repartidas en las últimas ~23.5 h: algunas vencen enseguida
    const creado = now - Math.round(((i + 0.5) / N_CALLS) * 23.5 * HOUR) - rnd(10) * 60_000
    return {
      id: `DEMO-${String(1000 + i)}`,
      creado,
      numero: fakeNumber(),
      eliminado: null,
      campana: CAMPANAS[i % 2],
      estado: ESTADOS[i % ESTADOS.length],
      tipificacion: TIPIF[rnd(TIPIF.length)],
    }
  }).sort((a, b) => b.creado - a.creado)
}

function fmtDateTime(ms: number) {
  return new Date(ms).toLocaleString('es-CO', {
    timeZone: 'America/Bogota',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}
function fmtLeft(ms: number) {
  if (ms <= 0) return 'vencido'
  const h = Math.floor(ms / HOUR)
  const m = Math.floor((ms % HOUR) / 60_000)
  return h > 0 ? `${h} h ${String(m).padStart(2, '0')} min` : `${m} min`
}

function downloadCsv(log: LogEntry[]) {
  const head = ['ejecucion', 'fecha_hora', 'ubicacion', 'registros_eliminados', 'registros_restantes', 'responsable', 'resultado']
  const rows = log.map((l) =>
    [l.run, fmtDateTime(l.ts), l.ubicacion, l.eliminados, l.restantes, l.responsable, l.restantes === 0 ? 'OK' : 'REVISAR']
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(','),
  )
  const blob = new Blob([`﻿${[head.join(','), ...rows].join('\n')}`], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'demo_registro_borrado_24h.csv'
  a.click()
  URL.revokeObjectURL(a.href)
}

export function RetentionDemoTab() {
  const [accel, setAccel] = useState(true)
  const [simNow, setSimNow] = useState(() => Date.now())
  const [calls, setCalls] = useState<DemoCall[]>(() => makeCalls(Date.now()))
  const [log, setLog] = useState<LogEntry[]>([])
  const lastJob = useRef<number>(Date.now())
  const lastArrival = useRef<number>(Date.now())
  const runSeq = useRef(0)
  const idSeq = useRef(1000 + N_CALLS)

  // Reloj simulado: avanza 1x o acelerado.
  useEffect(() => {
    let last = Date.now()
    const t = setInterval(() => {
      const real = Date.now()
      const delta = (real - last) * (accel ? ACCEL : 1)
      last = real
      setSimNow((s) => s + delta)
    }, 250)
    return () => clearInterval(t)
  }, [accel])

  const callsRef = useRef(calls)
  callsRef.current = calls

  function runPurge(at: number) {
    runSeq.current += 1
    const run = runSeq.current
    let count = 0
    const next = callsRef.current.map((c) => {
      if (c.numero && at - c.creado >= RETENTION_MS) {
        count++
        return { ...c, numero: null, eliminado: at }
      }
      return c
    })
    callsRef.current = next
    setCalls(next)
    setLog((prev) =>
      [
        ...UBICACIONES.map((u) => ({
          run,
          ts: at,
          ubicacion: u.nombre,
          // logs y respaldos nunca contienen el número: se verifica, no hay qué borrar
          eliminados: u.id === 'logs' || u.id === 'respaldos' ? 0 : count,
          restantes: 0,
          responsable: u.responsable,
        })),
        ...prev,
      ].slice(0, 200),
    )
  }

  // Proceso de borrado programado cada 15 min (simulados).
  useEffect(() => {
    if (simNow - lastJob.current >= JOB_EVERY_MS) {
      lastJob.current = simNow
      runPurge(simNow)
    }
    // runPurge solo usa setters y refs
  }, [simNow])

  function reset() {
    const now = Date.now()
    setSimNow(now)
    lastJob.current = now
    lastArrival.current = now
    runSeq.current = 0
    idSeq.current = 1000 + N_CALLS
    setCalls(makeCalls(now))
    setLog([])
  }

  // Llegan llamadas nuevas mientras corre la demo (una cada ~40 min simulados).
  useEffect(() => {
    if (simNow - lastArrival.current < 40 * 60_000) return
    lastArrival.current = simNow
    setCalls((prev) =>
      [
        {
          id: `DEMO-${idSeq.current++}`,
          creado: simNow,
          numero: fakeNumber(),
          eliminado: null,
          campana: CAMPANAS[rnd(2)],
          estado: ESTADOS[rnd(ESTADOS.length)],
          tipificacion: TIPIF[rnd(TIPIF.length)],
        },
        ...prev,
      ].slice(0, 80),
    )
  }, [simNow])

  const vigentes = calls.filter((c) => c.numero).length
  const porVencer = calls.filter((c) => c.numero && RETENTION_MS - (simNow - c.creado) <= HOUR).length
  const eliminados = calls.filter((c) => !c.numero).length
  const lastRun = log[0]
  const nextRunIn = Math.max(0, JOB_EVERY_MS - (simNow - lastJob.current))

  const runs = useMemo(() => {
    const byRun = new Map<number, LogEntry[]>()
    for (const l of log) byRun.set(l.run, [...(byRun.get(l.run) || []), l])
    return [...byRun.entries()].slice(0, 8)
  }, [log])

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-start gap-3 border-amber-500/40 bg-amber-500/5 p-4 text-sm">
        <FlaskConical className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <div className="min-w-0 flex-1">
          <p className="font-medium">Demostración con datos ficticios</p>
          <p className="text-muted-foreground">
            Así funcionará la retención de 24 horas del número real del cliente cuando Claro lo entregue. Cada número se
            elimina a las 24 horas de la llamada en todos los lugares donde existe. Los registros anteriores a la activación no
            contienen números reales, por lo que el borrado aplica desde la activación en adelante.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={accel ? 'default' : 'outline'} onClick={() => setAccel((a) => !a)}>
            <Zap className="size-3.5" /> {accel ? 'Acelerado: 24 h = 2 min' : 'Tiempo real'}
          </Button>
          <Button size="sm" variant="outline" onClick={() => { lastJob.current = simNow; runPurge(simNow) }}>
            <Play className="size-3.5" /> Ejecutar borrado ahora
          </Button>
          <Button size="sm" variant="ghost" onClick={reset}>
            <RotateCcw className="size-3.5" /> Reiniciar
          </Button>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Números vigentes" value={vigentes} hint="con menos de 24 h" icon={Clock} />
        <KpiCard label="Vencen en menos de 1 h" value={porVencer} icon={Clock} tone={porVencer ? 'warning' : 'default'} />
        <KpiCard label="Números eliminados" value={eliminados} hint="en esta demostración" icon={Trash2} tone="success" />
        <KpiCard
          label="Último borrado"
          value={lastRun ? fmtDateTime(lastRun.ts).split(', ')[1] ?? '' : '—'}
          hint={`próximo en ${fmtLeft(nextRunIn)} · reloj ${fmtDateTime(simNow)}`}
          icon={ShieldCheck}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <Card className="p-4">
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="text-sm font-semibold">Consolidado (muestra)</h3>
            <span className="text-xs text-muted-foreground">el número se muestra enmascarado</span>
          </div>
          <div className="max-h-[520px] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card text-left text-xs text-muted-foreground">
                <tr>
                  <th className="py-2 pr-3 font-medium">ID llamada</th>
                  <th className="py-2 pr-3 font-medium">Fecha y hora</th>
                  <th className="py-2 pr-3 font-medium">Número real</th>
                  <th className="py-2 pr-3 font-medium">Campaña</th>
                  <th className="py-2 pr-3 font-medium">Estado</th>
                  <th className="py-2 pr-3 font-medium">Tipificación</th>
                  <th className="py-2 font-medium">Vigencia</th>
                </tr>
              </thead>
              <tbody>
                {calls.map((c) => {
                  const left = RETENTION_MS - (simNow - c.creado)
                  const pctLeft = Math.max(0, Math.min(1, left / RETENTION_MS))
                  return (
                    <tr key={c.id} className="border-t">
                      <td className="py-2 pr-3 font-mono text-xs">{c.id}</td>
                      <td className="py-2 pr-3 whitespace-nowrap text-xs">{fmtDateTime(c.creado)}</td>
                      <td className="py-2 pr-3 whitespace-nowrap font-mono text-xs">
                        {c.numero ? (
                          mask(c.numero)
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="size-3.5" /> Eliminado
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-3 whitespace-nowrap text-xs">{c.campana}</td>
                      <td className="py-2 pr-3">
                        <span className={cn('rounded px-1.5 py-0.5 text-xs', ESTADO_BADGE[c.estado])}>{c.estado}</span>
                      </td>
                      <td className="py-2 pr-3 whitespace-nowrap text-xs">{c.tipificacion}</td>
                      <td className="w-36 py-2">
                        {c.numero ? (
                          <div>
                            <div className="h-1.5 rounded bg-muted">
                              <div
                                className={cn('h-1.5 rounded', pctLeft < 1 / 24 ? 'bg-red-500' : pctLeft < 0.25 ? 'bg-amber-500' : 'bg-emerald-500')}
                                style={{ width: `${pctLeft * 100}%` }}
                              />
                            </div>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">se elimina en {fmtLeft(left)}</p>
                          </div>
                        ) : (
                          <p className="text-[11px] text-muted-foreground">{c.eliminado ? fmtDateTime(c.eliminado) : ''}</p>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="mb-2 text-sm font-semibold">Dónde se elimina</h3>
            <ul className="space-y-2.5">
              {UBICACIONES.map((u) => (
                <li key={u.id} className="flex gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="font-medium leading-tight">{u.nombre}</p>
                    <p className="text-xs text-muted-foreground">{u.detalle}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-3 border-t pt-2 text-xs text-muted-foreground">
              Las grabaciones se reproducen desde el servidor de Aware y se convierten al vuelo: Prisma no guarda archivos de audio
              ni temporales.
            </p>
          </Card>

          <Card className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Registro de borrado (evidencia)</h3>
              <Button size="sm" variant="outline" disabled={!log.length} onClick={() => downloadCsv(log)}>
                <Download className="size-3.5" /> CSV
              </Button>
            </div>
            {!runs.length ? (
              <p className="text-xs text-muted-foreground">Aún no se ha ejecutado el proceso. Corre cada 15 minutos.</p>
            ) : (
              <div className="max-h-[300px] space-y-3 overflow-auto">
                {runs.map(([run, entries]) => (
                  <div key={run} className="rounded-md border p-2.5">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="font-medium">Ejecución #{run}</span>
                      <span className="text-muted-foreground">{fmtDateTime(entries[0].ts)}</span>
                    </div>
                    <ul className="mt-1.5 space-y-0.5 text-[11px]">
                      {entries.map((e) => (
                        <li key={e.ubicacion} className="flex justify-between gap-2">
                          <span className="truncate text-muted-foreground">{e.ubicacion}</span>
                          <span className="shrink-0">
                            {e.eliminados} eliminados · <span className="text-emerald-700 dark:text-emerald-400">0 restantes</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

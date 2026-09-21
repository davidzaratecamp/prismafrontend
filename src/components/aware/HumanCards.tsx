import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CheckCircle2, PhoneOff, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/common/EmptyState'
import type {
  AwareAgentRow,
  AwareHumanFunnelDay,
  AwareHumanOutcomes,
  AwareQueueAbandon,
} from '@/lib/types'
import { num, pct } from '@/lib/analyticsFormat'
import { cn } from '@/lib/utils'

const axis = { fontSize: 11, fill: 'var(--color-muted-foreground)' }

export function BarRow({ label, calls, rate, color }: { label: string; calls: number; rate: number | null; color: string }) {
  const w = (rate ?? 0) * 100
  return (
    <li className="space-y-1">
      <div className="flex justify-between gap-2 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="shrink-0 tabular-nums">{num(calls)} · {pct(rate)}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full" style={{ width: `${w}%`, background: color }} />
      </div>
    </li>
  )
}

export function HumanOutcomesCard({ data }: { data?: AwareHumanOutcomes }) {
  if (!data) return null
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CheckCircle2 className="size-4" /> Resultado del asesor humano (tras la transferencia)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg border p-3">
            <p className="text-2xl font-semibold tabular-nums">{num(data.atendidas)}</p>
            <p className="text-xs text-muted-foreground">atendidas ({pct(data.atendidas_rate)} de {num(data.transfers)})</p>
          </div>
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
            <p className="text-2xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{num(data.util_positivo)}</p>
            <p className="text-xs text-muted-foreground">VENTA EXITOSA · conversión {pct(data.conversion_rate)}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-2xl font-semibold tabular-nums">{num(data.util_negativo)}</p>
            <p className="text-xs text-muted-foreground">NO VENTA</p>
          </div>
        </div>

        {data.venta_detalle.length > 0 && (
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Venta exitosa — árbol de Claro (% sobre el total de ventas, no sobre atendidas)
            </p>
            <ul className="space-y-1.5">
              {data.venta_detalle.map((d) => (
                <BarRow key={d.label} label={d.label} calls={d.calls} rate={d.rate} color="#10b981" />
              ))}
            </ul>
          </div>
        )}

        {data.no_venta_arbol.categorias.map((cat) => (
          <div key={cat.categoria}>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              No venta — {cat.categoria} (% sobre el total de no venta, no sobre atendidas)
            </p>
            <ul className="space-y-1.5">
              {cat.items.map((it) => (
                <BarRow key={it.tip} label={it.label} calls={it.calls} rate={it.rate} color="#f59e0b" />
              ))}
            </ul>
          </div>
        ))}

        {data.no_venta_arbol.sin_clasificar && (
          <p className="text-[11px] text-muted-foreground">
            {num(data.no_venta_arbol.sin_clasificar.calls)} no venta ({pct(data.no_venta_arbol.sin_clasificar.rate)}) sin
            motivo reconocido en el árbol de Claro — texto libre de Aware que no matchea ninguno de los 20 códigos, o
            llamadas sin motivo registrado.
          </p>
        )}

        {data.otros_resultados.length > 0 && (
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Otros resultados — fuera del árbol de Claro (no hubo contacto real: número equivocado, no contesta, etc.)
            </p>
            <ul className="space-y-1.5">
              {data.otros_resultados.map((t) => (
                <BarRow
                  key={t.cod}
                  label={t.nombre}
                  calls={t.calls}
                  rate={data.atendidas ? t.calls / data.atendidas : 0}
                  color="#94a3b8"
                />
              ))}
            </ul>
          </div>
        )}

        <p className="text-[11px] text-muted-foreground">
          {num(data.sin_atender)} transferencias no llegaron a un asesor. El emparejamiento bot→asesor es
          aproximado (teléfono + fecha + hora).
        </p>
      </CardContent>
    </Card>
  )
}

export function ConversionTrendCard({ data }: { data: AwareHumanFunnelDay[] }) {
  const rows = data.map((d) => ({ day: d.day, conv: d.conversion_rate == null ? null : Math.round(d.conversion_rate * 100) }))
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Conversión a venta exitosa por día (%)</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="Sin transferencias en el rango" />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={rows} margin={{ left: 4, right: 12, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={axis} tickFormatter={(d: string) => d.slice(5)} minTickGap={24} />
              <YAxis tickLine={false} axisLine={false} width={34} tick={axis} />
              <Tooltip
                contentStyle={{ background: 'var(--color-popover)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
                formatter={((v: number) => [`${v}%`, 'Conversión']) as never}
              />
              <Line type="monotone" dataKey="conv" stroke="#10b981" strokeWidth={2} dot={false} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

export function AgentRankingTable({
  rows,
  nameById = {},
}: {
  rows: AwareAgentRow[]
  nameById?: Record<string, string>
}) {
  const sorted = [...rows].sort((a, b) => (b.up_rate ?? 0) - (a.up_rate ?? 0))
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="size-4" /> Asesores — resultado de negocio (tipificación)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {sorted.length === 0 ? (
          <div className="p-6"><EmptyState icon={Users} title="Sin llamadas de asesor en el rango" /></div>
        ) : (
          <div className="max-h-[480px] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/95">
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Asesor</th>
                  <th className="px-4 py-2.5 text-right font-medium">Llamadas</th>
                  <th className="px-4 py-2.5 text-right font-medium">VENTAS</th>
                  <th className="px-4 py-2.5 text-right font-medium">% venta</th>
                  <th className="px-4 py-2.5 text-right font-medium">% efectivo</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((a) => (
                  <tr key={a.agente_id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-2">
                      {nameById[a.agente_id] ?? <span className="font-mono text-xs text-muted-foreground">{a.agente_id}</span>}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">{a.calls}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{a.up}</td>
                    <td className={cn('px-4 py-2 text-right tabular-nums font-medium', (a.up_rate ?? 0) >= 0.12 && 'text-emerald-600 dark:text-emerald-400')}>
                      {pct(a.up_rate)}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">{pct(a.efectivo_rate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function QueueAbandonCard({ data }: { data?: AwareQueueAbandon }) {
  if (!data) return null
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <PhoneOff className="size-4" /> Abandono en cola de asesor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg border p-3">
            <p className="text-2xl font-semibold tabular-nums">{num(data.total)}</p>
            <p className="text-xs text-muted-foreground">abandonos</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-2xl font-semibold tabular-nums">{data.avg_espera_s}s</p>
            <p className="text-xs text-muted-foreground">espera media</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-2xl font-semibold tabular-nums">{Math.round(data.max_espera_s / 60)}m</p>
            <p className="text-xs text-muted-foreground">espera máxima</p>
          </div>
        </div>
        {data.by_day.length > 0 && (
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={data.by_day} margin={{ left: 4, right: 8, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={axis} tickFormatter={(d: string) => d.slice(5)} minTickGap={20} />
              <YAxis tickLine={false} axisLine={false} width={30} tick={axis} />
              <Tooltip contentStyle={{ background: 'var(--color-popover)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="abandonos" stroke="#ef4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
        <p className="text-[11px] text-muted-foreground">
          {data.match_rate != null && `${pct(data.match_rate)} atribuido a esta campaña · `}
          {data.note}
        </p>
      </CardContent>
    </Card>
  )
}

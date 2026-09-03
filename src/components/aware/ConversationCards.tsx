import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { MessagesSquare } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/common/EmptyState'
import type { AwareDurationByOutcome, AwareTurnBuckets, AwareTurnsByOutcome } from '@/lib/types'
import { dur } from '@/lib/analyticsFormat'
import { hangupLabel } from './labels'

const axis = { fontSize: 11, fill: 'var(--color-muted-foreground)' }

export function TurnBucketsCard({
  data,
  byOutcome,
}: {
  data?: AwareTurnBuckets
  byOutcome: AwareTurnsByOutcome[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessagesSquare className="size-4" /> Turnos de conversación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!data || data.buckets.every((b) => b.calls === 0) ? (
          <EmptyState icon={MessagesSquare} title="Sin transcripciones en el rango" />
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Promedio <span className="font-medium text-foreground">{data.avg_turns}</span> turnos ·
              mediana {data.p50_turns}
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data.buckets} margin={{ left: 4, right: 8, top: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="bucket" tickLine={false} axisLine={false} tick={axis} />
                <YAxis tickLine={false} axisLine={false} width={40} tick={axis} />
                <Tooltip
                  cursor={{ fill: 'var(--color-muted)' }}
                  contentStyle={{ background: 'var(--color-popover)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="calls" fill="var(--color-primary)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="border-t pt-2">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Turnos promedio según cómo terminó
              </p>
              <div className="space-y-1 text-sm">
                {byOutcome.map((o) => (
                  <div key={o.reason} className="flex justify-between">
                    <span className="text-muted-foreground">{hangupLabel(o.reason)}</span>
                    <span className="tabular-nums">{o.avg_turns} turnos · {o.calls.toLocaleString('es-CO')}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export function DurationByOutcomeCard({ rows }: { rows: AwareDurationByOutcome[] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base">Duración según cómo terminó la llamada</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {rows.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={MessagesSquare} title="Sin datos" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Cierre</th>
                  <th className="px-4 py-2.5 text-right font-medium">Llamadas</th>
                  <th className="px-4 py-2.5 text-right font-medium">Media</th>
                  <th className="px-4 py-2.5 text-right font-medium">P50</th>
                  <th className="px-4 py-2.5 text-right font-medium">P90</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.reason} className="border-b last:border-0">
                    <td className="px-4 py-2">{hangupLabel(r.reason)}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{r.calls.toLocaleString('es-CO')}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{dur(r.avg_seconds)}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{dur(r.p50_seconds)}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{dur(r.p90_seconds)}</td>
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

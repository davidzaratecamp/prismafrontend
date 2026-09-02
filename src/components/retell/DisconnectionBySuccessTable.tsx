import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/common/EmptyState'
import { Unplug } from 'lucide-react'
import type { RetellDisconnectionBySuccess } from '@/lib/types'
import { dur, num, pct } from './format'

export function DisconnectionBySuccessTable({ rows }: { rows: RetellDisconnectionBySuccess[] }) {
  const top = rows.slice(0, 12)

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base">Motivo de desconexión × resultado</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {top.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={Unplug} title="Sin datos de desconexión en el rango" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Motivo</th>
                  <th className="px-4 py-2.5 text-right font-medium">Total</th>
                  <th className="px-4 py-2.5 text-right font-medium">Éxito</th>
                  <th className="px-4 py-2.5 text-right font-medium">Fallo</th>
                  <th className="px-4 py-2.5 text-right font-medium">% éxito</th>
                  <th className="px-4 py-2.5 text-right font-medium">Dur. media</th>
                </tr>
              </thead>
              <tbody>
                {top.map((r) => (
                  <tr key={r.reason} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-2 font-mono text-xs">{r.reason}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{num(r.total)}</td>
                    <td className="px-4 py-2 text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                      {num(r.successful)}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums text-red-600 dark:text-red-400">
                      {num(r.failed)}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">{pct(r.success_rate)}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{dur(r.avg_duration_seconds)}</td>
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

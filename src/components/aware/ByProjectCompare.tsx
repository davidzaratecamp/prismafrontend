import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/common/EmptyState'
import { Building2 } from 'lucide-react'
import type { AwareByProject } from '@/lib/types'
import { dur, num, pct } from '@/lib/analyticsFormat'

const ROWS: { label: string; get: (p: AwareByProject) => string }[] = [
  { label: 'Llamadas', get: (p) => num(p.calls) },
  { label: 'Tasa de transferencia', get: (p) => pct(p.transfer_rate) },
  { label: 'Colgó el cliente', get: (p) => pct(p.user_hangup_rate) },
  { label: 'Colgó el bot', get: (p) => pct(p.agent_hangup_rate) },
  { label: 'Inactividad', get: (p) => pct(p.inactivity_rate) },
  { label: 'Duración media', get: (p) => dur(p.avg_duration_seconds) },
  { label: 'Éxito del bot', get: (p) => pct(p.success_rate) },
  { label: 'Sentimiento positivo', get: (p) => pct(p.positive_rate) },
]

export function ByProjectCompare({ rows }: { rows: AwareByProject[] }) {
  if (rows.length === 0) {
    return (
      <Card className="p-6">
        <EmptyState icon={Building2} title="Sin datos por campaña en el rango" />
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base">Claro Hogar vs. Claro TyT</CardTitle>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Métrica</th>
              {rows.map((p) => (
                <th key={p.proyecto_id} className="px-4 py-2.5 text-right font-medium">
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((m) => (
              <tr key={m.label} className="border-b last:border-0">
                <td className="px-4 py-2 text-muted-foreground">{m.label}</td>
                {rows.map((p) => (
                  <td key={p.proyecto_id} className="px-4 py-2 text-right tabular-nums">
                    {m.get(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

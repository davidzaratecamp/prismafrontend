import { PhoneForwarded } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AwareTransfersAttended } from '@/lib/types'
import { num, pct } from '@/lib/analyticsFormat'
import { cn } from '@/lib/utils'

function Bar({ attended, total }: { attended: number; total: number }) {
  const w = total ? (attended / total) * 100 : 0
  return (
    <div className="mt-1 h-2 overflow-hidden rounded-full bg-red-500/20">
      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${w}%` }} />
    </div>
  )
}

export function TransfersAttendedCard({ data }: { data?: AwareTransfersAttended }) {
  if (!data) return null
  const t = data.total

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <PhoneForwarded className="size-4" /> Transferencias atendidas por un asesor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-semibold tabular-nums">{pct(t.attended_rate)}</span>
            <span className="text-sm text-muted-foreground">
              {num(t.attended)} de {num(t.transfers)} transferencias
            </span>
          </div>
          <Bar attended={t.attended} total={t.transfers} />
          <p className="mt-1 text-[11px] text-muted-foreground">
            {num(t.not_attended)} transferencias sin match de asesor humano (colgó en cola, no
            contestó, o no se pudo emparejar).
          </p>
        </div>

        <div className="space-y-2">
          {data.by_project.map((p) => (
            <div key={p.proyecto_id} className="rounded-lg border p-2.5">
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium">{p.name}</span>
                <span className="tabular-nums">
                  {pct(p.attended_rate)} · {num(p.attended)}/{num(p.transfers)}
                </span>
              </div>
              <Bar attended={p.attended} total={p.transfers} />
            </div>
          ))}
        </div>

        <p className={cn('text-[11px] text-muted-foreground', data.approximate && 'italic')}>
          Aproximado: se empareja la llamada del bot con la del asesor por teléfono + fecha + hora
          posterior (no hay un identificador compartido).
        </p>
      </CardContent>
    </Card>
  )
}

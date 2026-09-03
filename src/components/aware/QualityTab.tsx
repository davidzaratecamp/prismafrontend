import { AlertTriangle, Bot, ClipboardCheck, Clock, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { EmptyState } from '@/components/common/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { useAwareVoxproQuality } from '@/hooks/aware'
import { num, pct } from '@/lib/analyticsFormat'
import { cn } from '@/lib/utils'

function DistBar({ low, mid, high }: { low: number; mid: number; high: number }) {
  const t = low + mid + high || 1
  return (
    <div className="flex h-2 overflow-hidden rounded-full">
      <div style={{ width: `${(low / t) * 100}%` }} className="bg-red-500" />
      <div style={{ width: `${(mid / t) * 100}%` }} className="bg-amber-500" />
      <div style={{ width: `${(high / t) * 100}%` }} className="bg-emerald-500" />
    </div>
  )
}

export function QualityTab() {
  const { data, isLoading } = useAwareVoxproQuality()

  if (isLoading) return <Skeleton className="h-96 rounded-xl" />

  if (!data || !data.available) {
    return (
      <EmptyState
        icon={ClipboardCheck}
        title="Aún no hay datos de calidad IA"
        description="VoxPro envía este snapshot cada 20 minutos. Si no aparece, revisa que VoxPro esté publicando (PRISMA_SNAPSHOT_URL / token)."
      />
    )
  }

  const bot = data.bot?.by_proyecto ?? []
  const h = data.human
  const stale = (data.age_minutes ?? 0) > 90

  return (
    <div className="space-y-6">
      <p className={cn('flex items-center gap-1.5 text-xs', stale ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground')}>
        <Clock className="size-3.5" />
        Snapshot de VoxPro · actualizado hace {data.age_minutes ?? '—'} min
        {stale && ' · desactualizado, revisar el job de VoxPro'}
        {data.range_days ? ` · ventana ${data.range_days} días` : ''}
      </p>

      {/* Score del bot */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="size-4" /> Score del bot (cumplimiento de guion, 0–100)
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {bot.map((p) => (
            <div key={p.proyecto_id} className="rounded-lg border p-4">
              <div className="flex items-baseline justify-between">
                <span className="font-medium">{p.proyecto_name}</span>
                <span className="text-2xl font-semibold tabular-nums">{p.avg_score ?? '—'}</span>
              </div>
              <DistBar low={p.low} mid={p.mid} high={p.high} />
              <p className="mt-1 text-[11px] text-muted-foreground">
                {num(p.audited)} auditadas · {num(p.high)} altas / {num(p.mid)} medias / {num(p.low)} bajas
              </p>
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                {num(p.missed_transfer)} oportunidades perdidas (cliente quiso asesor y no lo transfirió)
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Score del asesor humano */}
      {h && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Transferencias sin atender" value={pct(h.not_found_rate)} hint={`${num(h.not_found)} de ${num(h.total)}`} icon={AlertTriangle} tone="warning" />
          <KpiCard label="Score medio del asesor" value={String(h.avg_score ?? '—')} hint={`${num(h.scored)} llamadas auditadas`} icon={ClipboardCheck} />
          <KpiCard label="Falla de alto impacto" value={pct(h.high_impact_failed_rate)} hint={`${num(h.high_impact_failed)} llamadas → score 0`} icon={AlertTriangle} tone="danger" />
          <KpiCard label="Distribución" value={`${num(h.distribution.high)} / ${num(h.distribution.mid)} / ${num(h.distribution.low)}`} hint="altas / medias / bajas" icon={ClipboardCheck} />
        </div>
      )}

      {/* Ranking de asesores con nombre */}
      {data.agents && data.agents.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="size-4" /> Asesores auditados (matriz de calidad de Claro)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[440px] overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted/95">
                  <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-2.5 font-medium">Asesor</th>
                    <th className="px-4 py-2.5 text-right font-medium">Auditadas</th>
                    <th className="px-4 py-2.5 text-right font-medium">Score medio</th>
                    <th className="px-4 py-2.5 text-right font-medium">Fallas alto impacto</th>
                  </tr>
                </thead>
                <tbody>
                  {[...data.agents]
                    .sort((a, b) => (b.avg_score ?? 0) - (a.avg_score ?? 0))
                    .map((a) => (
                      <tr key={a.agente_id ?? a.agente_nombre} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-2">{a.agente_nombre || a.agente_id}</td>
                        <td className="px-4 py-2 text-right tabular-nums">{a.audited}</td>
                        <td className={cn('px-4 py-2 text-right tabular-nums font-medium', (a.avg_score ?? 0) >= 60 && 'text-emerald-600 dark:text-emerald-400', (a.avg_score ?? 0) < 30 && 'text-red-600 dark:text-red-400')}>
                          {a.avg_score ?? '—'}
                        </td>
                        <td className="px-4 py-2 text-right tabular-nums">{a.high_impact_failed}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Motivos de oportunidad perdida */}
      {data.missed_transfer_reasons && data.missed_transfer_reasons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ejemplos de oportunidad perdida</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {data.missed_transfer_reasons.slice(0, 8).map((r, i) => (
                <li key={i} className="rounded-lg border p-2.5 text-muted-foreground">{r}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <p className="text-[11px] text-muted-foreground">
        El score del asesor sale a 0 si falla cualquier ítem de "alto impacto" (maltrato, cuelgue, fraude,
        habeas data, etc.), por eso el promedio es bajo — no es un promedio de calidad general.
      </p>
    </div>
  )
}

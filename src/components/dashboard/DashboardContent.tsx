import { Activity, CheckCircle2, FolderKanban, Ban, TrendingUp } from 'lucide-react'
import type { DashboardData } from '@/lib/types'
import { KpiCard } from './KpiCard'
import { AreaProgressChart } from './AreaProgressChart'
import { WorkloadChart } from './WorkloadChart'
import { AtRiskList } from './AtRiskList'
import { ActivityFeed } from './ActivityFeed'
import { Skeleton } from '@/components/ui/skeleton'

export function DashboardContent({
  data,
  isLoading,
  areaId,
  showAreaChart = true,
}: {
  data?: DashboardData
  isLoading: boolean
  areaId?: number
  showAreaChart?: boolean
}) {
  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    )
  }

  const k = data.kpis

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Proyectos activos"
          value={k.active}
          hint={`${k.total} en total`}
          icon={FolderKanban}
        />
        <KpiCard
          label="Avance promedio"
          value={`${k.avg_progress}%`}
          hint="de los proyectos no archivados"
          icon={TrendingUp}
          tone="success"
        />
        <KpiCard
          label="Bloqueados"
          value={k.blocked}
          hint={k.due_soon ? `${k.due_soon} con entrega ≤ 14 días` : 'sin bloqueos'}
          icon={Ban}
          tone={k.blocked > 0 ? 'danger' : 'default'}
        />
        <KpiCard
          label="Entregados este mes"
          value={k.delivered_this_month}
          hint={`${k.completed} completados histórico`}
          icon={CheckCircle2}
          tone="success"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {showAreaChart && <AreaProgressChart data={data.by_area} />}
        <div className={showAreaChart ? '' : 'lg:col-span-2'}>
          <WorkloadChart data={data.workload} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AtRiskList items={data.at_risk} />
        <ActivityFeed areaId={areaId} />
      </div>

      {!showAreaChart && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Activity className="size-3.5" /> Indicadores y actividad filtrados para esta área.
        </p>
      )}
    </div>
  )
}

import type { ComponentType } from 'react'
import { CalendarClock, CheckCircle2, FolderKanban, TriangleAlert } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Kpi {
  label: string
  value: string | number
  hint?: string
  icon: ComponentType<{ className?: string }>
  tone: 'default' | 'success' | 'danger'
}

function Tile({ label, value, hint, icon: Icon, tone }: Kpi) {
  const toneClass = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    danger: 'bg-red-500/10 text-red-600 dark:text-red-400',
  }[tone]
  return (
    <Card className="p-5">
      <div className={cn('mb-3 flex size-10 items-center justify-center rounded-lg', toneClass)}>
        <Icon className="size-5" />
      </div>
      <p className="text-3xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-sm font-medium">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  )
}

export function PortalKpis({
  inProgress,
  deliveredThisYear,
  needsAttention,
  upcoming,
}: {
  inProgress: number
  deliveredThisYear: number
  needsAttention: number
  upcoming: number
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Tile
        label="Proyectos en curso"
        value={inProgress}
        icon={FolderKanban}
        tone="default"
      />
      <Tile
        label="Entregados este año"
        value={deliveredThisYear}
        icon={CheckCircle2}
        tone="success"
      />
      <Tile
        label="En riesgo o con retraso"
        value={needsAttention}
        hint={needsAttention === 0 ? 'todo bajo control' : 'requiere seguimiento'}
        icon={TriangleAlert}
        tone={needsAttention > 0 ? 'danger' : 'default'}
      />
      <Tile
        label="Próximas entregas"
        value={upcoming}
        hint="en los próximos 30 días"
        icon={CalendarClock}
        tone="default"
      />
    </div>
  )
}

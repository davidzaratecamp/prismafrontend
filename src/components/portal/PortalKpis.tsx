import type { ComponentType } from 'react'
import { CalendarClock, FolderKanban, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface Kpi {
  label: string
  value: string | number
  hint?: string
  icon: ComponentType<{ className?: string }>
}

function Cell({ label, value, hint, icon: Icon }: Kpi) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-semibold leading-none tabular-nums">{value}</p>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {label}
          {hint ? ` · ${hint}` : ''}
        </p>
      </div>
    </div>
  )
}

export function PortalKpis({
  inProgress,
  avgProgress,
  upcoming,
}: {
  inProgress: number
  avgProgress: number
  upcoming: number
}) {
  return (
    <Card className="grid divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      <Cell label="Proyectos en curso" value={inProgress} icon={FolderKanban} />
      <Cell label="Avance promedio" value={`${avgProgress}%`} icon={TrendingUp} />
      <Cell label="Próximas entregas" value={upcoming} hint="30 días" icon={CalendarClock} />
    </Card>
  )
}

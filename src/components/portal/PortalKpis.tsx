import type { ComponentType } from 'react'
import { CalendarClock, FolderKanban, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface Kpi {
  label: string
  value: string | number
  hint?: string
  icon: ComponentType<{ className?: string }>
}

function Tile({ label, value, hint, icon: Icon }: Kpi) {
  return (
    <Card className="p-6">
      <div className="mb-3 flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <p className="text-4xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-sm font-medium">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </Card>
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
    <div className="grid gap-4 sm:grid-cols-3">
      <Tile label="Proyectos en curso" value={inProgress} icon={FolderKanban} />
      <Tile label="Avance promedio" value={`${avgProgress}%`} icon={TrendingUp} />
      <Tile
        label="Próximas entregas"
        value={upcoming}
        hint="en los próximos 30 días"
        icon={CalendarClock}
      />
    </div>
  )
}

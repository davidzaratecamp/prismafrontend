import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { ProgressRing } from '@/components/common/ProgressRing'
import { EmptyState } from '@/components/common/EmptyState'
import type { Area, Project } from '@/lib/types'

export function AreaStatusGrid({
  areas,
  projects,
}: {
  areas: Area[]
  projects: Project[]
}) {
  const withProjects = areas
    .map((a) => {
      const list = projects.filter((p) =>
        (p.areas.length ? p.areas : p.area ? [p.area] : []).some((x) => x.id === a.id),
      )
      return { area: a, list }
    })
    .filter((x) => x.list.length > 0)
    .sort((a, b) => b.list.length - a.list.length)

  if (withProjects.length === 0) {
    return <EmptyState title="Aún no hay proyectos registrados" />
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {withProjects.map(({ area, list }) => {
        const active = list.filter(
          (p) => p.status !== 'completed' && p.status !== 'paused',
        ).length
        const avg = Math.round(
          list.reduce((s, p) => s + p.progress_cached, 0) / list.length,
        )
        return (
          <Link key={area.id} to={`/areas/${area.slug}`}>
            <Card className="h-full p-5 transition-all hover:border-primary/40 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ background: area.color }} />
                    <span className="truncate font-semibold">{area.name}</span>
                  </span>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {active} en curso · {list.length} en total
                  </p>
                </div>
                <ProgressRing value={avg} size={52} />
              </div>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}

import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { differenceInCalendarDays, parseISO } from 'date-fns'
import { useAreas, useProjects } from '@/hooks/queries'
import { PortalKpis } from '@/components/portal/PortalKpis'
import { PortalProjectCard } from '@/components/portal/PortalProjectCard'
import { AttentionList } from '@/components/portal/AttentionList'
import { UpcomingDeliveries } from '@/components/portal/UpcomingDeliveries'
import { PortalActivity } from '@/components/portal/PortalActivity'
import { EmptyState } from '@/components/common/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { healthCounts } from '@/lib/health'

export default function PortalAreaPage() {
  const { slug } = useParams()
  const { data: areas } = useAreas()
  const area = useMemo(() => areas?.find((a) => a.slug === slug), [areas, slug])
  const { data: projects, isLoading } = useProjects(area ? { area_id: area.id } : {})

  if (isLoading || !projects || !area) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  const inProgress = projects.filter(
    (p) => p.status !== 'completed' && p.status !== 'paused',
  ).length
  const upcoming = projects.filter((p) => {
    if (!p.due_date || p.status === 'completed' || p.status === 'paused') return false
    const d = differenceInCalendarDays(parseISO(p.due_date), new Date())
    return d >= 0 && d <= 30
  }).length

  return (
    <div className="space-y-8">
      <div>
        <Button variant="ghost" size="sm" className="-ml-2 mb-2" asChild>
          <Link to="/">
            <ArrowLeft className="size-4" /> Inicio
          </Link>
        </Button>
        <h1 className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight">
          <span className="size-3 rounded-full" style={{ background: area.color }} />
          {area.name}
        </h1>
        {area.description && <p className="mt-1 text-muted-foreground">{area.description}</p>}
      </div>

      <PortalKpis
        inProgress={inProgress}
        needsAttention={healthCounts(projects).needsAttention}
        upcoming={upcoming}
      />

      <section>
        <h2 className="mb-3 text-lg font-semibold">Proyectos del área ({projects.length})</h2>
        {projects.length === 0 ? (
          <EmptyState title="Esta área todavía no tiene proyectos" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((p) => (
              <PortalProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <AttentionList projects={projects} />
        <UpcomingDeliveries projects={projects} />
      </div>

      <PortalActivity areaId={area.id} />
    </div>
  )
}

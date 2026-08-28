import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/common/PageHeader'
import { DashboardContent } from '@/components/dashboard/DashboardContent'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { useAreas, useDashboard, useProjects } from '@/hooks/queries'
import { Skeleton } from '@/components/ui/skeleton'

export default function AreaDashboardPage() {
  const { slug } = useParams()
  const { data: areas } = useAreas()
  const area = useMemo(() => areas?.find((a) => a.slug === slug), [areas, slug])

  const { data: dash, isLoading: dashLoading } = useDashboard(area?.id)
  const { data: projects, isLoading: projLoading } = useProjects(
    area ? { area_id: area.id } : {},
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <span className="flex items-center gap-2.5">
            {area && <span className="size-3 rounded-full" style={{ background: area.color }} />}
            {area?.name ?? 'Área'}
          </span>
        }
        description={area?.description || 'Proyectos y avance del área.'}
        actions={
          <Button asChild variant="outline">
            <Link to={`/projects?area=${area?.id ?? ''}`}>Ver en lista</Link>
          </Button>
        }
      />

      <DashboardContent data={dash} isLoading={dashLoading} areaId={area?.id} showAreaChart={false} />

      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          Proyectos del área {projects ? `(${projects.length})` : ''}
        </h2>
        {projLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-52 rounded-xl" />
            ))}
          </div>
        ) : !projects || projects.length === 0 ? (
          <EmptyState title="Esta área no tiene proyectos" description="Crea uno desde la sección Proyectos." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { differenceInCalendarDays, parseISO } from 'date-fns'
import { useAreas, useProjects } from '@/hooks/queries'
import { useAuthStore } from '@/stores/auth'
import { PortalKpis } from '@/components/portal/PortalKpis'
import { AreaStatusGrid } from '@/components/portal/AreaStatusGrid'
import { AttentionList } from '@/components/portal/AttentionList'
import { UpcomingDeliveries } from '@/components/portal/UpcomingDeliveries'
import { PortalActivity } from '@/components/portal/PortalActivity'
import { Skeleton } from '@/components/ui/skeleton'
import { healthCounts } from '@/lib/health'

export default function PortalOverviewPage() {
  const user = useAuthStore((s) => s.user)
  const { data: areas } = useAreas()
  const { data: projects, isLoading } = useProjects()

  if (isLoading || !projects || !areas) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  const inProgress = projects.filter(
    (p) => p.status !== 'completed' && p.status !== 'paused',
  ).length
  const year = new Date().getFullYear()
  const deliveredThisYear = projects.filter(
    (p) => p.status === 'completed' && p.completed_at && parseISO(p.completed_at).getFullYear() === year,
  ).length
  const needsAttention = healthCounts(projects).needsAttention
  const upcoming = projects.filter((p) => {
    if (!p.due_date || p.status === 'completed' || p.status === 'paused') return false
    const d = differenceInCalendarDays(parseISO(p.due_date), new Date())
    return d >= 0 && d <= 30
  }).length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Hola{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Estado de los desarrollos de Asiste Ing · {format(new Date(), "d 'de' MMMM yyyy", { locale: es })}
        </p>
      </div>

      <PortalKpis
        inProgress={inProgress}
        deliveredThisYear={deliveredThisYear}
        needsAttention={needsAttention}
        upcoming={upcoming}
      />

      <section>
        <h2 className="mb-3 text-lg font-semibold">Estado por área</h2>
        <AreaStatusGrid areas={areas} projects={projects} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <AttentionList projects={projects} />
        <UpcomingDeliveries projects={projects} />
      </div>

      <PortalActivity />
    </div>
  )
}

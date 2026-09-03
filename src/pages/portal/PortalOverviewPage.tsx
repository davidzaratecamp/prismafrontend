import { format, differenceInCalendarDays, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { Link } from 'react-router-dom'
import { ClipboardList, Star } from 'lucide-react'
import { useAreas, useProjects } from '@/hooks/queries'
import { useAuthStore } from '@/stores/auth'
import { PortalKpis } from '@/components/portal/PortalKpis'
import { PortalProjectCard } from '@/components/portal/PortalProjectCard'
import { AreaStatusGrid } from '@/components/portal/AreaStatusGrid'
import { UpcomingDeliveries } from '@/components/portal/UpcomingDeliveries'
import { PortalActivity } from '@/components/portal/PortalActivity'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { countdownTo } from '@/lib/time'
import type { Project } from '@/lib/types'

function avgOf(projects: Project[]) {
  if (!projects.length) return 0
  return Math.round(projects.reduce((s, p) => s + p.progress_cached, 0) / projects.length)
}

function headline(projects: Project[]): string {
  const active = projects.filter((p) => p.status !== 'completed' && p.status !== 'paused')
  const next = active
    .filter((p) => p.due_date)
    .sort((a, b) => (a.due_date || '').localeCompare(b.due_date || ''))
    .find((p) => !countdownTo(p.due_date!).overdue)

  let s = `${active.length} proyecto${active.length === 1 ? '' : 's'} en curso con ${avgOf(active)}% de avance promedio.`
  if (next) s += ` Próxima entrega: ${next.name} (${countdownTo(next.due_date!).label}).`
  return s
}

export default function PortalOverviewPage() {
  const user = useAuthStore((s) => s.user)
  const { data: areas } = useAreas()
  const { data: projects, isLoading } = useProjects()

  if (isLoading || !projects || !areas) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  const watched = projects.filter((p) => p.is_watched)
  const mySolicitudes = projects
    .filter((p) => user && p.requesters?.some((r) => r.id === user.id))
    .sort((a, b) => (b.last_activity_at || '').localeCompare(a.last_activity_at || ''))
  const active = projects.filter((p) => p.status !== 'completed' && p.status !== 'paused')
  const inProgress = active.length
  const avgProgress = avgOf(active)
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
          {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5 p-5">
        <p className="text-[15px] leading-relaxed">{headline(projects)}</p>
      </Card>

      <PortalKpis inProgress={inProgress} avgProgress={avgProgress} upcoming={upcoming} />

      <section>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <ClipboardList className="size-4 text-primary" />
            Mis solicitudes
          </h2>
          {mySolicitudes.length > 3 && (
            <Link to="/proyectos?requester=me" className="text-sm text-primary hover:underline">
              Ver todas ({mySolicitudes.length})
            </Link>
          )}
        </div>
        {mySolicitudes.length === 0 ? (
          <Card className="border-dashed p-6 text-center text-sm text-muted-foreground">
            Aquí verás los proyectos en los que figuras como solicitante. Si registraste
            una solicitud y no aparece, pídele al equipo de desarrollo que te agregue como
            solicitante del proyecto.
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {mySolicitudes.slice(0, 3).map((p) => (
              <PortalProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <Star className="size-4 fill-amber-400 text-amber-500" />
          Mis proyectos
        </h2>
        {watched.length === 0 ? (
          <Card className="border-dashed p-6 text-center text-sm text-muted-foreground">
            Marca con la estrella ⭐ los proyectos que quieras seguir de cerca y aparecerán aquí.
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {watched.map((p) => (
              <PortalProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Estado por área</h2>
        <AreaStatusGrid areas={areas} projects={projects} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <UpcomingDeliveries projects={projects} />
        <PortalActivity />
      </div>
    </div>
  )
}

import { Link, useParams } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowLeft, CalendarDays, Flag } from 'lucide-react'
import { useProject } from '@/hooks/queries'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AreaBadge } from '@/components/common/AreaBadge'
import { ProgressRing } from '@/components/common/ProgressRing'
import { UserAvatar } from '@/components/common/UserAvatar'
import { EmptyState } from '@/components/common/EmptyState'
import { HealthBadge } from '@/components/portal/HealthBadge'
import { StageList } from '@/components/portal/StageList'
import { PortalActivity } from '@/components/portal/PortalActivity'
import { PROJECT_STATUS } from '@/lib/status'
import { projectHealth } from '@/lib/health'
import { cn } from '@/lib/utils'
import type { Project } from '@/lib/types'

function summarySentence(p: Project): string {
  const pct = `${p.progress_cached}% de avance`
  if (p.status === 'completed') {
    return p.completed_at
      ? `Entregado el ${format(parseISO(p.completed_at), "d 'de' MMMM", { locale: es })}.`
      : 'Proyecto entregado.'
  }
  if (p.status === 'paused') return `En pausa, con ${pct}.`
  const estado = PROJECT_STATUS[p.status].label
  if (!p.due_date) return `${estado}, con ${pct}. Sin fecha de entrega definida.`
  const fecha = format(parseISO(p.due_date), "d 'de' MMMM", { locale: es })
  const h = projectHealth(p)
  if (h.key === 'delayed') return `${estado}, con ${pct}. La entrega estimada era el ${fecha} — con retraso.`
  if (h.key === 'attention') return `${estado} y bloqueado, con ${pct}. Entrega estimada: ${fecha}.`
  if (h.key === 'risk') return `${estado}, con ${pct}. Entrega estimada: ${fecha} — en riesgo.`
  return `${estado}, con ${pct}. Entrega estimada: ${fecha} — en fecha.`
}

export default function PortalProjectPage() {
  const { id } = useParams()
  const { data: p, isLoading } = useProject(id)

  if (isLoading || !p) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  const areas = p.areas.length ? p.areas : p.area ? [p.area] : []

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2" asChild>
        <Link to="/proyectos">
          <ArrowLeft className="size-4" /> Proyectos
        </Link>
      </Button>

      <div>
        <div className="flex flex-wrap items-center gap-1.5">
          {areas.map((a) => (
            <AreaBadge key={a.id} name={a.name} color={a.color} />
          ))}
          <HealthBadge project={p} size="md" />
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{p.name}</h1>
        {p.description && <p className="mt-2 max-w-2xl text-muted-foreground">{p.description}</p>}
      </div>

      <Card>
        <CardContent className="grid gap-6 p-6 sm:grid-cols-[auto_1fr] sm:items-center">
          <div className="flex items-center gap-4">
            <ProgressRing value={p.progress_cached} size={80} strokeWidth={7} />
            <div className="max-w-xs text-sm">
              <p className="font-medium">¿En qué va?</p>
              <p className="mt-1 text-muted-foreground">{summarySentence(p)}</p>
            </div>
          </div>

          <div className="grid gap-4 text-sm sm:grid-cols-3">
            <Fact label="Líder">
              {p.lead ? (
                <span className="flex items-center gap-2">
                  <UserAvatar name={p.lead.name} color={p.lead.avatar_color} size="xs" />
                  {p.lead.name}
                </span>
              ) : (
                <span className="text-muted-foreground">Sin asignar</span>
              )}
            </Fact>
            <Fact label="Solicitado por">
              {p.requesters.length ? (
                <div className="flex flex-wrap gap-x-2 gap-y-1">
                  {p.requesters.map((r) => (
                    <span key={r.id} className="flex items-center gap-1.5">
                      <UserAvatar name={r.name} color={r.avatar_color} size="xs" />
                      {r.name}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-muted-foreground">Sin especificar</span>
              )}
            </Fact>
            <Fact label="Fechas">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-3.5 text-muted-foreground" />
                {p.start_date ? format(parseISO(p.start_date), 'd MMM', { locale: es }) : '—'}
                {' → '}
                {p.due_date ? format(parseISO(p.due_date), 'd MMM yyyy', { locale: es }) : '—'}
              </span>
            </Fact>
          </div>
        </CardContent>
      </Card>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Avance por etapa</h2>
        <StageList modules={p.modules ?? []} />
      </section>

      {(p.milestones ?? []).length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Hitos</h2>
          <ol className="relative space-y-3 border-l pl-6">
            {(p.milestones ?? []).map((m) => (
              <li key={m.id} className="relative">
                <span
                  className={cn(
                    'absolute -left-[27px] top-1 size-3 rounded-full border-2 border-background',
                    m.done ? 'bg-emerald-500' : 'bg-muted-foreground',
                  )}
                />
                <div className="flex items-center gap-2">
                  <Flag className="size-3.5 text-muted-foreground" />
                  <p className={cn('text-sm font-medium', m.done && 'text-muted-foreground line-through')}>
                    {m.title}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(parseISO(m.date), "d 'de' MMMM yyyy", { locale: es })}
                  {m.done ? ' · cumplido' : ''}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold">Novedades del proyecto</h2>
        <PortalActivity areaId={p.area_id} />
      </section>

      {(p.modules ?? []).length === 0 && (p.milestones ?? []).length === 0 && (
        <EmptyState
          title="Todavía sin detalle"
          description="El equipo aún no ha cargado etapas ni hitos para este proyecto."
        />
      )}
    </div>
  )
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  )
}

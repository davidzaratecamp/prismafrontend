import { Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarDays, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { AreaBadge } from '@/components/common/AreaBadge'
import { UserAvatar } from '@/components/common/UserAvatar'
import { HealthBadge } from './HealthBadge'
import { PROJECT_STATUS } from '@/lib/status'
import type { Project } from '@/lib/types'

export function PortalProjectCard({ project: p }: { project: Project }) {
  const areas = p.areas.length ? p.areas : p.area ? [p.area] : []

  return (
    <Link to={`/proyectos/${p.id}`} className="group block">
      <Card className="h-full p-5 transition-all hover:border-primary/40 hover:shadow-md">
        <div className="flex flex-wrap items-center gap-1.5">
          {areas.slice(0, 2).map((a) => (
            <AreaBadge key={a.id} name={a.name} color={a.color} />
          ))}
          {areas.length > 2 && (
            <span className="text-xs text-muted-foreground">+{areas.length - 2}</span>
          )}
        </div>

        <h3 className="mt-2.5 line-clamp-2 text-[15px] font-semibold leading-snug group-hover:text-primary">
          {p.name}
        </h3>

        <div className="mt-3 flex items-center gap-2">
          <HealthBadge project={p} />
          <span className="text-xs text-muted-foreground">{PROJECT_STATUS[p.status].label}</span>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Avance</span>
            <span className="font-semibold tabular-nums">{p.progress_cached}%</span>
          </div>
          <Progress value={p.progress_cached} className="mt-1.5 h-2" />
        </div>

        <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5" />
            {p.due_date
              ? `Entrega ${format(parseISO(p.due_date), "d 'de' MMM", { locale: es })}`
              : 'Sin fecha de entrega'}
          </span>
          {p.lead && (
            <span className="flex items-center gap-1.5">
              <UserAvatar name={p.lead.name} color={p.lead.avatar_color} size="xs" />
              {p.lead.name.split(' ')[0]}
            </span>
          )}
        </div>

        {p.requesters.length > 0 && (
          <p className="mt-2 truncate text-[11px] text-muted-foreground">
            Solicitado por {p.requesters.map((r) => r.name).join(', ')}
          </p>
        )}

        <div className="mt-1 flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
          Ver detalle <ChevronRight className="size-3.5" />
        </div>
      </Card>
    </Link>
  )
}

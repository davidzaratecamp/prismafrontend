import { formatDistanceToNow, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/common/EmptyState'
import { UserAvatar } from '@/components/common/UserAvatar'
import { useActivity } from '@/hooks/queries'
import { Activity } from 'lucide-react'

export function ActivityFeed({ areaId, limit = 15 }: { areaId?: number; limit?: number }) {
  const { data, isLoading } = useActivity({ area_id: areaId, limit })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="size-4 text-primary" />
          Actividad reciente
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando...</p>
        ) : !data || data.length === 0 ? (
          <EmptyState title="Sin actividad" description="Los cambios del equipo aparecerán aquí." />
        ) : (
          <ol className="space-y-3">
            {data.map((a) => (
              <li key={a.id} className="flex gap-3">
                <UserAvatar name={a.actor_name} color={a.actor_color} size="xs" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug">
                    <span className="font-medium">{a.actor_name ?? 'Alguien'}</span>{' '}
                    <span className="text-muted-foreground">{stripActor(a.summary, a.actor_name)}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDistanceToNow(parseISO(a.created_at), { locale: es, addSuffix: true })}
                    {a.area_name ? ` · ${a.area_name}` : ''}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}

// Los resúmenes empiezan en 3ª persona ("Creó el proyecto..."); mostramos en minúscula tras el nombre.
function stripActor(summary: string, _actor: string | null) {
  return summary.charAt(0).toLowerCase() + summary.slice(1)
}

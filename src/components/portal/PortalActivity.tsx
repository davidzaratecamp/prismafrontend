import { formatDistanceToNow, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { Newspaper } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/common/EmptyState'
import { UserAvatar } from '@/components/common/UserAvatar'
import { useActivity } from '@/hooks/queries'

/**
 * Novedades para el portal: se omite el ruido de tareas individuales
 * (crear/mover tareas) y se deja lo relevante para un stakeholder:
 * proyectos, módulos e hitos.
 */
export function PortalActivity({ areaId, limit = 40 }: { areaId?: number; limit?: number }) {
  const { data, isLoading } = useActivity({ area_id: areaId, limit })

  const items = (data ?? []).filter((a) => {
    if (a.entity_type === 'task') return a.action === 'created' ? false : a.action !== 'moved'
    if (a.entity_type === 'user') return false
    return true
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Newspaper className="size-4 text-primary" />
          Novedades
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando...</p>
        ) : items.length === 0 ? (
          <EmptyState title="Sin novedades recientes" description="Aquí verás los avances del equipo." />
        ) : (
          <ol className="space-y-3">
            {items.slice(0, 15).map((a) => (
              <li key={a.id} className="flex gap-3">
                <UserAvatar name={a.actor_name} color={a.actor_color} size="xs" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug">{a.summary}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {a.actor_name ? `${a.actor_name} · ` : ''}
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

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/common/EmptyState'
import { List } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MiniBarRow {
  label: string
  value: number
  /** texto a la derecha; si falta se muestra `value` */
  display?: string
  color?: string
  /** esta fila en particular no reacciona a onRowClick aunque la lista sea clickeable */
  disabled?: boolean
}

/** Lista compacta tipo "barra de progreso" para desgloses. */
export function MiniBarList({
  title,
  rows,
  emptyLabel = 'Sin datos',
  className,
  description,
  onRowClick,
}: {
  title: string
  rows: MiniBarRow[]
  emptyLabel?: string
  className?: string
  /** subtítulo chico bajo el título, para aclaraciones (ej. qué significa el dato) */
  description?: string
  /** si se pasa, cada fila (salvo las marcadas `disabled`) se vuelve clickeable */
  onRowClick?: (row: MiniBarRow) => void
}) {
  const max = Math.max(1, ...rows.map((r) => r.value))

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <EmptyState icon={List} title={emptyLabel} />
        ) : (
          <ul className="space-y-2.5">
            {rows.map((r) => {
              const clickable = !!onRowClick && !r.disabled
              return (
                <li
                  key={r.label}
                  className={cn('space-y-1 rounded-md', clickable && '-mx-1.5 cursor-pointer px-1.5 py-0.5 hover:bg-muted/50')}
                  role={clickable ? 'button' : undefined}
                  tabIndex={clickable ? 0 : undefined}
                  onClick={clickable ? () => onRowClick!(r) : undefined}
                  onKeyDown={
                    clickable
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            onRowClick!(r)
                          }
                        }
                      : undefined
                  }
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className={cn('truncate text-muted-foreground', clickable && 'hover:text-foreground hover:underline')}>
                      {r.label}
                    </span>
                    <span className="tabular-nums font-medium">{r.display ?? r.value}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn('h-full rounded-full', !r.color && 'bg-primary')}
                      style={{ width: `${(r.value / max) * 100}%`, background: r.color }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

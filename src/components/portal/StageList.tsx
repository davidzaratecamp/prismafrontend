import { Progress } from '@/components/ui/progress'
import { EmptyState } from '@/components/common/EmptyState'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Layers } from 'lucide-react'
import type { Module } from '@/lib/types'

export function StageList({ modules }: { modules: Module[] }) {
  if (!modules.length) {
    return (
      <EmptyState
        icon={Layers}
        title="El equipo aún no ha detallado las etapas"
        description="Cuando dividan el proyecto en partes, verás aquí el avance de cada una."
      />
    )
  }

  return (
    <div className="space-y-3">
      {modules.map((m) => {
        const done = (m.tasks ?? []).filter((t) => t.status === 'done').length
        const total = (m.tasks ?? []).length
        return (
          <div key={m.id} className="rounded-lg border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{m.name}</p>
              <StatusBadge status={m.status} />
            </div>
            {m.description && (
              <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
            )}
            <div className="mt-3 flex items-center gap-3">
              <Progress value={m.progress_cached} className="h-2 flex-1" />
              <span className="shrink-0 text-xs font-semibold tabular-nums">
                {m.progress_cached}%
              </span>
            </div>
            {total > 0 && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                {done} de {total} actividades completadas
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

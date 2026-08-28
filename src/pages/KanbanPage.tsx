import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/common/PageHeader'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { useAreas, useKanban, useProjects } from '@/hooks/queries'
import { useCanWrite } from '@/stores/auth'

export default function KanbanPage() {
  const [params, setParams] = useSearchParams()
  const canWrite = useCanWrite()
  const { data: areas } = useAreas()
  const area = params.get('area') ?? 'all'
  const project = params.get('project') ?? 'all'

  const { data: projects } = useProjects(area !== 'all' ? { area_id: area } : {})
  const { data, isLoading } = useKanban({
    area_id: area !== 'all' ? area : undefined,
    project_id: project !== 'all' ? project : undefined,
  })

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value === 'all') next.delete(key)
    else next.set(key, value)
    if (key === 'area') next.delete('project')
    setParams(next, { replace: true })
  }

  const isEmpty =
    data && Object.values(data).every((col) => col.length === 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tablero"
        description="Arrastra las tareas entre columnas para actualizar su estado."
        actions={
          <div className="flex gap-2">
            <Select value={area} onValueChange={(v) => setParam('area', v)}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las áreas</SelectItem>
                {areas?.map((a) => (
                  <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={project} onValueChange={(v) => setParam('project', v)}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Proyecto" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los proyectos</SelectItem>
                {projects?.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      {isLoading ? (
        <div className="flex gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-96 w-72 shrink-0 rounded-xl" />
          ))}
        </div>
      ) : !data || isEmpty ? (
        <EmptyState
          title="No hay tareas para mostrar"
          description={
            area !== 'all' || project !== 'all'
              ? 'Con estos filtros no hay tareas. Prueba con "Todas las áreas" y "Todos los proyectos".'
              : 'El tablero muestra las tareas de los módulos. Entra a un proyecto → pestaña "Módulos y tareas" y añade tareas a un módulo; aparecerán aquí.'
          }
        />
      ) : (
        <KanbanBoard data={data} canWrite={canWrite} />
      )}
    </div>
  )
}

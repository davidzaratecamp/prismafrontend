import { useState } from 'react'
import { toast } from 'sonner'
import {
  ChevronDown,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { StatusBadge } from '@/components/common/StatusBadge'
import { EmptyState } from '@/components/common/EmptyState'
import { TaskRow } from './TaskRow'
import { ModuleForm } from './ModuleForm'
import { useModuleMutations, useTaskMutations } from '@/hooks/queries'
import { apiErrorMessage } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { Module, Project } from '@/lib/types'

export function ModulesPanel({ project, canWrite }: { project: Project; canWrite: boolean }) {
  const modules = project.modules ?? []
  const planned = project.planned_modules_count
  const scopeIncomplete = planned != null && planned > modules.length
  const [addOpen, setAddOpen] = useState(false)
  const [editModule, setEditModule] = useState<Module | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {planned != null ? (
            <>
              {modules.length} de {planned} módulos previstos
              {scopeIncomplete && (
                <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  faltan {planned - modules.length} por crear
                </span>
              )}
            </>
          ) : (
            <>
              {modules.length} módulo{modules.length === 1 ? '' : 's'} · el avance del proyecto es el
              promedio del avance de sus módulos.
            </>
          )}
        </p>
        {canWrite && (
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="size-4" /> Módulo
          </Button>
        )}
      </div>

      {modules.length === 0 ? (
        <EmptyState
          title="Sin módulos todavía"
          description="Divide el proyecto en módulos y luego añade tareas a cada uno."
          action={
            canWrite && (
              <Button size="sm" onClick={() => setAddOpen(true)}>
                <Plus className="size-4" /> Añadir módulo
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-3">
          {modules.map((m) => (
            <ModuleCard
              key={m.id}
              module={m}
              projectId={project.id}
              canWrite={canWrite}
              onEdit={() => setEditModule(m)}
            />
          ))}
        </div>
      )}

      <ModuleForm
        open={addOpen}
        onOpenChange={setAddOpen}
        projectId={project.id}
        projectDueDate={project.due_date}
      />
      <ModuleForm
        open={!!editModule}
        onOpenChange={(v) => !v && setEditModule(null)}
        projectId={project.id}
        projectDueDate={project.due_date}
        module={editModule ?? undefined}
      />
    </div>
  )
}

function ModuleCard({
  module: m,
  projectId,
  canWrite,
  onEdit,
}: {
  module: Module
  projectId: number
  canWrite: boolean
  onEdit: () => void
}) {
  const [open, setOpen] = useState(true)
  const [newTask, setNewTask] = useState('')
  const { remove } = useModuleMutations(projectId)
  const tasks = useTaskMutations(projectId)

  const addTask = async () => {
    if (!newTask.trim()) return
    try {
      await tasks.create.mutateAsync({ moduleId: m.id, title: newTask.trim() })
      setNewTask('')
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
  }

  const done = (m.tasks ?? []).filter((t) => t.status === 'done').length
  const total = (m.tasks ?? []).length

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <button onClick={() => setOpen((v) => !v)} className="text-muted-foreground">
          <ChevronDown className={cn('size-4 transition-transform', !open && '-rotate-90')} />
        </button>
        {canWrite && <GripVertical className="size-4 shrink-0 text-muted-foreground/40" />}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-medium">{m.name}</p>
            <StatusBadge status={m.status} />
            {m.progress_manual != null && (
              <span className="text-[11px] text-muted-foreground">(manual)</span>
            )}
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <Progress value={m.progress_cached} className="h-1.5 max-w-40" />
            <span className="text-xs tabular-nums text-muted-foreground">
              {m.progress_cached}% · {done}/{total} tareas
            </span>
          </div>
        </div>
        {canWrite && (
          <div className="flex shrink-0 items-center gap-1">
            <button onClick={onEdit} className="rounded p-1.5 text-muted-foreground hover:bg-accent">
              <Pencil className="size-4" />
            </button>
            <button
              onClick={() => {
                if (confirm(`¿Eliminar el módulo "${m.name}" y sus tareas?`)) remove.mutate(m.id)
              }}
              className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        )}
      </div>

      {open && (
        <div className="border-t bg-muted/20 px-4 py-3">
          {m.description && <p className="mb-2 text-sm text-muted-foreground">{m.description}</p>}
          <div className="space-y-0.5">
            {(m.tasks ?? []).map((t) => (
              <TaskRow key={t.id} task={t} projectId={projectId} canWrite={canWrite} />
            ))}
            {total === 0 && (
              <p className="px-2 py-2 text-sm text-muted-foreground">Este módulo no tiene tareas.</p>
            )}
          </div>

          {canWrite && (
            <div className="mt-2 flex gap-2">
              <Input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
                placeholder="Añadir tarea y pulsar Enter..."
                className="h-8"
              />
              <Button size="sm" variant="outline" onClick={addTask} disabled={tasks.create.isPending}>
                Añadir
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

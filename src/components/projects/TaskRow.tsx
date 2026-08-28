import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserAvatar } from '@/components/common/UserAvatar'
import { TaskStatusBadge } from '@/components/common/StatusBadge'
import { TASK_STATUS_OPTIONS } from '@/lib/status'
import { useTaskMutations, useUsers } from '@/hooks/queries'
import { apiErrorMessage } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { Task } from '@/lib/types'

export function TaskRow({
  task,
  projectId,
  canWrite,
}: {
  task: Task
  projectId: number
  canWrite: boolean
}) {
  const { update, remove } = useTaskMutations(projectId)
  const { data: users } = useUsers({ active: true })

  const patch = async (body: Record<string, unknown>) => {
    try {
      await update.mutateAsync({ moduleId: task.module_id, taskId: task.id, ...body })
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-accent/50">
      <span
        className={cn(
          'min-w-0 flex-1 truncate text-sm',
          task.status === 'done' && 'text-muted-foreground line-through',
        )}
      >
        {task.title}
      </span>

      {!canWrite && <TaskStatusBadge status={task.status} />}

      {canWrite ? (
        <>
          <Select
            value={task.assignee_user_id ? String(task.assignee_user_id) : 'none'}
            onValueChange={(v) => patch({ assignee_user_id: v === 'none' ? null : Number(v) })}
          >
            <SelectTrigger className="h-8 w-9 border-0 bg-transparent p-0 shadow-none [&>svg]:hidden">
              <UserAvatar name={task.assignee_name} color={task.assignee_color} size="xs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin asignar</SelectItem>
              {users
                ?.filter((u) => u.role !== 'viewer')
                .map((u) => (
                  <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Select value={task.status} onValueChange={(v) => patch({ status: v })}>
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TASK_STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <button
            onClick={() => {
              if (confirm(`¿Eliminar la tarea "${task.title}"?`))
                remove.mutate({ moduleId: task.module_id, taskId: task.id })
            }}
            className="text-muted-foreground transition-colors hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </button>
        </>
      ) : (
        <UserAvatar name={task.assignee_name} color={task.assignee_color} size="xs" />
      )}
    </div>
  )
}

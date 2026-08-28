import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Link } from 'react-router-dom'
import { UserAvatar } from '@/components/common/UserAvatar'
import { PRIORITY } from '@/lib/status'
import { cn } from '@/lib/utils'
import type { KanbanData, TaskStatus } from '@/lib/types'

type Item = KanbanData[TaskStatus][number]

export function KanbanCard({ item, overlay }: { item: Item; overlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    data: { item },
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={cn(
        'group cursor-grab touch-none rounded-lg border bg-card p-3 shadow-sm active:cursor-grabbing',
        isDragging && 'opacity-40',
        overlay && 'rotate-2 shadow-lg',
      )}
    >
      <div className="flex items-start gap-2">
        <span
          className="mt-1 size-2 shrink-0 rounded-full"
          style={{ background: item.area_color }}
          title={item.area_name}
        />
        <p className="text-sm font-medium leading-snug">{item.title}</p>
      </div>
      <Link
        to={`/projects/${item.project_id}`}
        onClick={(e) => e.stopPropagation()}
        className="mt-1.5 block truncate text-xs text-muted-foreground hover:text-primary"
      >
        {item.project_name} · {item.module_name}
      </Link>
      <div className="mt-2.5 flex items-center justify-between">
        <span
          className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium', PRIORITY[item.project_priority].badge)}
        >
          {PRIORITY[item.project_priority].label}
        </span>
        {item.assignee_name && (
          <UserAvatar name={item.assignee_name} color={item.assignee_color} size="xs" />
        )}
      </div>
    </div>
  )
}

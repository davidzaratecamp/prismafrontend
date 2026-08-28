import { useEffect, useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { toast } from 'sonner'
import { KanbanCard } from './KanbanCard'
import { KANBAN_COLUMNS, TASK_STATUS } from '@/lib/status'
import { useKanbanMove } from '@/hooks/queries'
import { apiErrorMessage } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { KanbanData, TaskStatus } from '@/lib/types'

type Item = KanbanData[TaskStatus][number]

export function KanbanBoard({ data, canWrite }: { data: KanbanData; canWrite: boolean }) {
  const [columns, setColumns] = useState<KanbanData>(data)
  const [activeItem, setActiveItem] = useState<Item | null>(null)
  const move = useKanbanMove()

  useEffect(() => setColumns(data), [data])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const findColumn = (id: number): TaskStatus | undefined =>
    (Object.keys(columns) as TaskStatus[]).find((col) => columns[col].some((t) => t.id === id))

  const onDragStart = (e: DragStartEvent) => {
    const col = findColumn(Number(e.active.id))
    if (col) setActiveItem(columns[col].find((t) => t.id === Number(e.active.id)) ?? null)
  }

  const onDragEnd = (e: DragEndEvent) => {
    setActiveItem(null)
    const { active, over } = e
    if (!over) return
    const activeId = Number(active.id)
    const from = findColumn(activeId)
    const overId = over.id
    const to =
      (KANBAN_COLUMNS.includes(overId as TaskStatus) && (overId as TaskStatus)) ||
      findColumn(Number(overId))
    if (!from || !to || from === to) return

    const item = columns[from].find((t) => t.id === activeId)
    if (!item) return

    setColumns((prev) => ({
      ...prev,
      [from]: prev[from].filter((t) => t.id !== activeId),
      [to]: [...prev[to], { ...item, status: to }],
    }))

    move.mutate(
      {
        projectId: item.project_id,
        moduleId: item.module_id,
        taskId: item.id,
        status: to,
      },
      {
        onError: (err) => {
          toast.error(apiErrorMessage(err))
          setColumns(data)
        },
      },
    )
  }

  const totalPoints = useMemo(() => {
    const acc: Record<string, number> = {}
    for (const col of KANBAN_COLUMNS) acc[col] = columns[col]?.length ?? 0
    return acc
  }, [columns])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((col) => (
          <Column
            key={col}
            status={col}
            items={columns[col] ?? []}
            count={totalPoints[col]}
            disabled={!canWrite}
          />
        ))}
      </div>
      <DragOverlay>{activeItem && <KanbanCard item={activeItem} overlay />}</DragOverlay>
    </DndContext>
  )
}

function Column({
  status,
  items,
  count,
  disabled,
}: {
  status: TaskStatus
  items: Item[]
  count: number
  disabled: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status, disabled })
  const meta = TASK_STATUS[status]

  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="flex items-center gap-2 text-sm font-medium">
          <span className="size-2 rounded-full" style={{ background: meta.dot }} />
          {meta.label}
        </span>
        <span className="rounded bg-muted px-1.5 text-xs tabular-nums text-muted-foreground">
          {count}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          'flex min-h-32 flex-1 flex-col gap-2 rounded-xl border border-dashed p-2 transition-colors',
          isOver ? 'border-primary bg-primary/5' : 'bg-muted/30',
        )}
      >
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <KanbanCard key={item.id} item={item} />
          ))}
        </SortableContext>
        {items.length === 0 && (
          <p className="py-6 text-center text-xs text-muted-foreground">Sin tareas</p>
        )}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { Flag, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { EmptyState } from '@/components/common/EmptyState'
import { useMilestoneMutations } from '@/hooks/queries'
import { apiErrorMessage } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { Milestone } from '@/lib/types'

export function MilestoneList({
  projectId,
  milestones,
  canWrite,
}: {
  projectId: number
  milestones: Milestone[]
  canWrite: boolean
}) {
  const { create, update, remove } = useMilestoneMutations(projectId)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')

  const add = async () => {
    if (!title.trim() || !date) return toast.error('Título y fecha son obligatorios')
    try {
      await create.mutateAsync({ title: title.trim(), date })
      setTitle('')
      setDate('')
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
  }

  return (
    <div className="space-y-4">
      {milestones.length === 0 ? (
        <EmptyState icon={Flag} title="Sin hitos" description="Marca fechas clave para el roadmap." />
      ) : (
        <ol className="relative space-y-3 border-l pl-6">
          {milestones.map((m) => (
            <li key={m.id} className="relative">
              <span
                className={cn(
                  'absolute -left-[27px] top-1 size-3 rounded-full border-2 border-background',
                  m.done ? 'bg-emerald-500' : 'bg-muted-foreground',
                )}
              />
              <div className="flex items-center gap-3">
                {canWrite && (
                  <Checkbox
                    checked={m.done}
                    onCheckedChange={(v) => update.mutate({ id: m.id, done: !!v })}
                  />
                )}
                <div className="flex-1">
                  <p className={cn('text-sm font-medium', m.done && 'text-muted-foreground line-through')}>
                    {m.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(m.date), "d 'de' MMMM yyyy", { locale: es })}
                  </p>
                </div>
                {canWrite && (
                  <button
                    onClick={() => remove.mutate(m.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}

      {canWrite && (
        <div className="flex flex-wrap gap-2">
          <Input
            className="h-9 min-w-48 flex-1"
            placeholder="Nuevo hito..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            type="date"
            className="h-9 w-40"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <Button size="sm" onClick={add} disabled={create.isPending}>
            <Plus className="size-4" /> Agregar
          </Button>
        </div>
      )}
    </div>
  )
}

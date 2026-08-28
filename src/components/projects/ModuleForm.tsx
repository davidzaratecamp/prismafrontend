import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useModuleMutations } from '@/hooks/queries'
import { PROJECT_STATUS_OPTIONS } from '@/lib/status'
import { apiErrorMessage } from '@/lib/api'
import type { Module } from '@/lib/types'

export function ModuleForm({
  open,
  onOpenChange,
  projectId,
  projectDueDate,
  module: mod,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  projectId: number
  projectDueDate?: string | null
  module?: Module
}) {
  const { create, update } = useModuleMutations(projectId)
  const editing = !!mod
  const [form, setForm] = useState({
    name: '',
    description: '',
    status: 'planned',
    progress_manual: '',
    due_date: '',
    repo_url: '',
  })

  useEffect(() => {
    if (!open) return
    setForm({
      name: mod?.name ?? '',
      description: mod?.description ?? '',
      status: mod?.status ?? 'planned',
      progress_manual: mod?.progress_manual != null ? String(mod.progress_manual) : '',
      due_date: mod?.due_date ?? '',
      repo_url: mod?.repo_url ?? '',
    })
  }, [open, mod])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('El nombre es obligatorio')
    if (form.due_date && projectDueDate && form.due_date > projectDueDate) {
      return toast.error(
        `La entrega del módulo no puede pasar de la del proyecto (${projectDueDate}).`,
      )
    }
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      status: form.status,
      progress_manual: form.progress_manual === '' ? null : Number(form.progress_manual),
      due_date: form.due_date || null,
      repo_url: form.repo_url.trim() || null,
    }
    try {
      if (editing) {
        await update.mutateAsync({ moduleId: mod!.id, ...payload })
        toast.success('Módulo actualizado')
      } else {
        await create.mutateAsync(payload)
        toast.success('Módulo agregado')
      }
      onOpenChange(false)
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
  }

  const busy = create.isPending || update.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar módulo' : 'Nuevo módulo'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="m-name">Nombre *</Label>
            <Input id="m-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-desc">Descripción</Label>
            <Textarea id="m-desc" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Estado</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROJECT_STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-due">Entrega</Label>
              <Input
                id="m-due"
                type="date"
                value={form.due_date}
                max={projectDueDate ?? undefined}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              />
              {projectDueDate && (
                <p className="text-xs text-muted-foreground">
                  No puede pasar de la entrega del proyecto ({projectDueDate}).
                </p>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-manual">Avance manual %</Label>
            <Input
              id="m-manual"
              type="number"
              min={0}
              max={100}
              placeholder="Déjalo vacío para el cálculo automático"
              value={form.progress_manual}
              onChange={(e) => setForm({ ...form, progress_manual: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Vacío: el avance se calcula por las tareas del módulo; si aún no tiene tareas, se toma
              de su estado (En progreso 40%, En pruebas 75%, Completado 100%). Llénalo solo para
              fijar el porcentaje a mano.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
              Cancelar
            </Button>
            <Button type="submit" disabled={busy}>{busy ? 'Guardando...' : 'Guardar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

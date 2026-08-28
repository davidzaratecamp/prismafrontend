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
  module: mod,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  projectId: number
  module?: Module
}) {
  const { create, update } = useModuleMutations(projectId)
  const editing = !!mod
  const [form, setForm] = useState({
    name: '',
    description: '',
    status: 'planned',
    weight: '1',
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
      weight: String(mod?.weight ?? 1),
      progress_manual: mod?.progress_manual != null ? String(mod.progress_manual) : '',
      due_date: mod?.due_date ?? '',
      repo_url: mod?.repo_url ?? '',
    })
  }, [open, mod])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('El nombre es obligatorio')
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      status: form.status,
      weight: Number(form.weight) || 1,
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
              <Label htmlFor="m-weight">Peso (1–10)</Label>
              <Input
                id="m-weight"
                type="number"
                min={1}
                max={10}
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="m-due">Entrega</Label>
              <Input id="m-due" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-manual">Avance manual %</Label>
              <Input
                id="m-manual"
                type="number"
                min={0}
                max={100}
                placeholder="Auto por tareas"
                value={form.progress_manual}
                onChange={(e) => setForm({ ...form, progress_manual: e.target.value })}
              />
            </div>
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

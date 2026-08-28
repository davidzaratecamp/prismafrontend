import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { MemberPicker } from './MemberPicker'
import { useAreas, useProjectMutations, useUsers } from '@/hooks/queries'
import { PRIORITY_OPTIONS, PROJECT_STATUS_OPTIONS } from '@/lib/status'
import { apiErrorMessage } from '@/lib/api'
import type { Project } from '@/lib/types'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  project?: Project
  defaultAreaId?: number
  onCreated?: (p: Project) => void
}

type FormState = {
  name: string
  description: string
  area_id: string
  status: string
  priority: string
  lead_user_id: string
  repo_url: string
  start_date: string
  due_date: string
  progress_manual: string
  planned_modules_count: string
  member_ids: number[]
}

const empty: FormState = {
  name: '',
  description: '',
  area_id: '',
  status: 'planned',
  priority: 'medium',
  lead_user_id: '',
  repo_url: '',
  start_date: '',
  due_date: '',
  progress_manual: '',
  planned_modules_count: '',
  member_ids: [],
}

export function ProjectForm({ open, onOpenChange, project, defaultAreaId, onCreated }: Props) {
  const { data: areas } = useAreas()
  const { data: users } = useUsers({ active: true })
  const { create, update } = useProjectMutations()
  const [form, setForm] = useState<FormState>(empty)
  const editing = !!project

  useEffect(() => {
    if (!open) return
    if (project) {
      setForm({
        name: project.name,
        description: project.description ?? '',
        area_id: String(project.area_id),
        status: project.status,
        priority: project.priority,
        lead_user_id: project.lead_user_id ? String(project.lead_user_id) : '',
        repo_url: project.repo_url ?? '',
        start_date: project.start_date ?? '',
        due_date: project.due_date ?? '',
        progress_manual: project.progress_manual != null ? String(project.progress_manual) : '',
        planned_modules_count:
          project.planned_modules_count != null ? String(project.planned_modules_count) : '',
        member_ids: project.members.map((m) => m.id),
      })
    } else {
      setForm({ ...empty, area_id: defaultAreaId ? String(defaultAreaId) : '' })
    }
  }, [open, project, defaultAreaId])

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.area_id) {
      toast.error('Nombre y área son obligatorios')
      return
    }
    const payload: Record<string, unknown> = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      area_id: Number(form.area_id),
      status: form.status,
      priority: form.priority,
      lead_user_id: form.lead_user_id ? Number(form.lead_user_id) : null,
      repo_url: form.repo_url.trim() || null,
      start_date: form.start_date || null,
      due_date: form.due_date || null,
      progress_manual: form.progress_manual === '' ? null : Number(form.progress_manual),
      planned_modules_count:
        form.planned_modules_count === '' ? null : Number(form.planned_modules_count),
    }

    try {
      if (editing) {
        await update.mutateAsync({ id: project!.id, ...payload })
        toast.success('Proyecto actualizado')
      } else {
        const created = await create.mutateAsync({ ...payload, member_ids: form.member_ids })
        toast.success('Proyecto creado')
        onCreated?.(created)
      }
      onOpenChange(false)
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
  }

  const busy = create.isPending || update.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar proyecto' : 'Nuevo proyecto'}</DialogTitle>
          <DialogDescription>
            {editing
              ? 'Actualiza los datos generales del proyecto.'
              : 'Registra un proyecto para un área. Luego podrás añadir módulos y tareas.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="p-name">Nombre *</Label>
            <Input
              id="p-name"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Portal de autogestión..."
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="p-desc">Descripción</Label>
            <Textarea
              id="p-desc"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Qué resuelve, para quién, alcance..."
              rows={3}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Área *</Label>
              <Select value={form.area_id} onValueChange={(v) => set('area_id', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un área" />
                </SelectTrigger>
                <SelectContent>
                  {areas?.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Líder</Label>
              <Select
                value={form.lead_user_id || 'none'}
                onValueChange={(v) => set('lead_user_id', v === 'none' ? '' : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin líder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin líder</SelectItem>
                  {users
                    ?.filter((u) => u.role !== 'viewer')
                    .map((u) => (
                      <SelectItem key={u.id} value={String(u.id)}>
                        {u.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Estado</Label>
              <Select value={form.status} onValueChange={(v) => set('status', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Prioridad</Label>
              <Select value={form.priority} onValueChange={(v) => set('priority', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="p-start">Inicio</Label>
              <Input
                id="p-start"
                type="date"
                value={form.start_date}
                onChange={(e) => set('start_date', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-due">Entrega estimada</Label>
              <Input
                id="p-due"
                type="date"
                value={form.due_date}
                onChange={(e) => set('due_date', e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="p-repo">Repositorio (opcional)</Label>
              <Input
                id="p-repo"
                value={form.repo_url}
                onChange={(e) => set('repo_url', e.target.value)}
                placeholder="https://github.com/..."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-planned">Módulos previstos</Label>
              <Input
                id="p-planned"
                type="number"
                min={1}
                max={100}
                value={form.planned_modules_count}
                onChange={(e) => set('planned_modules_count', e.target.value)}
                placeholder="Total esperado del proyecto"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="p-manual">Avance manual %</Label>
              <Input
                id="p-manual"
                type="number"
                min={0}
                max={100}
                value={form.progress_manual}
                onChange={(e) => set('progress_manual', e.target.value)}
                placeholder="Automático (módulos) si se deja vacío"
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            <strong>Módulos previstos:</strong> si el proyecto tendrá más módulos de los que ya
            creaste, indícalo aquí. El avance se calcula sobre ese total, así no llega al 100 %
            mientras el alcance esté incompleto. Déjalo vacío si ya cargaste todos los módulos.
          </p>

          {!editing && (
            <div className="space-y-1.5">
              <Label>Equipo asignado</Label>
              <MemberPicker
                users={(users ?? []).filter((u) => u.role !== 'viewer')}
                selected={form.member_ids}
                onChange={(ids) => set('member_ids', ids)}
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
              Cancelar
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear proyecto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

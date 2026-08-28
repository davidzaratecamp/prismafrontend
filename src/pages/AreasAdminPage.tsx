import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useAreaMutations, useAreas } from '@/hooks/queries'
import { apiErrorMessage } from '@/lib/api'
import type { Area } from '@/lib/types'

const SWATCHES = ['#e11d48', '#f97316', '#f59e0b', '#10b981', '#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899']

export default function AreasAdminPage() {
  const { data: areas } = useAreas()
  const { create, update, remove } = useAreaMutations()
  const [formArea, setFormArea] = useState<Area | 'new' | null>(null)
  const [toDelete, setToDelete] = useState<Area | null>(null)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Áreas"
        description="Las áreas de negocio que solicitan desarrollos."
        actions={
          <Button onClick={() => setFormArea('new')}>
            <Plus className="size-4" /> Nueva área
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {areas?.map((a) => (
          <Card key={a.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="size-3 rounded-full" style={{ background: a.color }} />
                  <div>
                    <p className="font-medium">{a.name}</p>
                    <p className="text-xs text-muted-foreground">/{a.slug}</p>
                  </div>
                </div>
                <button
                  onClick={() => setToDelete(a)}
                  className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              {a.description && (
                <p className="mt-2 text-sm text-muted-foreground">{a.description}</p>
              )}
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>{a.project_count ?? 0} proyectos · {a.active_count ?? 0} activos</span>
                <button className="text-primary hover:underline" onClick={() => setFormArea(a)}>
                  Editar
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AreaDialog
        area={formArea}
        onClose={() => setFormArea(null)}
        onSubmit={async (payload, id) => {
          try {
            if (id) await update.mutateAsync({ id, ...payload })
            else await create.mutateAsync(payload)
            toast.success(id ? 'Área actualizada' : 'Área creada')
            setFormArea(null)
          } catch (err) {
            toast.error(apiErrorMessage(err))
          }
        }}
        busy={create.isPending || update.isPending}
      />

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title={`Eliminar "${toDelete?.name}"`}
        description="Solo es posible si no tiene proyectos asociados."
        confirmLabel="Eliminar"
        destructive
        loading={remove.isPending}
        onConfirm={async () => {
          if (!toDelete) return
          try {
            await remove.mutateAsync(toDelete.id)
            toast.success('Área eliminada')
          } catch (err) {
            toast.error(apiErrorMessage(err))
          }
          setToDelete(null)
        }}
      />
    </div>
  )
}

function AreaDialog({
  area,
  onClose,
  onSubmit,
  busy,
}: {
  area: Area | 'new' | null
  onClose: () => void
  onSubmit: (payload: { name: string; color: string; description: string | null }, id?: number) => void
  busy: boolean
}) {
  const editing = area && area !== 'new' ? area : null
  const [name, setName] = useState('')
  const [color, setColor] = useState(SWATCHES[5])
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (!area) return
    setName(editing?.name ?? '')
    setColor(editing?.color ?? SWATCHES[5])
    setDescription(editing?.description ?? '')
  }, [area]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Dialog open={!!area} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar área' : 'Nueva área'}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!name.trim()) return toast.error('El nombre es obligatorio')
            onSubmit({ name: name.trim(), color, description: description.trim() || null }, editing?.id)
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="a-name">Nombre *</Label>
            <Input id="a-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="a-desc">Descripción</Label>
            <Input id="a-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {SWATCHES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="size-7 rounded-full ring-offset-2 ring-offset-background transition-all"
                  style={{ background: c, boxShadow: color === c ? `0 0 0 2px ${c}` : undefined }}
                />
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
              Cancelar
            </Button>
            <Button type="submit" disabled={busy}>{busy ? 'Guardando...' : 'Guardar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

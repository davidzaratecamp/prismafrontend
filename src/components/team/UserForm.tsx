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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAreas, useUserMutations } from '@/hooks/queries'
import { ROLE_OPTIONS } from '@/lib/roles'
import { apiErrorMessage } from '@/lib/api'
import type { User } from '@/lib/types'

export function UserForm({
  open,
  onOpenChange,
  user,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  user?: User
}) {
  const editing = !!user
  const { data: areas } = useAreas()
  const { create, update } = useUserMutations()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'developer',
    area_id: '',
  })

  useEffect(() => {
    if (!open) return
    setForm({
      name: user?.name ?? '',
      email: user?.email ?? '',
      password: '',
      role: user?.role ?? 'developer',
      area_id: user?.area_id ? String(user.area_id) : '',
    })
  }, [open, user])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) return toast.error('Nombre y correo obligatorios')
    if (!editing && form.password.length < 8) return toast.error('La contraseña debe tener 8+ caracteres')

    const base: Record<string, unknown> = {
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      area_id: form.role === 'viewer' && form.area_id ? Number(form.area_id) : null,
    }
    try {
      if (editing) {
        if (form.password) base.password = form.password
        await update.mutateAsync({ id: user!.id, ...base })
        toast.success('Usuario actualizado')
      } else {
        base.password = form.password
        await create.mutateAsync(base)
        toast.success('Usuario creado')
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
          <DialogTitle>{editing ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="u-name">Nombre *</Label>
            <Input id="u-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="u-email">Correo *</Label>
            <Input
              id="u-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="u-pass">
              {editing ? 'Nueva contraseña (opcional)' : 'Contraseña *'}
            </Label>
            <Input
              id="u-pass"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={editing ? 'Dejar vacío para no cambiarla' : 'Mínimo 8 caracteres'}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Rol</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {form.role === 'viewer' && (
              <div className="space-y-1.5">
                <Label>Área (visor)</Label>
                <Select
                  value={form.area_id || 'none'}
                  onValueChange={(v) => setForm({ ...form, area_id: v === 'none' ? '' : v })}
                >
                  <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Todas las áreas</SelectItem>
                    {areas?.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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

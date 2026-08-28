import { useMemo, useState } from 'react'
import { Plus, Pencil, UserX } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { UserAvatar } from '@/components/common/UserAvatar'
import { EmptyState } from '@/components/common/EmptyState'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { UserForm } from '@/components/team/UserForm'
import { useDashboard, useUserMutations, useUsers } from '@/hooks/queries'
import { ROLE_LABEL } from '@/lib/roles'
import { useIsAdmin } from '@/stores/auth'
import type { User } from '@/lib/types'

export default function TeamPage() {
  const isAdmin = useIsAdmin()
  const { data: users, isLoading } = useUsers()
  const { data: dash } = useDashboard()
  const { remove } = useUserMutations()
  const [formOpen, setFormOpen] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [toDeactivate, setToDeactivate] = useState<User | null>(null)

  const workloadById = useMemo(
    () => new Map((dash?.workload ?? []).map((w) => [w.id, w])),
    [dash],
  )

  const maxLoad = Math.max(1, ...(dash?.workload ?? []).map((w) => w.open_tasks))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Equipo"
        description="Desarrolladores, roles y carga de trabajo actual."
        actions={
          isAdmin && (
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="size-4" /> Nuevo usuario
            </Button>
          )
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : !users || users.length === 0 ? (
        <EmptyState title="Sin usuarios" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {users.map((u) => {
            const w = workloadById.get(u.id)
            const load = w?.open_tasks ?? 0
            return (
              <Card key={u.id} className={u.is_active === false ? 'opacity-60' : ''}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={u.name} color={u.avatar_color} size="md" />
                      <div>
                        <p className="font-medium leading-tight">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                    {isAdmin && u.is_active !== false && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditUser(u)}
                          className="rounded p-1.5 text-muted-foreground hover:bg-accent"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => setToDeactivate(u)}
                          className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-destructive"
                        >
                          <UserX className="size-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs">
                    <span className="rounded bg-secondary px-2 py-0.5 font-medium">
                      {ROLE_LABEL[u.role]}
                    </span>
                    {u.is_active === false && (
                      <span className="rounded bg-destructive/10 px-2 py-0.5 text-destructive">Inactivo</span>
                    )}
                  </div>

                  {w && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Carga: {load} tarea{load === 1 ? '' : 's'} abiertas</span>
                        <span>{w.leads} lidera</span>
                      </div>
                      <Progress value={(load / maxLoad) * 100} className="mt-1.5 h-1.5" />
                      <div className="mt-1.5 flex gap-2 text-[11px] text-muted-foreground">
                        <span>{w.in_progress} en progreso</span>
                        <span>·</span>
                        <span>{w.testing} en pruebas</span>
                        {w.blocked > 0 && (
                          <>
                            <span>·</span>
                            <span className="text-red-500">{w.blocked} bloqueadas</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <UserForm open={formOpen} onOpenChange={setFormOpen} />
      <UserForm open={!!editUser} onOpenChange={(v) => !v && setEditUser(null)} user={editUser ?? undefined} />
      <ConfirmDialog
        open={!!toDeactivate}
        onOpenChange={(v) => !v && setToDeactivate(null)}
        title={`Desactivar a ${toDeactivate?.name}`}
        description="No podrá iniciar sesión. Su historial se conserva."
        confirmLabel="Desactivar"
        destructive
        loading={remove.isPending}
        onConfirm={async () => {
          if (toDeactivate) await remove.mutateAsync(toDeactivate.id)
          setToDeactivate(null)
        }}
      />
    </div>
  )
}

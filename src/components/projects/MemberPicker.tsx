import { UserAvatar } from '@/components/common/UserAvatar'
import { cn } from '@/lib/utils'
import type { User } from '@/lib/types'

export function MemberPicker({
  users,
  selected,
  onChange,
}: {
  users: Pick<User, 'id' | 'name' | 'avatar_color'>[]
  selected: number[]
  onChange: (ids: number[]) => void
}) {
  const toggle = (id: number) =>
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id])

  return (
    <div className="flex flex-wrap gap-2">
      {users.map((u) => {
        const active = selected.includes(u.id)
        return (
          <button
            key={u.id}
            type="button"
            onClick={() => toggle(u.id)}
            className={cn(
              'flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-sm transition-colors',
              active
                ? 'border-primary bg-primary/10 text-foreground'
                : 'text-muted-foreground hover:bg-accent',
            )}
          >
            <UserAvatar name={u.name} color={u.avatar_color} size="xs" />
            {u.name.split(' ')[0]}
          </button>
        )
      })}
      {users.length === 0 && (
        <p className="text-sm text-muted-foreground">No hay usuarios disponibles.</p>
      )}
    </div>
  )
}

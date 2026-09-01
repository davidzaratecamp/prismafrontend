import { Star } from 'lucide-react'
import { toast } from 'sonner'
import { useToggleWatch } from '@/hooks/queries'
import { apiErrorMessage } from '@/lib/api'
import { cn } from '@/lib/utils'

export function WatchToggle({
  projectId,
  watched,
  withLabel = false,
  className,
}: {
  projectId: number
  watched: boolean
  withLabel?: boolean
  className?: string
}) {
  const toggle = useToggleWatch()

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle.mutate(
          { id: projectId, watched: !watched },
          { onError: (err) => toast.error(apiErrorMessage(err)) },
        )
      }}
      title={watched ? 'Dejar de seguir' : 'Seguir este proyecto'}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors',
        watched
          ? 'text-amber-500 hover:bg-amber-500/10'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
        className,
      )}
    >
      <Star className={cn('size-4', watched && 'fill-amber-400')} />
      {withLabel && (watched ? 'Siguiendo' : 'Seguir')}
    </button>
  )
}

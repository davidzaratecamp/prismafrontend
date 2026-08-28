import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import type { KanbanData } from '@/lib/types'
import { expect, test } from 'vitest'

const mk = (id: number, status: KanbanData['todo'][number]['status']) => ({
  id,
  title: `Tarea ${id}`,
  status,
  order_index: 0,
  estimate_points: null,
  module_id: 1,
  module_name: 'Mod',
  project_id: 1,
  project_name: 'Proj',
  project_priority: 'medium' as const,
  area_name: 'Fin',
  area_color: '#10b981',
  assignee_name: 'Ana',
  assignee_color: '#333',
})

const data: KanbanData = {
  todo: [mk(1, 'todo'), mk(2, 'todo')],
  in_progress: [mk(3, 'in_progress')],
  testing: [mk(4, 'testing')],
  blocked: [],
  done: [mk(5, 'done')],
}

test('KanbanBoard renderiza las tarjetas', () => {
  const qc = new QueryClient()
  const { getByText, getAllByText } = render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <TooltipProvider>
          <KanbanBoard data={data} canWrite />
        </TooltipProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  )
  expect(getByText('Tarea 1')).toBeTruthy()
  expect(getByText('Tarea 5')).toBeTruthy()
  expect(getAllByText('Por hacer').length).toBeGreaterThan(0)
})

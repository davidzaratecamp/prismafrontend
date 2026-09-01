import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { expect, test } from 'vitest'
import { projectHealth } from '@/lib/health'
import { PortalProjectCard } from '@/components/portal/PortalProjectCard'
import { AreaStatusGrid } from '@/components/portal/AreaStatusGrid'
import { AttentionList } from '@/components/portal/AttentionList'
import PortalOverviewPage from '@/pages/portal/PortalOverviewPage'
import type { Area, Project } from '@/lib/types'

const area: Area = { id: 1, name: 'Claro TyT', slug: 'claro-tyt', color: '#e11d48', description: null }

function makeProject(over: Partial<Project> = {}): Project {
  return {
    id: 1,
    name: 'Portal de Autogestión',
    description: 'x',
    area_id: 1,
    status: 'in_progress',
    priority: 'high',
    lead_user_id: null,
    repo_url: null,
    start_date: '2026-08-01',
    due_date: '2026-12-01',
    completed_at: null,
    progress_manual: null,
    progress_cached: 45,
    planned_modules_count: null,
    created_at: '2026-08-01',
    updated_at: '2026-08-01',
    archived_at: null,
    lead: null,
    area: { id: 1, name: 'Claro TyT', slug: 'claro-tyt', color: '#e11d48' },
    areas: [{ id: 1, name: 'Claro TyT', slug: 'claro-tyt', color: '#e11d48' }],
    members: [],
    requesters: [],
    module_count: 2,
    task_counts: {},
    ...over,
  }
}

test('projectHealth clasifica correctamente', () => {
  expect(projectHealth({ status: 'completed', due_date: null, progress_cached: 100 }).key).toBe('completed')
  expect(projectHealth({ status: 'blocked', due_date: '2026-12-01', progress_cached: 50 }).key).toBe('attention')
  expect(projectHealth({ status: 'in_progress', due_date: null, progress_cached: 50 }).key).toBe('nodate')
  expect(projectHealth({ status: 'in_progress', due_date: '2000-01-01', progress_cached: 50 }).key).toBe('delayed')
  expect(projectHealth({ status: 'in_progress', due_date: '2999-01-01', progress_cached: 80 }).key).toBe('ontrack')
})

test('componentes del portal renderizan', () => {
  const qc = new QueryClient()
  const projects = [
    makeProject({ id: 1, due_date: '2000-01-01', progress_cached: 20 }),
    makeProject({ id: 2, status: 'completed', progress_cached: 100 }),
  ]
  const { getByText, getAllByText } = render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <PortalProjectCard project={projects[0]} />
        <AreaStatusGrid areas={[area]} projects={projects} />
        <AttentionList projects={projects} />
      </MemoryRouter>
    </QueryClientProvider>,
  )
  expect(getAllByText('Con retraso').length).toBeGreaterThan(0)
  expect(getByText('Requiere atención')).toBeTruthy()
})

test('PortalOverviewPage monta con datos', () => {
  const qc = new QueryClient()
  qc.setQueryData(['areas'], [area])
  qc.setQueryData(
    ['projects', {}],
    [makeProject({ id: 3, due_date: '2000-01-01', progress_cached: 10 })],
  )
  const { getByText, getAllByText } = render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <PortalOverviewPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
  expect(getByText('Estado por área')).toBeTruthy()
  expect(getAllByText('Próximas entregas').length).toBeGreaterThan(0)
})

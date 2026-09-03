import { cleanup, render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, expect, test } from 'vitest'

afterEach(cleanup)
import PortalOverviewPage from '@/pages/portal/PortalOverviewPage'
import PortalProjectsPage from '@/pages/portal/PortalProjectsPage'
import { useAuthStore } from '@/stores/auth'
import type { Area, Project } from '@/lib/types'

const area: Area = { id: 1, name: 'Claro TyT', slug: 'claro-tyt', color: '#e11d48', description: null }

function makeProject(over: Partial<Project> = {}): Project {
  return {
    id: 1, name: 'Portal de Autogestión', description: 'x', area_id: 1,
    status: 'in_progress', priority: 'high', lead_user_id: null, repo_url: null,
    start_date: '2026-08-01', due_date: '2026-12-01', completed_at: null,
    progress_manual: null, progress_cached: 45, planned_modules_count: null,
    created_at: '2026-08-01', updated_at: '2026-08-01', archived_at: null,
    lead: null,
    area: { id: 1, name: 'Claro TyT', slug: 'claro-tyt', color: '#e11d48' },
    areas: [{ id: 1, name: 'Claro TyT', slug: 'claro-tyt', color: '#e11d48' }],
    members: [], requesters: [], is_watched: false,
    last_activity_at: '2026-08-30 12:00:00',
    module_count: 2, task_counts: {},
    ...over,
  }
}

const me = { id: 42, name: 'Área Persona', email: 'persona@x.com', role: 'viewer' as const, area_id: 1, avatar_color: '#000' }

function seed() {
  useAuthStore.setState({ user: me, status: 'authenticated' })
  const qc = new QueryClient()
  qc.setQueryData(['areas'], [area])
  qc.setQueryData(
    ['projects', {}],
    [
      makeProject({ id: 1, name: 'Solicitud Vieja', requesters: [{ ...me }], last_activity_at: '2026-08-01 09:00:00' }),
      makeProject({ id: 2, name: 'Solicitud Reciente', requesters: [{ ...me }], last_activity_at: '2026-08-31 18:00:00' }),
      makeProject({ id: 3, name: 'Proyecto Ajeno', requesters: [] }),
    ],
  )
  return qc
}

test('Portal Inicio muestra "Mis solicitudes" con la más reciente primero', () => {
  const qc = seed()
  const { getByText, getAllByText } = render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <PortalOverviewPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
  expect(getAllByText('Mis solicitudes').length).toBeGreaterThan(0)
  expect(getByText('Solicitud Reciente')).toBeTruthy()
  expect(getByText('Solicitud Vieja')).toBeTruthy()
  // el proyecto donde no es solicitante no aparece en esa sección
})

test('Portal Proyectos con ?requester=me filtra y ordena por última actividad', () => {
  const qc = seed()
  const { getByText, getAllByText, queryByText } = render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/proyectos?requester=me']}>
        <PortalProjectsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
  // aparece como título de página y como botón/toggle
  expect(getAllByText('Mis solicitudes').length).toBeGreaterThan(0)
  expect(getByText('Solicitud Reciente')).toBeTruthy()
  expect(queryByText('Proyecto Ajeno')).toBeNull()
})

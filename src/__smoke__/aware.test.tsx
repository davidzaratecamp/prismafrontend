import { cleanup, render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, expect, test } from 'vitest'
import AwarePage from '@/pages/AwarePage'

afterEach(cleanup)

function wrap(node: React.ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  qc.setQueryData(['aware', 'config'], {
    configured: true,
    min_date: '2026-08-05',
    max_date: '2026-09-03',
    projects: [
      { proyecto_id: 12, name: 'Claro Hogar' },
      { proyecto_id: 13, name: 'Claro TyT' },
    ],
  })
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{node}</MemoryRouter>
    </QueryClientProvider>
  )
}

test('AwarePage monta con sus filtros y pestañas (Select bien formado)', () => {
  const { getByText, getAllByText } = render(wrap(<AwarePage />))
  expect(getByText('Analítica Aware · SOFIA inbound')).toBeTruthy()
  expect(getAllByText('Recorrido').length).toBeGreaterThan(0)
  expect(getAllByText('En vivo').length).toBeGreaterThan(0)
})

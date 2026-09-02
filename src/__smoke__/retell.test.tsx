import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { expect, test } from 'vitest'
import RetellPage from '@/pages/RetellPage'

test('RetellPage monta y renderiza el selector de rango/agente sin errores', () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  qc.setQueryData(['retell', 'config'], { configured: true, sync_status: [] })
  qc.setQueryData(['retell', 'filters', {}], {
    agents: [
      { agent_id: 'a1', agent_name: 'sofia_hogar_agent' },
      { agent_id: 'a2', agent_name: 'sofia_tyt_agent' },
    ],
    date_range: { min: null, max: null },
    call_types: [],
    directions: [],
  })

  const { getByText } = render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <RetellPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )

  // Si el <Select> del encabezado estuviera mal formado (p. ej. SelectLabel
  // fuera de SelectGroup) Radix lanzaría al montar y este render fallaría.
  expect(getByText('Retell IA')).toBeTruthy()
})

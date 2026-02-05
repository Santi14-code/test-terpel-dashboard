'use client'

import { useQuery } from '@tanstack/react-query'
import { useFilterStore } from '@/store/filterStore'

export function useFilteredQuery(endpoint: string) {
  const { criticidad, estados, lineasNegocioPrincipal, lineasNegocio } = useFilterStore()

  const params = new URLSearchParams()
  if (criticidad.length) params.set('criticidad', criticidad.join(','))
  if (estados.length) params.set('estados', estados.join(','))
  if (lineasNegocioPrincipal.length) params.set('lineasPrincipal', lineasNegocioPrincipal.join(','))
  if (lineasNegocio.length) params.set('lineasNegocio', lineasNegocio.join(','))

  const qs = params.toString()
  const url = qs ? `${endpoint}?${qs}` : endpoint

  return useQuery({
    queryKey: [endpoint, qs],
    queryFn: () => fetch(url).then((r) => r.json()),
  })
}

'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface FilterState {
  lineasNegocioPrincipal: number[]
  lineasNegocio: number[]
  criticidad: string[]
  estados: number[]
  dateRange: { from: string | null; to: string | null }
  searchQuery: string
}

interface FilterStore extends FilterState {
  setLineasNegocioPrincipal: (ids: number[]) => void
  setLineasNegocio: (ids: number[]) => void
  setCriticidad: (values: string[]) => void
  setEstados: (ids: number[]) => void
  setDateRange: (range: { from: string | null; to: string | null }) => void
  setSearchQuery: (query: string) => void
  resetFilters: () => void
}

const defaultFilters: FilterState = {
  lineasNegocioPrincipal: [],
  lineasNegocio: [],
  criticidad: [],
  estados: [],
  dateRange: { from: null, to: null },
  searchQuery: '',
}

export const useFilterStore = create<FilterStore>()(
  persist(
    (set) => ({
      ...defaultFilters,
      setLineasNegocioPrincipal: (ids) => set({ lineasNegocioPrincipal: ids, lineasNegocio: [] }),
      setLineasNegocio: (ids) => set({ lineasNegocio: ids }),
      setCriticidad: (values) => set({ criticidad: values }),
      setEstados: (ids) => set({ estados: ids }),
      setDateRange: (range) => set({ dateRange: range }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      resetFilters: () => set(defaultFilters),
    }),
    { name: 'terpel-dashboard-filters' }
  )
)

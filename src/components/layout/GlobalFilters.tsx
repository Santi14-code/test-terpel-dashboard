'use client'

import { useFilterStore } from '@/store/filterStore'
import { useQuery } from '@tanstack/react-query'
import { CRITICALITY_ORDER } from '@/lib/utils'
import { cn } from '@/lib/utils'

export function GlobalFilters() {
  const {
    lineasNegocioPrincipal, setLineasNegocioPrincipal,
    lineasNegocio, setLineasNegocio,
    criticidad, setCriticidad,
    estados, setEstados,
  } = useFilterStore()

  const { data: filterOptions } = useQuery({
    queryKey: ['filter-options'],
    queryFn: () => fetch('/api/filters').then((r) => r.json()),
  })

  const toggleCriticidad = (value: string) => {
    setCriticidad(
      criticidad.includes(value)
        ? criticidad.filter((c) => c !== value)
        : [...criticidad, value]
    )
  }

  return (
    <div className="flex items-center gap-4 px-6 py-2 bg-muted/50 border-t border-border overflow-x-auto">
      <div className="flex items-center gap-2 shrink-0">
        <label className="text-xs font-medium text-muted-foreground">Linea Principal:</label>
        <select
          className="text-xs border border-border rounded px-2 py-1 bg-background"
          value={lineasNegocioPrincipal[0] ?? ''}
          onChange={(e) => {
            const v = e.target.value
            setLineasNegocioPrincipal(v ? [Number(v)] : [])
          }}
        >
          <option value="">Todas</option>
          {filterOptions?.lineasPrincipal?.map((l: { id: number; descripcion: string }) => (
            <option key={l.id} value={l.id}>{l.descripcion}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <label className="text-xs font-medium text-muted-foreground">Tipo Linea:</label>
        <select
          className="text-xs border border-border rounded px-2 py-1 bg-background"
          value={lineasNegocio[0] ?? ''}
          onChange={(e) => {
            const v = e.target.value
            setLineasNegocio(v ? [Number(v)] : [])
          }}
        >
          <option value="">Todas</option>
          {filterOptions?.lineasNegocio
            ?.filter((l: { id_principal: number }) =>
              lineasNegocioPrincipal.length === 0 ||
              lineasNegocioPrincipal.includes(l.id_principal)
            )
            .map((l: { id: number; tipo: string }) => (
              <option key={l.id} value={l.id}>{l.tipo}</option>
            ))}
        </select>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <label className="text-xs font-medium text-muted-foreground">Estado:</label>
        <select
          className="text-xs border border-border rounded px-2 py-1 bg-background"
          value={estados[0] ?? ''}
          onChange={(e) => {
            const v = e.target.value
            setEstados(v ? [Number(v)] : [])
          }}
        >
          <option value="">Todos</option>
          {filterOptions?.estados?.map((e: { id: number; nombre: string }) => (
            <option key={e.id} value={e.id}>{e.nombre}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <label className="text-xs font-medium text-muted-foreground">Criticidad:</label>
        {CRITICALITY_ORDER.map((c) => (
          <button
            key={c}
            onClick={() => toggleCriticidad(c)}
            className={cn(
              'px-2 py-0.5 text-xs rounded-full border transition-colors',
              criticidad.includes(c)
                ? 'bg-primary text-white border-primary'
                : 'border-border text-muted-foreground hover:border-primary/50'
            )}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  )
}

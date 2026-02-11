'use client'

import { Bell, Search, RotateCcw } from 'lucide-react'
import { useFilterStore } from '@/store/filterStore'
import { useAlertStore } from '@/store/alertStore'
import { GlobalFilters } from './GlobalFilters'

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const { searchQuery, setSearchQuery, resetFilters } = useFilterStore()
  const { alerts, togglePanel } = useAlertStore()
  const activeAlerts = alerts.filter((a) => !a.dismissed)

  return (
    <header className="bg-card border-b border-border sticky top-0 z-30">
      <div className="flex items-center justify-between px-6 py-3">
        <div>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar aplicacion, componente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-sm rounded-md border border-border bg-background w-64 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            onClick={resetFilters}
            className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground"
            title="Limpiar Filtros"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={togglePanel}
            className="relative p-2 rounded-md hover:bg-muted transition-colors"
          >
            <Bell size={16} className="text-muted-foreground" />
            {activeAlerts.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                {activeAlerts.length}
              </span>
            )}
          </button>
        </div>
      </div>
      <GlobalFilters />
    </header>
  )
}

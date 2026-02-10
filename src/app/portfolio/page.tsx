'use client'

import { useFilteredQuery } from '@/hooks/useFilteredQuery'
import { Header } from '@/components/layout/Header'
import { KPICard } from '@/components/charts/KPICard'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { CRITICALITY_COLORS, CHART_COLORS, formatNumber } from '@/lib/utils'
import {
  Monitor, Puzzle, Link2, Cloud, Server, AlertTriangle,
  Heart, ChevronUp, ChevronDown,
} from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { useState, useMemo } from 'react'

/* eslint-disable @typescript-eslint/no-explicit-any */

const TABLE_COLUMNS = [
  { key: 'nombre', label: 'Nombre', align: 'left' as const },
  { key: 'criticidad', label: 'Criticidad', align: 'left' as const },
  { key: 'estado', label: 'Estado', align: 'left' as const },
  { key: 'modelo', label: 'Modelo', align: 'left' as const },
  { key: 'proveedor', label: 'Proveedor', align: 'left' as const },
  { key: 'fabricante', label: 'Fabricante', align: 'left' as const },
  { key: 'components', label: 'Componentes', align: 'right' as const },
  { key: 'interfaces', label: 'Interfaces', align: 'right' as const },
  { key: 'score', label: 'Score', align: 'right' as const },
]

export default function PortfolioPage() {
  const { data, isLoading } = useFilteredQuery('/api/dashboard/portfolio')
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState('score')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const filteredInventory = useMemo(() => {
    if (!data?.inventory) return []
    let list = data.inventory.filter((a: any) =>
      [a.nombre, a.proveedor, a.fabricante]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    list = [...list].sort((a: any, b: any) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal
      }
      return sortDir === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal))
    })
    return list
  }, [data?.inventory, search, sortField, sortDir])

  if (isLoading) {
    return (
      <div className="flex-1">
        <Header title="Portafolio de Aplicaciones" />
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card rounded-lg border border-border p-4 h-24 animate-pulse" />
            ))}
          </div>
          <div className="h-96 bg-card rounded-lg animate-pulse" />
        </div>
      </div>
    )
  }

  const kpis = data?.kpis
  const kpiCards = [
    { label: 'Total Aplicaciones', value: formatNumber(kpis?.totalApps ?? 0), icon: Monitor },
    { label: 'Componentes Lógicos', value: formatNumber(kpis?.totalComponents ?? 0), icon: Puzzle },
    { label: 'Interfaces Activas', value: formatNumber(kpis?.totalInterfaces ?? 0), icon: Link2 },
    { label: 'Apps SaaS', value: `${kpis?.saasCount ?? 0} (${kpis?.saasPercent ?? 0}%)`, icon: Cloud },
    { label: 'Apps On-Premise', value: `${kpis?.onPremCount ?? 0} (${kpis?.onPremPercent ?? 0}%)`, icon: Server },
    { label: 'Apps Críticas', value: `${kpis?.criticalCount ?? 0} (${kpis?.criticalPercent ?? 0}%)`, icon: AlertTriangle },
  ]

  const handleSort = (key: string) => {
    if (sortField === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(key)
      setSortDir('desc')
    }
  }

  return (
    <div className="flex-1">
      <Header title="Portafolio de Aplicaciones" />
      <div className="p-6 space-y-6">
        {/* Row 1: KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpiCards.map((kpi) => (
            <KPICard key={kpi.label} label={kpi.label} value={kpi.value} icon={kpi.icon} />
          ))}
        </div>

        {/* Row 2: Three Pie Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartContainer title="Distribución por Criticidad">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.byCriticidad} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" nameKey="name"
                  label={({ name, value }) => `${name}: ${value}`}>
                  {data?.byCriticidad?.map((e: { name: string }, i: number) => (
                    <Cell key={i} fill={CRITICALITY_COLORS[e.name] || CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer title="Distribución por Modelo de Servicio">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.byModelo} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" nameKey="name"
                  label={({ name, value }) => `${name}: ${value}`}>
                  {data?.byModelo?.map((_: unknown, i: number) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer title="Distribución por Estado">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.byEstado} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" nameKey="name"
                  label={({ name, value }) => `${name}: ${value}`}>
                  {data?.byEstado?.map((_: unknown, i: number) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Row 3: Two Bar Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartContainer title="Top 10 Apps por Complejidad" subtitle="Componentes + Interfaces">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.topByComplexity} layout="vertical" margin={{ left: 120 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="nombre" width={115} tick={{ fontSize: 9 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="components" stackId="a" fill="#44546A" name="Componentes" />
                <Bar dataKey="interfaces" stackId="a" fill="#EA352C" name="Interfaces" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer title="Apps Más Integradas" subtitle="Por número de interfaces">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.topByIntegration} layout="vertical" margin={{ left: 120 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="nombre" width={115} tick={{ fontSize: 9 }} />
                <Tooltip />
                <Bar dataKey="interfaces" fill="#17A2B8" name="Interfaces" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Row 4: Apps by Provider */}
        <ChartContainer title="Apps por Fabricante" subtitle="Distribución por proveedor de tecnología">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.byProvider} margin={{ bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" tick={{ fontSize: 9 }} interval={0} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#44546A" name="Aplicaciones" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Row 5: Searchable Sortable Inventory Table */}
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Inventario Completo de Aplicaciones</h3>
            <input
              type="text"
              placeholder="Buscar por nombre, proveedor, fabricante..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-1.5 text-sm border border-border rounded-md bg-background w-80"
            />
          </div>
          <div className="overflow-auto max-h-[500px]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card z-10">
                <tr className="border-b border-border">
                  {TABLE_COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      className={`${col.align === 'right' ? 'text-right' : 'text-left'} p-2 cursor-pointer hover:text-foreground select-none`}
                      onClick={() => handleSort(col.key)}
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        {sortField === col.key && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((app: any) => (
                  <tr key={app.id} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="p-2 font-medium">{app.nombre}</td>
                    <td className="p-2">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{ backgroundColor: CRITICALITY_COLORS[app.criticidad] || '#888', color: '#fff' }}
                      >
                        {app.criticidad}
                      </span>
                    </td>
                    <td className="p-2">{app.estado}</td>
                    <td className="p-2">{app.modelo}</td>
                    <td className="p-2 text-xs">{app.proveedor}</td>
                    <td className="p-2 text-xs">{app.fabricante}</td>
                    <td className="p-2 text-right">{app.components}</td>
                    <td className="p-2 text-right">{app.interfaces}</td>
                    <td className="p-2 text-right font-semibold">{app.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Row 6: Health Metrics */}
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-4">
            <Heart size={16} className="text-primary" />
            <h3 className="font-semibold">Métricas de Salud del Portafolio</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {data?.healthMetrics?.map((metric: { label: string; value: number; suffix: string }, i: number) => (
              <div key={i} className="text-center p-3 rounded-lg bg-muted/30">
                <div className="text-2xl font-bold text-foreground">
                  {metric.value}{metric.suffix}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

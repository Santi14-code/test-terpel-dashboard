'use client'

import { useState } from 'react'
import { useFilteredQuery } from '@/hooks/useFilteredQuery'
import { Header } from '@/components/layout/Header'
import { KPICard } from '@/components/charts/KPICard'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { CRITICALITY_COLORS, formatNumber } from '@/lib/utils'
import {
  Cpu, Layers, AlertTriangle, GitBranch,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip,
} from 'recharts'

/* eslint-disable @typescript-eslint/no-explicit-any */

const HEAT_COLORS = [
  '#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6',
  '#4292c6', '#2171b5', '#08519c', '#08306b',
]

function getHeatColor(value: number, max: number): string {
  if (max === 0 || value === 0) return '#f7fbff'
  const idx = Math.min(Math.floor((value / max) * (HEAT_COLORS.length - 1)), HEAT_COLORS.length - 1)
  return HEAT_COLORS[idx]
}

export default function TechStackAnalyzerPage() {
  const { data, isLoading } = useFilteredQuery('/api/dashboard/tech-stack-analyzer')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  if (isLoading) {
    return (
      <div className="flex-1">
        <Header title="Technology Stack Analyzer" subtitle="Analisis detallado del uso de cada tecnologia en el portafolio" />
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card rounded-lg border border-border p-4 h-24 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const kpis = data?.kpis
  const kpiCards = [
    { label: 'Tecnologias en Uso', value: kpis?.totalTechs ?? 0, icon: Cpu },
    { label: 'Categorias', value: kpis?.totalCategories ?? 0, icon: Layers },
    { label: 'Techs Huerfanas', value: kpis?.orphanCount ?? 0, icon: AlertTriangle, color: 'text-warning' },
    { label: 'Multi-Version', value: kpis?.multiVersionCount ?? 0, icon: GitBranch, color: 'text-info' },
  ]

  const filteredTechTable = categoryFilter === 'all'
    ? data?.techTable
    : data?.techTable?.filter((t: any) => t.category === categoryFilter)

  const categories = ['all', ...new Set(data?.techTable?.map((t: any) => t.category) ?? [])] as string[]

  const heatmap = data?.heatmap
  const heatmapMax = heatmap?.matrix?.flat().reduce((a: number, b: number) => Math.max(a, b), 0) ?? 0

  return (
    <div className="flex-1">
      <Header title="Technology Stack Analyzer" subtitle="Analisis detallado del uso de cada tecnologia en el portafolio" />
      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpiCards.map((kpi) => (
            <KPICard key={kpi.label} label={kpi.label} value={formatNumber(kpi.value)} icon={kpi.icon} color={kpi.color} />
          ))}
        </div>

        {/* Row 2: Category Distribution + Heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartContainer title="Distribucion por Categoria" subtitle="Componentes por categoria de tecnologia">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.categoryDistribution} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={75} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="components" fill="#EA352C" radius={[0, 4, 4, 0]} name="Componentes" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer
            title="Top 10 Tecnologias x Top 10 Aplicaciones"
            subtitle="Componentes por interseccion"
            className="lg:col-span-2"
          >
            {heatmap && heatmap.technologies?.length > 0 ? (
              <div className="overflow-auto h-full flex items-center justify-center">
                <table className="border-collapse text-xs">
                  <thead>
                    <tr>
                      <th className="p-1 text-left text-muted-foreground font-medium" />
                      {heatmap.applications.map((app: string) => (
                        <th key={app} className="p-1 text-center text-muted-foreground font-medium max-w-[80px] truncate" title={app}>
                          <span className="block -rotate-45 origin-bottom-left translate-x-2 whitespace-nowrap">{app}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {heatmap.technologies.map((tech: string, ri: number) => (
                      <tr key={tech}>
                        <td className="p-1 text-right text-muted-foreground font-medium max-w-[140px] truncate pr-2" title={tech}>
                          {tech}
                        </td>
                        {heatmap.matrix[ri].map((val: number, ci: number) => (
                          <td
                            key={ci}
                            className="p-1 text-center font-semibold"
                            style={{
                              backgroundColor: getHeatColor(val, heatmapMax),
                              color: val > heatmapMax * 0.5 ? '#fff' : '#333',
                              minWidth: 36,
                            }}
                          >
                            {val || ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                No hay datos para el heatmap
              </div>
            )}
          </ChartContainer>
        </div>

        {/* Alerts Panel */}
        {(data?.alerts?.orphanTechs?.length > 0 || data?.alerts?.multiVersionTechs?.length > 0 || data?.alerts?.criticalSingleTech?.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.alerts.orphanTechs.length > 0 && (
              <div className="bg-card rounded-lg border border-yellow-500/30 p-4">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-yellow-500" />
                  Tecnologias Huerfanas
                </h4>
                <p className="text-xs text-muted-foreground mb-2">Solo 1 componente las usa</p>
                <ul className="text-xs space-y-1 max-h-32 overflow-auto">
                  {data.alerts.orphanTechs.map((t: any, i: number) => (
                    <li key={i} className="flex justify-between">
                      <span>{t.name}</span>
                      <span className="text-muted-foreground">{t.category}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {data.alerts.multiVersionTechs.length > 0 && (
              <div className="bg-card rounded-lg border border-blue-500/30 p-4">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <GitBranch size={14} className="text-blue-500" />
                  Multiples Versiones
                </h4>
                <p className="text-xs text-muted-foreground mb-2">Tecnologias con mas de 1 version en uso</p>
                <ul className="text-xs space-y-1 max-h-32 overflow-auto">
                  {data.alerts.multiVersionTechs.map((t: any, i: number) => (
                    <li key={i} className="flex justify-between gap-2">
                      <span className="truncate">{t.name}</span>
                      <span className="text-muted-foreground shrink-0">{t.versions.join(', ')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {data.alerts.criticalSingleTech.length > 0 && (
              <div className="bg-card rounded-lg border border-red-500/30 p-4">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-red-500" />
                  Riesgo: App Critica Unica
                </h4>
                <p className="text-xs text-muted-foreground mb-2">Tecnologias en apps criticas sin alternativa</p>
                <ul className="text-xs space-y-1 max-h-32 overflow-auto">
                  {data.alerts.criticalSingleTech.map((t: any, i: number) => (
                    <li key={i}>{t.name} ({t.criticalApps} criticas)</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Technology Table */}
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Inventario de Tecnologias</h3>
              <p className="text-xs text-muted-foreground">Detalle por tecnologia con componentes, aplicaciones y criticidad</p>
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs bg-muted border border-border rounded px-2 py-1"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat === 'all' ? 'Todas las categorias' : cat}</option>
              ))}
            </select>
          </div>
          <div className="overflow-auto max-h-[500px]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border">
                  <th className="text-left p-2">Tecnologia</th>
                  <th className="text-left p-2">Categoria</th>
                  <th className="text-right p-2">Componentes</th>
                  <th className="text-right p-2">Apps</th>
                  <th className="text-right p-2">Apps Criticas</th>
                  <th className="text-left p-2">Max Criticidad</th>
                  <th className="text-left p-2">Versiones</th>
                </tr>
              </thead>
              <tbody>
                {filteredTechTable?.map((tech: any) => (
                  <tr key={tech.id} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="p-2 font-medium">{tech.name}</td>
                    <td className="p-2 text-muted-foreground">{tech.category}</td>
                    <td className="p-2 text-right">{tech.components}</td>
                    <td className="p-2 text-right">{tech.apps}</td>
                    <td className="p-2 text-right">{tech.criticalApps > 0 ? tech.criticalApps : '-'}</td>
                    <td className="p-2">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{ backgroundColor: CRITICALITY_COLORS[tech.maxCriticality] || '#888', color: '#fff' }}
                      >
                        {tech.maxCriticality}
                      </span>
                    </td>
                    <td className="p-2 text-xs text-muted-foreground">
                      {tech.versions.length > 0 ? tech.versions.join(', ') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useFilteredQuery } from '@/hooks/useFilteredQuery'
import { Header } from '@/components/layout/Header'
import { KPICard } from '@/components/charts/KPICard'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { CRITICALITY_COLORS, CHART_COLORS, formatNumber, formatPercent } from '@/lib/utils'
import {
  Monitor, Puzzle, Plug, Cloud, Cpu, Layers,
} from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
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

export default function ExecutiveSummaryPage() {
  const { data, isLoading } = useFilteredQuery('/api/dashboard/executive-summary')

  if (isLoading) {
    return (
      <div className="flex-1">
        <Header title="Executive Summary Dashboard" />
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card rounded-lg border border-border p-4 h-24 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const kpis = data?.kpis
  const kpiCards = [
    { label: 'Aplicaciones', value: `${formatNumber(kpis?.totalApps ?? 0)} (${formatPercent(kpis?.criticalPercent ?? 0, 0)} criticas)`, icon: Monitor },
    { label: 'Componentes Logicos', value: formatNumber(kpis?.totalComponents ?? 0), icon: Puzzle },
    { label: 'Interfaces Activas', value: formatNumber(kpis?.activeInterfaces ?? 0), icon: Plug },
    { label: 'Cloud vs On-Premise', value: formatPercent(kpis?.cloudPercent ?? 0, 0) + ' Cloud', icon: Cloud },
    { label: 'Tecnologias Unicas', value: formatNumber(kpis?.uniqueTechs ?? 0), icon: Cpu },
    { label: 'Cobertura Macroprocesos', value: formatPercent(kpis?.macroprocessCoverage ?? 0, 0), icon: Layers },
  ]

  const heatmap = data?.heatmap
  const heatmapMax = heatmap?.matrix?.flat().reduce((a: number, b: number) => Math.max(a, b), 0) ?? 0

  return (
    <div className="flex-1">
      <Header title="Executive Summary Dashboard" />
      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpiCards.map((kpi) => (
            <KPICard key={kpi.label} label={kpi.label} value={kpi.value} icon={kpi.icon} />
          ))}
        </div>

        {/* Row 2: Criticality Donut + Heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartContainer title="Distribucion por Criticidad" subtitle="Clasificacion de aplicaciones">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.criticality}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value }: any) => `${name}: ${value}`}
                >
                  {data?.criticality?.map((entry: { name: string }, i: number) => (
                    <Cell
                      key={i}
                      fill={CRITICALITY_COLORS[entry.name] || CHART_COLORS[i % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer
            title="Top 5 Macroprocesos x Top 5 Tecnologias"
            subtitle="Cantidad de componentes vinculados"
            className="lg:col-span-2"
          >
            {heatmap && heatmap.macroprocesses?.length > 0 ? (
              <div className="overflow-auto h-full flex items-center justify-center">
                <table className="border-collapse text-xs">
                  <thead>
                    <tr>
                      <th className="p-2 text-left text-muted-foreground font-medium" />
                      {heatmap.technologies.map((tech: string) => (
                        <th key={tech} className="p-2 text-center text-muted-foreground font-medium max-w-[100px] truncate" title={tech}>
                          {tech}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {heatmap.macroprocesses.map((macro: string, ri: number) => (
                      <tr key={macro}>
                        <td className="p-2 text-right text-muted-foreground font-medium max-w-[180px] truncate" title={macro}>
                          {macro}
                        </td>
                        {heatmap.matrix[ri].map((val: number, ci: number) => (
                          <td
                            key={ci}
                            className="p-2 text-center font-semibold rounded"
                            style={{
                              backgroundColor: getHeatColor(val, heatmapMax),
                              color: val > heatmapMax * 0.5 ? '#fff' : '#333',
                              minWidth: 60,
                            }}
                          >
                            {val}
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
      </div>
    </div>
  )
}

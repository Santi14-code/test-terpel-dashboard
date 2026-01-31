'use client'

import { useFilteredQuery } from '@/hooks/useFilteredQuery'
import { Header } from '@/components/layout/Header'
import { KPICard } from '@/components/charts/KPICard'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { CRITICALITY_COLORS, CHART_COLORS, formatNumber } from '@/lib/utils'
import {
  Monitor, Puzzle, Cpu, RefreshCw, ClipboardList, Pin,
} from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts'

export default function HomePage() {
  const { data, isLoading } = useFilteredQuery('/api/dashboard/home')

  if (isLoading) {
    return (
      <div className="flex-1">
        <Header title="Dashboard Principal" />
        <div className="p-6">
          <div className="grid grid-cols-6 gap-4 mb-6">
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
    { label: 'Aplicaciones', value: kpis?.apps ?? 0, icon: Monitor },
    { label: 'Componentes', value: kpis?.componentes ?? 0, icon: Puzzle },
    { label: 'Tecnologias', value: kpis?.tecnologias ?? 0, icon: Cpu },
    { label: 'Macroprocesos', value: kpis?.macroprocesos ?? 0, icon: RefreshCw },
    { label: 'Procesos', value: kpis?.procesos ?? 0, icon: ClipboardList },
    { label: 'Subprocesos', value: kpis?.subprocesos ?? 0, icon: Pin },
  ]

  return (
    <div className="flex-1">
      <Header title="Dashboard Principal" />
      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpiCards.map((kpi) => (
            <KPICard key={kpi.label} label={kpi.label} value={formatNumber(kpi.value)} icon={kpi.icon} />
          ))}
        </div>

        {/* Row 2: Criticality + Top 10 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartContainer title="Criticidad de Aplicaciones" subtitle="Distribucion por nivel">
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
                  label={({ name, value }) => `${name}: ${value}`}
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

          <ChartContainer title="Top 10 Apps por Componentes">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.topAppsByComponents} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={95} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="components" fill="#EA352C" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer title="Tecnologias Mas Utilizadas" subtitle="Top 20">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.techUsage?.slice(0, 10)} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={95} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#44546A" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Row 3: Full-width tech bar */}
        <ChartContainer title="Todas las Tecnologias" subtitle="Top 20 por numero de componentes">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.techUsage} margin={{ bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" tick={{ fontSize: 10 }} interval={0} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#EA352C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Row 4: Macroprocess Coverage */}
        <ChartContainer title="Cobertura de Macroprocesos" subtitle="Subprocesos cubiertos vs sin cobertura" height="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.macroprocessCoverage} margin={{ bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" tick={{ fontSize: 9 }} interval={0} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="covered" stackId="a" fill="#28A745" name="Cubiertos" />
              <Bar dataKey="uncovered" stackId="a" fill="#EA352C" name="Sin cobertura" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  )
}

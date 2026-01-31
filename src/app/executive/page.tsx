'use client'

import { useFilteredQuery } from '@/hooks/useFilteredQuery'
import { Header } from '@/components/layout/Header'
import { KPICard } from '@/components/charts/KPICard'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { CRITICALITY_COLORS, CHART_COLORS, formatNumber, formatCurrency, formatPercent } from '@/lib/utils'
import {
  Monitor, Puzzle, Cpu, DollarSign, AlertTriangle, Cloud, FileText, Target,
} from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts'

export default function ExecutivePage() {
  const { data, isLoading } = useFilteredQuery('/api/dashboard/executive')

  if (isLoading) {
    return (
      <div className="flex-1">
        <Header title="Dashboard Ejecutivo" />
        <div className="p-6">
          <div className="grid grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card rounded-lg border border-border p-4 h-24 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const kpis = data?.kpis
  const kpiCards = [
    { label: 'Aplicaciones', value: formatNumber(kpis?.apps ?? 0), icon: Monitor },
    { label: 'Componentes', value: formatNumber(kpis?.componentes ?? 0), icon: Puzzle },
    { label: 'Tecnologias', value: formatNumber(kpis?.tecnologias ?? 0), icon: Cpu },
    { label: 'TCO Estimado', value: formatCurrency(kpis?.totalTCO ?? 0), icon: DollarSign },
    { label: 'Deuda Tecnica', value: `${kpis?.avgDebt ?? 0}/100`, icon: AlertTriangle },
    { label: 'Cloud Adoption', value: formatPercent(kpis?.cloudAdoption ?? 0, 0), icon: Cloud },
    { label: 'Documentacion', value: formatPercent(kpis?.docCoverage ?? 0, 0), icon: FileText },
    { label: 'Cobertura', value: formatPercent(kpis?.overallCoverage ?? 0, 0), icon: Target },
  ]

  return (
    <div className="flex-1">
      <Header title="Dashboard Ejecutivo" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpiCards.map((kpi) => (
            <KPICard key={kpi.label} label={kpi.label} value={kpi.value} icon={kpi.icon} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartContainer title="Criticidad" subtitle="Distribucion de aplicaciones">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.criticality} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" nameKey="name"
                  label={({ name, value }) => `${name}: ${value}`}>
                  {data?.criticality?.map((entry: { name: string }, i: number) => (
                    <Cell key={i} fill={CRITICALITY_COLORS[entry.name] || CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer title="Modelo de Servicio" subtitle="Distribucion de aplicaciones">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.modelDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" nameKey="name"
                  label={({ name, value }) => `${name}: ${value}`}>
                  {data?.modelDistribution?.map((_: unknown, i: number) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer title="Cobertura por Macroproceso">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.coverageByMacro?.slice(0, 8)} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={95} tick={{ fontSize: 9 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="covered" stackId="a" fill="#28A745" name="Cubiertos" />
                <Bar dataKey="uncovered" stackId="a" fill="#EA352C" name="Sin cobertura" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useFilteredQuery } from '@/hooks/useFilteredQuery'
import { Header } from '@/components/layout/Header'
import { KPICard } from '@/components/charts/KPICard'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { CHART_COLORS } from '@/lib/utils'
import { Activity, Server, AlertTriangle, Layers } from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'

export default function PerformancePage() {
  const { data, isLoading } = useFilteredQuery('/api/dashboard/performance')

  if (isLoading) {
    return (
      <div className="flex-1">
        <Header title="Performance" />
        <div className="p-6"><div className="h-96 bg-card rounded-lg animate-pulse" /></div>
      </div>
    )
  }

  const kpiCards = [
    { label: 'SLA Promedio', value: `${data?.avgSLA ?? 0}%`, icon: Activity },
    { label: 'Despliegues', value: String(data?.totalDeployments ?? 0), icon: Server },
    { label: 'Cuellos Botella', value: String(data?.bottlenecks?.length ?? 0), icon: AlertTriangle },
    { label: 'Plataformas', value: String(data?.platforms?.length ?? 0), icon: Layers },
  ]

  return (
    <div className="flex-1">
      <Header title="Performance" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpiCards.map((kpi) => (
            <KPICard key={kpi.label} label={kpi.label} value={kpi.value} icon={kpi.icon} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartContainer title="Plataformas de Despliegue">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.platforms} layout="vertical" margin={{ left: 120 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={115} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#44546A" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer title="Distribucion por Entorno">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.envDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="count" nameKey="name"
                  label={({ name, value }) => `${name}: ${value}`}>
                  {data?.envDistribution?.map((_: unknown, i: number) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="font-semibold mb-4">Cuellos de Botella</h3>
          <p className="text-sm text-muted-foreground mb-3">Apps con alto acoplamiento y baja redundancia</p>
          <div className="overflow-auto max-h-64">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border">
                  <th className="text-left p-2">Aplicacion</th>
                  <th className="text-left p-2">Criticidad</th>
                  <th className="text-right p-2">Interfaces</th>
                  <th className="text-right p-2">Replicas</th>
                  <th className="text-right p-2">SLA</th>
                </tr>
              </thead>
              <tbody>
                {data?.bottlenecks?.map((b: { name: string; criticidad: string; interfaces: number; replicas: number; syntheticSLA: number }, i: number) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="p-2">{b.name}</td>
                    <td className="p-2">{b.criticidad}</td>
                    <td className="p-2 text-right">{b.interfaces}</td>
                    <td className="p-2 text-right">{b.replicas}</td>
                    <td className="p-2 text-right font-mono">{b.syntheticSLA}%</td>
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

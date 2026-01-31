'use client'

import { useFilteredQuery } from '@/hooks/useFilteredQuery'
import { Header } from '@/components/layout/Header'
import { KPICard } from '@/components/charts/KPICard'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { CRITICALITY_COLORS, CHART_COLORS } from '@/lib/utils'
import { AlertTriangle, TrendingUp, FileText, Layers } from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ScatterChart, Scatter, ZAxis,
} from 'recharts'

export default function TechnicalDebtPage() {
  const { data, isLoading } = useFilteredQuery('/api/dashboard/technical-debt')

  if (isLoading) {
    return (
      <div className="flex-1">
        <Header title="Deuda Tecnica" />
        <div className="p-6"><div className="h-96 bg-card rounded-lg animate-pulse" /></div>
      </div>
    )
  }

  const kpiCards = [
    { label: 'Score Promedio', value: `${data?.averageDebtScore ?? 0}/100`, icon: AlertTriangle },
    { label: 'Apps Criticas', value: String(data?.debtDistribution?.[0]?.value ?? 0), icon: TrendingUp },
    { label: 'Apps Alto', value: String(data?.debtDistribution?.[1]?.value ?? 0), icon: Layers },
    { label: 'Apps Bajo', value: String(data?.debtDistribution?.[3]?.value ?? 0), icon: FileText },
  ]

  return (
    <div className="flex-1">
      <Header title="Deuda Tecnica" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpiCards.map((kpi) => (
            <KPICard key={kpi.label} label={kpi.label} value={kpi.value} icon={kpi.icon} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartContainer title="Distribucion de Deuda">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.debtDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" nameKey="name"
                  label={({ name, value }) => `${name}: ${value}`}>
                  {data?.debtDistribution?.map((e: { color: string }, i: number) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer title="Antiguedad Tecnologica" subtitle="Componentes por categoria">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.techAntiquity?.slice(0, 10)} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="categoria" width={95} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="componentCount" fill="#44546A" name="Componentes" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        <ChartContainer title="Matriz de Priorizacion" subtitle="Score deuda vs componentes" height="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="components" name="Componentes" type="number" />
              <YAxis dataKey="debtScore" name="Score Deuda" type="number" />
              <ZAxis range={[50, 200]} />
              <Tooltip content={({ payload }) => {
                if (!payload?.length) return null
                const d = payload[0].payload
                return (
                  <div className="bg-card border border-border rounded p-2 text-xs">
                    <p className="font-medium">{d.name}</p>
                    <p>Deuda: {d.debtScore}</p>
                    <p>Componentes: {d.components}</p>
                    <p>Criticidad: {d.criticidad}</p>
                  </div>
                )
              }} />
              <Scatter data={data?.prioritizationMatrix} fill="#EA352C">
                {data?.prioritizationMatrix?.map((entry: { criticidad: string }, i: number) => (
                  <Cell key={i} fill={CRITICALITY_COLORS[entry.criticidad] || CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="font-semibold mb-4">Top Aplicaciones por Deuda Tecnica</h3>
          <div className="overflow-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border">
                  <th className="text-left p-2">Nombre</th>
                  <th className="text-left p-2">Criticidad</th>
                  <th className="text-right p-2">Score</th>
                  <th className="text-right p-2">Componentes</th>
                  <th className="text-center p-2">Documentacion</th>
                </tr>
              </thead>
              <tbody>
                {data?.appDebt?.slice(0, 30).map((app: { id: number; nombre: string; criticidad: string; debtScore: number; components: number; hasDocumentation: boolean }) => (
                  <tr key={app.id} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="p-2">{app.nombre}</td>
                    <td className="p-2">
                      <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: CRITICALITY_COLORS[app.criticidad] || '#888', color: '#fff' }}>
                        {app.criticidad}
                      </span>
                    </td>
                    <td className="p-2 text-right font-mono">{app.debtScore}</td>
                    <td className="p-2 text-right">{app.components}</td>
                    <td className="p-2 text-center">{app.hasDocumentation ? 'Si' : 'No'}</td>
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

'use client'

import { useFilteredQuery } from '@/hooks/useFilteredQuery'
import { Header } from '@/components/layout/Header'
import { KPICard } from '@/components/charts/KPICard'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { CRITICALITY_COLORS, CHART_COLORS } from '@/lib/utils'
import { ShieldAlert, AlertTriangle, Database, Lock } from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  ScatterChart, Scatter, ZAxis, XAxis, YAxis, CartesianGrid,
} from 'recharts'

export default function RisksPage() {
  const { data, isLoading } = useFilteredQuery('/api/dashboard/risks')

  if (isLoading) {
    return (
      <div className="flex-1">
        <Header title="Riesgos y Cumplimiento" />
        <div className="p-6"><div className="h-96 bg-card rounded-lg animate-pulse" /></div>
      </div>
    )
  }

  const kpiCards = [
    { label: 'Riesgo Critico', value: String(data?.riskDistribution?.[0]?.value ?? 0), icon: ShieldAlert },
    { label: 'SPOFs', value: String(data?.spofs?.length ?? 0), icon: AlertTriangle },
    { label: 'Datos Personales', value: String(data?.personalDataApps?.length ?? 0), icon: Database },
    { label: 'Sin Redundancia', value: String(data?.criticalWithoutRedundancy?.length ?? 0), icon: Lock },
  ]

  return (
    <div className="flex-1">
      <Header title="Riesgos y Cumplimiento" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpiCards.map((kpi) => (
            <KPICard key={kpi.label} label={kpi.label} value={kpi.value} icon={kpi.icon} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartContainer title="Distribucion de Riesgo">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.riskDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" nameKey="name"
                  label={({ name, value }) => `${name}: ${value}`}>
                  {data?.riskDistribution?.map((e: { color: string }, i: number) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer title="Matriz de Riesgo" subtitle="Criticidad vs Acoplamiento">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="couplingScore" name="Acoplamiento" type="number" domain={[0, 10]} />
                <YAxis dataKey="critScore" name="Criticidad" type="number" domain={[0, 4]} />
                <ZAxis dataKey="riskLevel" range={[30, 300]} name="Nivel Riesgo" />
                <Tooltip content={({ payload }) => {
                  if (!payload?.length) return null
                  const d = payload[0].payload
                  return (
                    <div className="bg-card border border-border rounded p-2 text-xs">
                      <p className="font-medium">{d.name}</p>
                      <p>Riesgo: {d.riskLevel}</p>
                      <p>Criticidad: {d.criticidad}</p>
                    </div>
                  )
                }} />
                <Scatter data={data?.riskMatrix}>
                  {data?.riskMatrix?.map((e: { criticidad: string }, i: number) => (
                    <Cell key={i} fill={CRITICALITY_COLORS[e.criticidad] || CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="font-semibold mb-4">Puntos Unicos de Falla (SPOF)</h3>
          <div className="overflow-auto max-h-64">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border">
                  <th className="text-left p-2">Aplicacion</th>
                  <th className="text-left p-2">Criticidad</th>
                  <th className="text-right p-2">Componentes</th>
                  <th className="text-right p-2">Despliegues</th>
                </tr>
              </thead>
              <tbody>
                {data?.spofs?.map((s: { name: string; criticidad: string; components: number; deployments: number }, i: number) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="p-2">{s.name}</td>
                    <td className="p-2">
                      <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: CRITICALITY_COLORS[s.criticidad || ''] || '#888', color: '#fff' }}>
                        {s.criticidad}
                      </span>
                    </td>
                    <td className="p-2 text-right">{s.components}</td>
                    <td className="p-2 text-right">{s.deployments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="font-semibold mb-4">Componentes con Datos Personales</h3>
          <div className="overflow-auto max-h-64">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border">
                  <th className="text-left p-2">Componente</th>
                  <th className="text-left p-2">Aplicacion</th>
                  <th className="text-left p-2">Criticidad</th>
                  <th className="text-right p-2">Consumidores</th>
                </tr>
              </thead>
              <tbody>
                {data?.personalDataApps?.map((p: { component: string; app: string; criticidad: string; consumedBy: number }, i: number) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="p-2">{p.component}</td>
                    <td className="p-2">{p.app}</td>
                    <td className="p-2">
                      <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: CRITICALITY_COLORS[p.criticidad || ''] || '#888', color: '#fff' }}>
                        {p.criticidad}
                      </span>
                    </td>
                    <td className="p-2 text-right">{p.consumedBy}</td>
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

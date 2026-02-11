'use client'

import { useFilteredQuery } from '@/hooks/useFilteredQuery'
import { Header } from '@/components/layout/Header'
import { KPICard } from '@/components/charts/KPICard'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { CRITICALITY_COLORS, CHART_COLORS } from '@/lib/utils'
import { RefreshCw, Clock, GitBranch, Activity } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip,
  BarChart, Bar,
  ScatterChart, Scatter, ZAxis, Cell,
} from 'recharts'

export default function ChangePage() {
  const { data, isLoading } = useFilteredQuery('/api/dashboard/change')

  if (isLoading) {
    return (
      <div className="flex-1">
        <Header title="Gestion del Cambio" />
        <div className="p-6"><div className="h-96 bg-card rounded-lg animate-pulse" /></div>
      </div>
    )
  }

  const kpiCards = [
    { label: 'Cambios Recientes', value: String(data?.recentChanges?.length ?? 0), icon: RefreshCw },
    { label: 'Apps Volatiles', value: String(data?.volatileApps?.length ?? 0), icon: Activity },
    { label: 'Meses Actividad', value: String(data?.changeTimeline?.length ?? 0), icon: Clock },
    { label: 'Apps Monitoreadas', value: String(data?.changesVsComplexity?.length ?? 0), icon: GitBranch },
  ]

  return (
    <div className="flex-1">
      <Header title="Gestion del Cambio" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpiCards.map((kpi) => (
            <KPICard key={kpi.label} label={kpi.label} value={kpi.value} icon={kpi.icon} />
          ))}
        </div>

        <ChartContainer title="Linea de Tiempo de Cambios" subtitle="Componentes modificados por mes">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.changeTimeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="changes" stroke="#EA352C" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartContainer title="Apps Mas Volatiles">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.volatileApps?.slice(0, 10)} layout="vertical" margin={{ left: 120 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={115} tick={{ fontSize: 9 }} />
                <Tooltip />
                <Bar dataKey="daysSinceModification" fill="#EA352C" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer title="Complejidad vs Cambios">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="components" name="Componentes" type="number" />
                <YAxis dataKey="daysSinceChange" name="Dias" type="number" />
                <ZAxis dataKey="interfaces" range={[30, 200]} name="Interfaces" />
                <Tooltip content={({ payload }) => {
                  if (!payload?.length) return null
                  const d = payload[0].payload
                  return (
                    <div className="bg-card border border-border rounded p-2 text-xs">
                      <p className="font-medium">{d.name}</p>
                      <p>Componentes: {d.components}</p>
                      <p>Dias: {d.daysSinceChange}</p>
                    </div>
                  )
                }} />
                <Scatter data={data?.changesVsComplexity}>
                  {data?.changesVsComplexity?.map((e: { criticidad: string }, i: number) => (
                    <Cell key={i} fill={CRITICALITY_COLORS[e.criticidad] || CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="font-semibold mb-4">Cambios Recientes</h3>
          <div className="overflow-auto max-h-64">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border">
                  <th className="text-left p-2">Aplicacion</th>
                  <th className="text-left p-2">Criticidad</th>
                  <th className="text-right p-2">Componentes</th>
                  <th className="text-left p-2">Ultima Modificacion</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentChanges?.map((c: { name: string; criticidad: string; components: number; lastModified: string }, i: number) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="p-2">{c.name}</td>
                    <td className="p-2">
                      <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: CRITICALITY_COLORS[c.criticidad || ''] || '#888', color: '#fff' }}>
                        {c.criticidad}
                      </span>
                    </td>
                    <td className="p-2 text-right">{c.components}</td>
                    <td className="p-2 text-muted-foreground">{new Date(c.lastModified).toLocaleDateString('es-CO')}</td>
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

'use client'

import { useFilteredQuery } from '@/hooks/useFilteredQuery'
import { Header } from '@/components/layout/Header'
import { KPICard } from '@/components/charts/KPICard'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { CRITICALITY_COLORS, CHART_COLORS, formatCurrency } from '@/lib/utils'
import { DollarSign, Server, Cloud, Layers } from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts'

export default function CostsPage() {
  const { data, isLoading } = useFilteredQuery('/api/dashboard/costs')

  if (isLoading) {
    return (
      <div className="flex-1">
        <Header title="Optimizacion de Costos" />
        <div className="p-6"><div className="h-96 bg-card rounded-lg animate-pulse" /></div>
      </div>
    )
  }

  const kpiCards = [
    { label: 'TCO Total', value: formatCurrency(data?.totalTCO ?? 0), icon: DollarSign },
    { label: 'Plataformas', value: String(data?.platforms?.length ?? 0), icon: Server },
    { label: 'Entornos', value: String(data?.environments?.length ?? 0), icon: Cloud },
    { label: 'Modelos', value: String(data?.tcoByModel?.length ?? 0), icon: Layers },
  ]

  return (
    <div className="flex-1">
      <Header title="Optimizacion de Costos" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpiCards.map((kpi) => (
            <KPICard key={kpi.label} label={kpi.label} value={kpi.value} icon={kpi.icon} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartContainer title="TCO por Modelo de Servicio">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.tcoByModel}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Legend />
                <Bar dataKey="tco" fill="#EA352C" name="TCO Estimado" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer title="TCO por Criticidad">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.tcoByCriticidad} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="tco" nameKey="name"
                  label={({ name }) => name}>
                  {data?.tcoByCriticidad?.map((e: { name: string }, i: number) => (
                    <Cell key={i} fill={CRITICALITY_COLORS[e.name] || CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartContainer title="Plataformas">
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
                <Pie data={data?.environments} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="count" nameKey="name"
                  label={({ name, value }) => `${name}: ${value}`}>
                  {data?.environments?.map((_: unknown, i: number) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="font-semibold mb-4">Top Aplicaciones por TCO</h3>
          <div className="overflow-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border">
                  <th className="text-left p-2">Nombre</th>
                  <th className="text-left p-2">Modelo</th>
                  <th className="text-left p-2">Criticidad</th>
                  <th className="text-right p-2">Componentes</th>
                  <th className="text-right p-2">TCO Estimado</th>
                </tr>
              </thead>
              <tbody>
                {data?.appTCO?.map((a: { name: string; modelo: string; criticidad: string; components: number; tco: number }, i: number) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="p-2">{a.name}</td>
                    <td className="p-2">{a.modelo}</td>
                    <td className="p-2">
                      <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: CRITICALITY_COLORS[a.criticidad] || '#888', color: '#fff' }}>
                        {a.criticidad}
                      </span>
                    </td>
                    <td className="p-2 text-right">{a.components}</td>
                    <td className="p-2 text-right font-mono">{formatCurrency(a.tco)}</td>
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

'use client'

import { useFilteredQuery } from '@/hooks/useFilteredQuery'
import { Header } from '@/components/layout/Header'
import { KPICard } from '@/components/charts/KPICard'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { CRITICALITY_COLORS } from '@/lib/utils'
import { Layers, AlertTriangle, BarChart3, Maximize2 } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip,
} from 'recharts'

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function CapabilityFragmentationPage() {
  const { data, isLoading } = useFilteredQuery('/api/dashboard/capability-fragmentation')

  if (isLoading) {
    return (
      <div className="flex-1">
        <Header title="Capability Fragmentation Report" subtitle="Identificar capacidades servidas por multiples aplicaciones" />
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
    { label: 'Capacidades Totales', value: kpis?.totalCapabilities ?? 0, icon: Layers },
    { label: 'Fragmentadas', value: kpis?.fragmentedCount ?? 0, icon: AlertTriangle, color: 'text-warning' },
    { label: 'Promedio Apps/Cap', value: kpis?.avgAppsPerCapability ?? 0, icon: BarChart3 },
    { label: 'Max Fragmentacion', value: `${kpis?.maxFragmented ?? 0} apps`, icon: Maximize2, color: 'text-danger' },
  ]

  return (
    <div className="flex-1">
      <Header title="Capability Fragmentation Report" subtitle="Identificar capacidades servidas por multiples aplicaciones" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpiCards.map((kpi) => (
            <KPICard key={kpi.label} label={kpi.label} value={String(kpi.value)} icon={kpi.icon} color={kpi.color} />
          ))}
        </div>

        <ChartContainer title="Capacidades con Mayor Fragmentacion" subtitle="Numero de aplicaciones por capacidad (top 15)" height="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.barChart} layout="vertical" margin={{ left: 160 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={155} tick={{ fontSize: 10 }} />
              <Tooltip
                content={({ payload }) => {
                  if (!payload?.length) return null
                  const d = payload[0].payload
                  return (
                    <div className="bg-card border border-border rounded p-2 text-xs">
                      <p className="font-semibold">{d.fullName}</p>
                      <p className="text-muted-foreground">{d.parent}</p>
                      <p>{d.apps} aplicaciones</p>
                    </div>
                  )
                }}
              />
              <Bar dataKey="apps" fill="#EA352C" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="font-semibold mb-1">Detalle de Fragmentacion</h3>
          <p className="text-xs text-muted-foreground mb-4">Capacidades servidas por multiples aplicaciones — oportunidades de consolidacion</p>
          <div className="overflow-auto max-h-[500px]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border">
                  <th className="text-left p-2">Capacidad</th>
                  <th className="text-left p-2">Capacidad Padre</th>
                  <th className="text-right p-2"># Apps</th>
                  <th className="text-left p-2">Aplicaciones</th>
                  <th className="text-left p-2">Tecnologias</th>
                </tr>
              </thead>
              <tbody>
                {data?.fragmentation?.map((f: any, i: number) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/50 align-top">
                    <td className="p-2 font-medium">{f.capability}</td>
                    <td className="p-2 text-muted-foreground">{f.parentCapability}</td>
                    <td className="p-2 text-right">{f.apps.length}</td>
                    <td className="p-2">
                      <div className="flex flex-wrap gap-1">
                        {f.apps.map((a: any, j: number) => (
                          <span
                            key={j}
                            className="px-1.5 py-0.5 rounded text-xs font-medium"
                            style={{ backgroundColor: (CRITICALITY_COLORS[a.criticidad] || '#888') + '33', color: CRITICALITY_COLORS[a.criticidad] || '#888' }}
                          >
                            {a.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-2 text-xs text-muted-foreground">{f.technologies.join(', ')}</td>
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

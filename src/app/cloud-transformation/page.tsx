'use client'

import { useFilteredQuery } from '@/hooks/useFilteredQuery'
import { Header } from '@/components/layout/Header'
import { KPICard } from '@/components/charts/KPICard'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { CRITICALITY_COLORS, CHART_COLORS, formatPercent } from '@/lib/utils'
import { Cloud, Server, Target, TrendingUp } from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'

/* eslint-disable @typescript-eslint/no-explicit-any */

const MODEL_COLORS: Record<string, string> = {
  SaaS: '#28A745',
  PaaS: '#17A2B8',
  IaaS: '#6F42C1',
  'On-Premise': '#EA352C',
}

export default function CloudTransformationPage() {
  const { data, isLoading } = useFilteredQuery('/api/dashboard/cloud-transformation')

  if (isLoading) {
    return (
      <div className="flex-1">
        <Header title="Cloud Transformation Tracker" subtitle="Progreso de la estrategia cloud-first y distribución por plataforma" />
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
    { label: 'Apps Cloud', value: kpis?.cloudApps ?? 0, icon: Cloud, color: 'text-success' },
    { label: 'Apps On-Premise', value: kpis?.onPremApps ?? 0, icon: Server },
    { label: 'Adopción Cloud', value: formatPercent(kpis?.cloudPercent ?? 0, 0), icon: TrendingUp },
    { label: 'Gap vs Meta', value: `${kpis?.gap ?? 0}pp`, icon: Target, color: kpis?.gap > 0 ? 'text-warning' : 'text-success' },
  ]

  const progressPercent = kpis?.cloudPercent ?? 0
  const targetPercent = kpis?.cloudTarget ?? 80

  return (
    <div className="flex-1">
      <Header title="Cloud Transformation Tracker" subtitle="Progreso de la estrategia cloud-first y distribución por plataforma" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpiCards.map((kpi) => (
            <KPICard key={kpi.label} label={kpi.label} value={String(kpi.value)} icon={kpi.icon} color={kpi.color} />
          ))}
        </div>

        {/* Progress bar */}
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold">Meta Cloud {targetPercent}%</h3>
            <span className="text-sm font-semibold">{progressPercent}% actual</span>
          </div>
          <div className="relative w-full h-6 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(progressPercent, 100)}%`,
                backgroundColor: progressPercent >= targetPercent ? '#28A745' : '#17A2B8',
              }}
            />
            <div
              className="absolute top-0 h-full w-0.5 bg-yellow-400"
              style={{ left: `${targetPercent}%` }}
              title={`Meta: ${targetPercent}%`}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0%</span>
            <span className="text-yellow-400">Meta {targetPercent}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Row 2: Donut + Stacked bar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartContainer title="Distribución por Modelo de Servicio" subtitle="Cloud (SaaS/PaaS/IaaS) vs On-Premise">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.modelDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" nameKey="name"
                  label={({ name, value }: any) => `${name}: ${value}`}>
                  {data?.modelDistribution?.map((e: any, i: number) => (
                    <Cell key={i} fill={MODEL_COLORS[e.name] || CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer title="Distribución por Plataforma" subtitle="Segmentado por criticidad de aplicaciones" height="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.platformDistribution} margin={{ bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="platform" angle={-35} textAnchor="end" tick={{ fontSize: 10 }} interval={0} />
                <YAxis />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Crítica" stackId="a" fill={CRITICALITY_COLORS['Crítica']} />
                <Bar dataKey="Alta" stackId="a" fill={CRITICALITY_COLORS['Alta']} />
                <Bar dataKey="Media" stackId="a" fill={CRITICALITY_COLORS['Media']} />
                <Bar dataKey="Baja" stackId="a" fill={CRITICALITY_COLORS['Baja']} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* On-prem critical apps */}
        {data?.onPremCritical?.length > 0 && (
          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="font-semibold mb-1">Aplicaciones On-Premise Críticas</h3>
            <p className="text-xs text-muted-foreground mb-4">Candidatas prioritarias para migración cloud</p>
            <div className="overflow-auto max-h-64">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card">
                  <tr className="border-b border-border">
                    <th className="text-left p-2">Aplicación</th>
                    <th className="text-left p-2">Criticidad</th>
                    <th className="text-left p-2">Modelo Actual</th>
                  </tr>
                </thead>
                <tbody>
                  {data.onPremCritical.map((app: any, i: number) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="p-2 font-medium">{app.name}</td>
                      <td className="p-2">
                        <span className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{ backgroundColor: CRITICALITY_COLORS[app.criticidad] || '#888', color: '#fff' }}>
                          {app.criticidad}
                        </span>
                      </td>
                      <td className="p-2">{app.model}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

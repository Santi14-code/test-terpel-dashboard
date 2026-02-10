'use client'

import { useFilteredQuery } from '@/hooks/useFilteredQuery'
import { Header } from '@/components/layout/Header'
import { KPICard } from '@/components/charts/KPICard'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { CRITICALITY_COLORS, CHART_COLORS, formatPercent } from '@/lib/utils'
import { Database, ShieldAlert, Cloud, UserX } from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from 'recharts'

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function DataPrivacyPage() {
  const { data, isLoading } = useFilteredQuery('/api/dashboard/data-privacy')

  if (isLoading) {
    return (
      <div className="flex-1">
        <Header title="Data Privacy & Compliance Tracker" subtitle="Seguimiento de componentes que manejan datos personales" />
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-card rounded-lg border border-border p-4 h-24 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const kpis = data?.kpis
  const kpiCards = [
    { label: 'Componentes con DP', value: kpis?.componentsWithPD ?? 0, icon: Database },
    { label: 'Apps con DP', value: kpis?.appsWithPD ?? 0, icon: Database },
    { label: 'Apps Criticas con DP', value: kpis?.criticalAppsWithPD ?? 0, icon: ShieldAlert, color: 'text-danger' },
    { label: 'En Cloud', value: formatPercent(kpis?.cloudPercent ?? 0, 0), icon: Cloud },
    { label: 'Sin Responsable', value: kpis?.noResponsible ?? 0, icon: UserX, color: 'text-warning' },
  ]

  return (
    <div className="flex-1">
      <Header title="Data Privacy & Compliance Tracker" subtitle="Seguimiento de componentes que manejan datos personales" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {kpiCards.map((kpi) => (
            <KPICard key={kpi.label} label={kpi.label} value={String(kpi.value)} icon={kpi.icon} color={kpi.color} />
          ))}
        </div>

        {/* Row 2: Charts + Risk Flags */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartContainer title="Por Modelo de Servicio" subtitle="Componentes con datos personales">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.modelDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" nameKey="name"
                  label={({ name, value }: any) => `${name}: ${value}`}>
                  {data?.modelDistribution?.map((_: any, i: number) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer title="Por Criticidad de App" subtitle="Apps con datos personales">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.critDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" nameKey="name"
                  label={({ name, value }: any) => `${name}: ${value}`}>
                  {data?.critDistribution?.map((e: any, i: number) => (
                    <Cell key={i} fill={CRITICALITY_COLORS[e.name] || CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>

          <div className="space-y-4">
            <div className="bg-card rounded-lg border border-red-500/30 p-4">
              <h4 className="text-sm font-semibold mb-3">Indicadores de Riesgo</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Datos personales en cloud</span>
                  <span className="font-semibold text-orange-400">{data?.risks?.cloudWithPD ?? 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Criticas sin responsable</span>
                  <span className="font-semibold text-red-400">{data?.risks?.criticalNoResponsible ?? 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Alta exposicion (&gt;3 consumidores)</span>
                  <span className="font-semibold text-yellow-400">{data?.risks?.highExposure ?? 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detail table */}
        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="font-semibold mb-1">Componentes con Datos Personales</h3>
          <p className="text-xs text-muted-foreground mb-4">Detalle de cada componente que maneja datos personales</p>
          <div className="overflow-auto max-h-[500px]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border">
                  <th className="text-left p-2">Componente</th>
                  <th className="text-left p-2">Aplicacion</th>
                  <th className="text-left p-2">Criticidad</th>
                  <th className="text-left p-2">Modelo</th>
                  <th className="text-left p-2">Tecnologia</th>
                  <th className="text-left p-2">Responsable</th>
                  <th className="text-left p-2">Plataformas</th>
                  <th className="text-right p-2">Consumidores</th>
                </tr>
              </thead>
              <tbody>
                {data?.detailTable?.map((row: any, i: number) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="p-2 font-medium">{row.component}</td>
                    <td className="p-2">{row.app}</td>
                    <td className="p-2">
                      <span className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{ backgroundColor: CRITICALITY_COLORS[row.criticidad] || '#888', color: '#fff' }}>
                        {row.criticidad}
                      </span>
                    </td>
                    <td className="p-2">{row.model}</td>
                    <td className="p-2 text-muted-foreground">{row.technology}</td>
                    <td className="p-2">{row.responsible === 'Sin asignar'
                      ? <span className="text-red-400">{row.responsible}</span>
                      : row.responsible}
                    </td>
                    <td className="p-2 text-xs text-muted-foreground">{row.platforms.join(', ') || '-'}</td>
                    <td className="p-2 text-right">{row.consumers}</td>
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

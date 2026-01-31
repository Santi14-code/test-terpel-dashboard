'use client'

import { useFilteredQuery } from '@/hooks/useFilteredQuery'
import { Header } from '@/components/layout/Header'
import { KPICard } from '@/components/charts/KPICard'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { CHART_COLORS, formatPercent } from '@/lib/utils'
import { Target, Monitor, Layers } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ZAxis, Cell,
} from 'recharts'

export default function AlignmentPage() {
  const { data, isLoading } = useFilteredQuery('/api/dashboard/alignment')

  if (isLoading) {
    return (
      <div className="flex-1">
        <Header title="Alineacion Negocio-TI" />
        <div className="p-6"><div className="h-96 bg-card rounded-lg animate-pulse" /></div>
      </div>
    )
  }

  const kpiCards = [
    { label: 'Cobertura Global', value: formatPercent(data?.overallCoverage ?? 0, 0), icon: Target },
    { label: 'Total Apps', value: String(data?.totalApps ?? 0), icon: Monitor },
    { label: 'Capacidades', value: String(data?.capabilityROI?.length ?? 0), icon: Layers },
  ]

  return (
    <div className="flex-1">
      <Header title="Alineacion Negocio-TI" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {kpiCards.map((kpi) => (
            <KPICard key={kpi.label} label={kpi.label} value={kpi.value} icon={kpi.icon} />
          ))}
        </div>

        <ChartContainer title="Cobertura por Macroproceso" subtitle="Radar de cobertura" height="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data?.radarData?.slice(0, 12)}>
              <PolarGrid />
              <PolarAngleAxis dataKey="macroproceso" tick={{ fontSize: 8 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Cobertura %" dataKey="coverage" stroke="#EA352C" fill="#EA352C" fillOpacity={0.3} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartContainer title="Cobertura Detallada">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.radarData} layout="vertical" margin={{ left: 120 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="macroproceso" width={115} tick={{ fontSize: 8 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="covered" stackId="a" fill="#28A745" name="Cubiertos" />
                <Bar dataKey="total" fill="#E5E7EB" name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer title="ROI por Capacidad" subtitle="Apps vs Subprocesos">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subprocesses" name="Subprocesos" type="number" />
                <YAxis dataKey="apps" name="Apps" type="number" />
                <ZAxis range={[50, 200]} />
                <Tooltip content={({ payload }) => {
                  if (!payload?.length) return null
                  const d = payload[0].payload
                  return (
                    <div className="bg-card border border-border rounded p-2 text-xs">
                      <p className="font-medium">{d.name}</p>
                      <p>Apps: {d.apps}</p>
                      <p>Subprocesos: {d.subprocesses}</p>
                    </div>
                  )
                }} />
                <Scatter data={data?.capabilityROI}>
                  {data?.capabilityROI?.map((_: unknown, i: number) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>
    </div>
  )
}

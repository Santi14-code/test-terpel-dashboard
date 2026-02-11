'use client'

import { useFilteredQuery } from '@/hooks/useFilteredQuery'
import { Header } from '@/components/layout/Header'
import { KPICard } from '@/components/charts/KPICard'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { CRITICALITY_COLORS, CHART_COLORS, formatPercent } from '@/lib/utils'
import { Building2, AlertTriangle, Percent, Users } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, Legend, Treemap,
} from 'recharts'

/* eslint-disable @typescript-eslint/no-explicit-any */

function TreemapContent({ x, y, width, height, name, criticalPercent }: any) {
  if (width < 30 || height < 20) return null
  // Color: red if high critical%, green if low
  const r = Math.min(255, Math.round(criticalPercent * 2.55))
  const g = Math.min(255, Math.round((100 - criticalPercent) * 1.5))
  const fill = `rgb(${r}, ${g}, 80)`
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} stroke="#fff" strokeWidth={2} rx={3} fillOpacity={0.85} />
      {width > 50 && height > 30 && (
        <>
          <text x={x + width / 2} y={y + height / 2 - 6} textAnchor="middle" fontSize={11} fill="#fff" fontWeight={600}>
            {name?.length > Math.floor(width / 7) ? name.slice(0, Math.floor(width / 7)) + '...' : name}
          </text>
          <text x={x + width / 2} y={y + height / 2 + 10} textAnchor="middle" fontSize={9} fill="#fff" fillOpacity={0.8}>
            {criticalPercent}% críticas
          </text>
        </>
      )}
    </g>
  )
}

export default function VendorConcentrationPage() {
  const { data, isLoading } = useFilteredQuery('/api/dashboard/vendor-concentration')

  if (isLoading) {
    return (
      <div className="flex-1">
        <Header title="Vendor Concentration Dashboard" subtitle="Evaluar riesgos de dependencia excesiva de proveedores" />
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
    { label: 'Proveedores', value: kpis?.totalVendors ?? 0, icon: Building2 },
    { label: 'Aplicaciones', value: kpis?.totalApps ?? 0, icon: Users },
    { label: 'Vendors Alto Riesgo', value: kpis?.highRiskVendors ?? 0, icon: AlertTriangle, color: 'text-danger' },
    { label: 'Concentración Top 1', value: formatPercent(kpis?.concentrationIndex ?? 0, 0), icon: Percent },
  ]

  return (
    <div className="flex-1">
      <Header title="Vendor Concentration Dashboard" subtitle="Evaluar riesgos de dependencia excesiva de proveedores" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpiCards.map((kpi) => (
            <KPICard key={kpi.label} label={kpi.label} value={String(kpi.value)} icon={kpi.icon} color={kpi.color} />
          ))}
        </div>

        {/* Treemap */}
        {data?.treemapData?.length > 0 && (
          <ChartContainer title="Mapa de Concentración por Proveedor" subtitle="Tamaño = # apps | Color = % apps criticas (rojo = alto)" height="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <Treemap data={data.treemapData} dataKey="value" nameKey="name"
                content={<TreemapContent />}>
                <Tooltip content={({ payload }) => {
                  if (!payload?.length) return null
                  const d = payload[0].payload
                  return (
                    <div className="bg-card border border-border rounded p-2 text-xs">
                      <p className="font-semibold">{d.name}</p>
                      <p>{d.value} aplicaciones</p>
                      <p>{d.criticalPercent}% críticas</p>
                    </div>
                  )
                }} />
              </Treemap>
            </ResponsiveContainer>
          </ChartContainer>
        )}

        {/* Bar chart */}
        <ChartContainer title="Top 10 Proveedores" subtitle="Aplicaciones totales vs criticas y altas" height="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.barChart} layout="vertical" margin={{ left: 120 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={115} tick={{ fontSize: 10 }} />
              <Tooltip content={({ payload }) => {
                if (!payload?.length) return null
                const d = payload[0].payload
                return (
                  <div className="bg-card border border-border rounded p-2 text-xs">
                    <p className="font-semibold">{d.fullName}</p>
                    <p>Total: {d.totalApps} | Críticas: {d.criticalApps} | Altas: {d.highApps}</p>
                    <p>Componentes: {d.components}</p>
                  </div>
                )
              }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="criticalApps" stackId="a" fill={CRITICALITY_COLORS['Crítica']} name="Críticas" />
              <Bar dataKey="highApps" stackId="a" fill={CRITICALITY_COLORS['Alta']} name="Altas" />
              <Bar dataKey="totalApps" fill={CHART_COLORS[2]} name="Total Apps" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* High risk vendors */}
        {data?.highRiskVendors?.length > 0 && (
          <div className="bg-card rounded-lg border border-red-500/30 p-4">
            <h3 className="font-semibold mb-1">Proveedores de Alto Riesgo</h3>
            <p className="text-xs text-muted-foreground mb-4">Vendors con 30% o más de apps críticas</p>
            <div className="overflow-auto max-h-64">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card">
                  <tr className="border-b border-border">
                    <th className="text-left p-2">Proveedor</th>
                    <th className="text-right p-2">Apps Totales</th>
                    <th className="text-right p-2">Apps Críticas</th>
                    <th className="text-right p-2">% Críticas</th>
                  </tr>
                </thead>
                <tbody>
                  {data.highRiskVendors.map((v: any, i: number) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="p-2 font-medium">{v.name}</td>
                      <td className="p-2 text-right">{v.totalApps}</td>
                      <td className="p-2 text-right text-red-400">{v.criticalApps}</td>
                      <td className="p-2 text-right">{v.criticalPercent}%</td>
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

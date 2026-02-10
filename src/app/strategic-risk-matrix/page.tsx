'use client'

import { useFilteredQuery } from '@/hooks/useFilteredQuery'
import { Header } from '@/components/layout/Header'
import { KPICard } from '@/components/charts/KPICard'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { CRITICALITY_COLORS, CHART_COLORS, formatNumber, formatCurrency } from '@/lib/utils'
import {
  AlertTriangle, ShieldAlert, Eye, CheckCircle,
} from 'lucide-react'
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, ReferenceLine, Cell, Legend,
} from 'recharts'

/* eslint-disable @typescript-eslint/no-explicit-any */

const VENDOR_COLORS = [
  '#EA352C', '#44546A', '#28A745', '#6F42C1', '#FD7E14',
  '#17A2B8', '#E83E8C', '#20C997', '#FAE44C', '#6610F2',
]

export default function StrategicRiskMatrixPage() {
  const { data, isLoading } = useFilteredQuery('/api/dashboard/strategic-risk-matrix')

  if (isLoading) {
    return (
      <div className="flex-1">
        <Header title="Strategic Risk Matrix" subtitle="Criticidad de negocio vs complejidad arquitectónica para priorizar inversiones" />
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card rounded-lg border border-border p-4 h-24 animate-pulse" />
            ))}
          </div>
          <div className="bg-card rounded-lg border border-border h-[500px] animate-pulse" />
        </div>
      </div>
    )
  }

  const q = data?.quadrants
  const kpiCards = [
    { label: 'Zona Crítica', value: q?.critical ?? 0, icon: ShieldAlert, color: 'text-danger' },
    { label: 'Monitoreo (Alta Crit.)', value: q?.monitorHigh ?? 0, icon: AlertTriangle, color: 'text-warning' },
    { label: 'Monitoreo (Compleja)', value: q?.monitorComplex ?? 0, icon: Eye, color: 'text-info' },
    { label: 'Estable', value: q?.stable ?? 0, icon: CheckCircle, color: 'text-success' },
  ]

  // Build vendor color map
  const vendorColorMap: Record<string, string> = {}
  data?.vendors?.forEach((v: string, i: number) => {
    vendorColorMap[v] = VENDOR_COLORS[i % VENDOR_COLORS.length]
  })

  // Compute max complexity for the reference line threshold
  const maxComplexity = data?.scatter?.reduce(
    (max: number, d: any) => Math.max(max, d.complexity), 0
  ) ?? 20

  return (
    <div className="flex-1">
      <Header title="Strategic Risk Matrix" subtitle="Criticidad de negocio vs complejidad arquitectónica para priorizar inversiones" />
      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpiCards.map((kpi) => (
            <KPICard key={kpi.label} label={kpi.label} value={formatNumber(kpi.value)} icon={kpi.icon} color={kpi.color} />
          ))}
        </div>

        {/* Scatter Plot */}
        <ChartContainer
          title="Criticidad vs Complejidad Arquitectonica"
          subtitle="Tamaño de burbuja = # interfaces | Color = proveedor"
          height="h-[500px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="complexity"
                name="Complejidad"
                type="number"
                domain={[0, Math.max(maxComplexity + 5, 25)]}
                label={{ value: 'Complejidad (componentes + techs + plataformas)', position: 'bottom', offset: 0, style: { fontSize: 11, fill: '#888' } }}
              />
              <YAxis
                dataKey="critScore"
                name="Criticidad"
                type="number"
                domain={[0, 5]}
                ticks={[1, 2, 3, 4]}
                tickFormatter={(v: number) => ['', 'Baja', 'Media', 'Alta', 'Crítica'][v] || ''}
                label={{ value: 'Criticidad de Negocio', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#888' } }}
              />
              <ZAxis dataKey="interfaces" range={[40, 400]} name="Interfaces" />
              {/* Quadrant dividers */}
              <ReferenceLine x={10} stroke="#666" strokeDasharray="6 4" />
              <ReferenceLine y={3} stroke="#666" strokeDasharray="6 4" />
              {/* Quadrant background labels */}
              <Tooltip
                content={({ payload }) => {
                  if (!payload?.length) return null
                  const d = payload[0].payload
                  return (
                    <div className="bg-card border border-border rounded p-3 text-xs shadow-lg">
                      <p className="font-semibold text-sm mb-1">{d.name}</p>
                      <p>Criticidad: <span className="font-medium">{d.criticidad}</span></p>
                      <p>Complejidad: <span className="font-medium">{d.complexity}</span></p>
                      <p>Interfaces: <span className="font-medium">{d.interfaces}</span></p>
                      <p>Componentes: <span className="font-medium">{d.components}</span></p>
                      <p>Techs únicas: <span className="font-medium">{d.uniqueTechs}</span></p>
                      <p>Plataformas: <span className="font-medium">{d.uniquePlatforms}</span></p>
                      <p>Proveedor: <span className="font-medium">{d.vendor}</span></p>
                    </div>
                  )
                }}
              />
              <Legend
                content={() => (
                  <div className="flex flex-wrap justify-center gap-3 text-xs mt-2">
                    {data?.vendors?.slice(0, 8).map((v: string, i: number) => (
                      <span key={v} className="flex items-center gap-1">
                        <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: VENDOR_COLORS[i % VENDOR_COLORS.length] }} />
                        {v}
                      </span>
                    ))}
                  </div>
                )}
              />
              <Scatter data={data?.scatter} name="Aplicaciones">
                {data?.scatter?.map((d: any, i: number) => (
                  <Cell key={i} fill={vendorColorMap[d.vendor] || '#888'} fillOpacity={0.75} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Quadrant Legend */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div><span className="font-semibold">Atención Urgente</span><br />Alta criticidad + Alta complejidad</div>
          </div>
          <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <div><span className="font-semibold">Monitoreo Cercano</span><br />Alta criticidad, baja complejidad</div>
          </div>
          <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <div><span className="font-semibold">Simplificar</span><br />Baja criticidad, alta complejidad</div>
          </div>
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <div><span className="font-semibold">Operación Normal</span><br />Baja criticidad + Baja complejidad</div>
          </div>
        </div>

        {/* Top 10 Red Zone */}
        {data?.redZone?.length > 0 && (
          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="font-semibold mb-1">Top {data.redZone.length} Aplicaciones en Zona Crítica</h3>
            <p className="text-xs text-muted-foreground mb-4">Apps con alta criticidad y alta complejidad — requieren atención prioritaria</p>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card">
                  <tr className="border-b border-border">
                    <th className="text-left p-2">Aplicación</th>
                    <th className="text-left p-2">Criticidad</th>
                    <th className="text-right p-2">Complejidad</th>
                    <th className="text-right p-2">Interfaces</th>
                    <th className="text-right p-2">Componentes</th>
                    <th className="text-left p-2">Proveedor</th>
                    <th className="text-right p-2">TCO Est.</th>
                    <th className="text-left p-2">Acción Sugerida</th>
                  </tr>
                </thead>
                <tbody>
                  {data.redZone.map((app: any, i: number) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="p-2 font-medium">{app.name}</td>
                      <td className="p-2">
                        <span
                          className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{ backgroundColor: CRITICALITY_COLORS[app.criticidad] || '#888', color: '#fff' }}
                        >
                          {app.criticidad}
                        </span>
                      </td>
                      <td className="p-2 text-right">{app.complexity}</td>
                      <td className="p-2 text-right">{app.interfaces}</td>
                      <td className="p-2 text-right">{app.components}</td>
                      <td className="p-2">{app.vendor}</td>
                      <td className="p-2 text-right">{formatCurrency(app.tco)}</td>
                      <td className="p-2 text-xs text-muted-foreground">{app.action}</td>
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

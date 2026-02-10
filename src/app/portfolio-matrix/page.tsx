'use client'

import { useFilteredQuery } from '@/hooks/useFilteredQuery'
import { Header } from '@/components/layout/Header'
import { KPICard } from '@/components/charts/KPICard'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { CRITICALITY_COLORS } from '@/lib/utils'
import { TrendingUp, ArrowRightCircle, Pause, Trash2 } from 'lucide-react'
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, ReferenceLine, Cell,
} from 'recharts'

/* eslint-disable @typescript-eslint/no-explicit-any */

const QUADRANT_COLORS: Record<string, string> = {
  invest: '#28A745',
  migrate: '#FD7E14',
  tolerate: '#17A2B8',
  eliminate: '#EA352C',
}

export default function PortfolioMatrixPage() {
  const { data, isLoading } = useFilteredQuery('/api/dashboard/portfolio-matrix')

  if (isLoading) {
    return (
      <div className="flex-1">
        <Header title="Application Portfolio Matrix" subtitle="Clasificacion de aplicaciones para decisiones de inversion (modelo Gartner)" />
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

  const q = data?.quadrants
  const kpiCards = [
    { label: 'Invertir', value: q?.invest ?? 0, icon: TrendingUp, color: 'text-success' },
    { label: 'Modernizar', value: q?.migrate ?? 0, icon: ArrowRightCircle, color: 'text-warning' },
    { label: 'Tolerar', value: q?.tolerate ?? 0, icon: Pause, color: 'text-info' },
    { label: 'Eliminar', value: q?.eliminate ?? 0, icon: Trash2, color: 'text-danger' },
  ]

  return (
    <div className="flex-1">
      <Header title="Application Portfolio Matrix" subtitle="Clasificacion de aplicaciones para decisiones de inversion (modelo Gartner)" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpiCards.map((kpi) => (
            <KPICard key={kpi.label} label={kpi.label} value={String(kpi.value)} icon={kpi.icon} color={kpi.color} />
          ))}
        </div>

        {/* Scatter Plot */}
        <ChartContainer
          title="Matriz de Portafolio"
          subtitle="Eje X: Capacidad tecnica (moderno vs legacy) | Eje Y: Valor de negocio"
          height="h-[500px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="techScore" type="number" domain={[0, 20]}
                label={{ value: 'Capacidad Tecnica (mayor = mas moderno)', position: 'bottom', offset: 0, style: { fontSize: 11, fill: '#888' } }}
              />
              <YAxis
                dataKey="businessValue" type="number" domain={[0, 20]}
                label={{ value: 'Valor de Negocio', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#888' } }}
              />
              <ZAxis dataKey="components" range={[40, 300]} name="Componentes" />
              <ReferenceLine x={9} stroke="#666" strokeDasharray="6 4" />
              <ReferenceLine y={9} stroke="#666" strokeDasharray="6 4" />
              <Tooltip
                content={({ payload }) => {
                  if (!payload?.length) return null
                  const d = payload[0].payload
                  return (
                    <div className="bg-card border border-border rounded p-3 text-xs shadow-lg">
                      <p className="font-semibold text-sm mb-1">{d.name}</p>
                      <p>Criticidad: <span className="font-medium">{d.criticidad}</span></p>
                      <p>Valor de negocio: <span className="font-medium">{d.businessValue}</span></p>
                      <p>Capacidad tecnica: <span className="font-medium">{d.techScore}</span></p>
                      <p>Modelo: <span className="font-medium">{d.model}</span></p>
                      <p>Componentes: <span className="font-medium">{d.components}</span></p>
                    </div>
                  )
                }}
              />
              <Scatter data={data?.scatter}>
                {data?.scatter?.map((d: any, i: number) => (
                  <Cell key={i} fill={QUADRANT_COLORS[d.quadrant] || '#888'} fillOpacity={0.7} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Quadrant Legend */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <div><span className="font-semibold">Invertir</span><br />Alto valor + Moderno</div>
          </div>
          <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <div><span className="font-semibold">Modernizar</span><br />Alto valor + Legacy</div>
          </div>
          <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <div><span className="font-semibold">Tolerar</span><br />Bajo valor + Moderno</div>
          </div>
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div><span className="font-semibold">Eliminar</span><br />Bajo valor + Legacy</div>
          </div>
        </div>

        {/* Tables row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data?.migrationCandidates?.length > 0 && (
            <div className="bg-card rounded-lg border border-orange-500/30 p-4">
              <h3 className="font-semibold mb-1">Candidatos a Modernizacion</h3>
              <p className="text-xs text-muted-foreground mb-3">Alto valor de negocio pero stack tecnologico legacy</p>
              <div className="overflow-auto max-h-48">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card">
                    <tr className="border-b border-border">
                      <th className="text-left p-2">Aplicacion</th>
                      <th className="text-left p-2">Criticidad</th>
                      <th className="text-left p-2">Modelo</th>
                      <th className="text-right p-2">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.migrationCandidates.map((app: any, i: number) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                        <td className="p-2 font-medium">{app.name}</td>
                        <td className="p-2">
                          <span className="px-2 py-0.5 rounded text-xs font-medium"
                            style={{ backgroundColor: CRITICALITY_COLORS[app.criticidad] || '#888', color: '#fff' }}>
                            {app.criticidad}
                          </span>
                        </td>
                        <td className="p-2">{app.model}</td>
                        <td className="p-2 text-right">{app.businessValue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {data?.quickWins?.length > 0 && (
            <div className="bg-card rounded-lg border border-red-500/30 p-4">
              <h3 className="font-semibold mb-1">Quick Wins — Candidatos a Eliminar</h3>
              <p className="text-xs text-muted-foreground mb-3">Bajo valor y stack legacy — ahorros rapidos por deprecacion</p>
              <div className="overflow-auto max-h-48">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card">
                    <tr className="border-b border-border">
                      <th className="text-left p-2">Aplicacion</th>
                      <th className="text-left p-2">Criticidad</th>
                      <th className="text-left p-2">Modelo</th>
                      <th className="text-right p-2">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.quickWins.map((app: any, i: number) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                        <td className="p-2 font-medium">{app.name}</td>
                        <td className="p-2">
                          <span className="px-2 py-0.5 rounded text-xs font-medium"
                            style={{ backgroundColor: CRITICALITY_COLORS[app.criticidad] || '#888', color: '#fff' }}>
                            {app.criticidad}
                          </span>
                        </td>
                        <td className="p-2">{app.model}</td>
                        <td className="p-2 text-right">{app.businessValue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useFilteredQuery } from '@/hooks/useFilteredQuery'
import { Header } from '@/components/layout/Header'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { CRITICALITY_COLORS, CHART_COLORS } from '@/lib/utils'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ScatterChart, Scatter, ZAxis,
} from 'recharts'
import { useState } from 'react'

export default function GovernancePage() {
  const { data, isLoading } = useFilteredQuery('/api/dashboard/governance')
  const [search, setSearch] = useState('')

  if (isLoading) {
    return (
      <div className="flex-1">
        <Header title="Gobernanza y Portafolio" />
        <div className="p-6"><div className="h-96 bg-card rounded-lg animate-pulse" /></div>
      </div>
    )
  }

  const filteredInventory = data?.inventory?.filter((a: { nombre: string }) =>
    a.nombre.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  return (
    <div className="flex-1">
      <Header title="Gobernanza y Portafolio" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartContainer title="Por Estado">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.byEstado} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" nameKey="name"
                  label={({ name, value }) => `${name}: ${value}`}>
                  {data?.byEstado?.map((_: unknown, i: number) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer title="Por Criticidad">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.byCriticidad} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" nameKey="name"
                  label={({ name, value }) => `${name}: ${value}`}>
                  {data?.byCriticidad?.map((e: { name: string }, i: number) => (
                    <Cell key={i} fill={CRITICALITY_COLORS[e.name] || CHART_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer title="Por Modelo de Servicio">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.byModelo} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" nameKey="name"
                  label={({ name, value }) => `${name}: ${value}`}>
                  {data?.byModelo?.map((_: unknown, i: number) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartContainer title="Heat Map: Criticidad vs Estado" subtitle="Numero de apps">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ left: 20, bottom: 20 }}>
                <XAxis dataKey="estado" type="category" name="Estado" tick={{ fontSize: 10 }} />
                <YAxis dataKey="criticidad" type="category" name="Criticidad" tick={{ fontSize: 10 }} />
                <ZAxis dataKey="count" range={[50, 400]} name="Apps" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter data={data?.heatMap} fill="#EA352C" />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer title="TCO por Linea de Negocio">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.tcoByLine} layout="vertical" margin={{ left: 120 }}>
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={115} tick={{ fontSize: 9 }} />
                <Tooltip />
                <Bar dataKey="apps" fill="#44546A" name="Apps" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        <ChartContainer title="Redundancia Tecnologica" subtitle="Top 20 tecnologias por componentes">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.techRedundancy} margin={{ bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" tick={{ fontSize: 9 }} interval={0} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#EA352C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Inventario de Aplicaciones</h3>
            <input type="text" placeholder="Buscar aplicacion..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-1.5 text-sm border border-border rounded-md bg-background" />
          </div>
          <div className="overflow-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border">
                  <th className="text-left p-2">Nombre</th>
                  <th className="text-left p-2">Criticidad</th>
                  <th className="text-left p-2">Estado</th>
                  <th className="text-left p-2">Modelo</th>
                  <th className="text-right p-2">Componentes</th>
                  <th className="text-right p-2">Interfaces</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.slice(0, 50).map((app: { id: number; nombre: string; criticidad: string; estado: string; modelo: string; components: number; interfaces: number }) => (
                  <tr key={app.id} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="p-2">{app.nombre}</td>
                    <td className="p-2">
                      <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: CRITICALITY_COLORS[app.criticidad] || '#888', color: '#fff' }}>
                        {app.criticidad}
                      </span>
                    </td>
                    <td className="p-2">{app.estado}</td>
                    <td className="p-2">{app.modelo}</td>
                    <td className="p-2 text-right">{app.components}</td>
                    <td className="p-2 text-right">{app.interfaces}</td>
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

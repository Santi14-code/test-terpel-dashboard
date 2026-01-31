'use client'

import { useFilteredQuery } from '@/hooks/useFilteredQuery'
import { Header } from '@/components/layout/Header'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { CRITICALITY_COLORS, CHART_COLORS } from '@/lib/utils'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'

export default function ArchitecturePage() {
  const { data, isLoading } = useFilteredQuery('/api/dashboard/architecture')

  if (isLoading) {
    return (
      <div className="flex-1">
        <Header title="Arquitectura y Acoplamiento" />
        <div className="p-6"><div className="h-96 bg-card rounded-lg animate-pulse" /></div>
      </div>
    )
  }

  return (
    <div className="flex-1">
      <Header title="Arquitectura y Acoplamiento" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartContainer title="Top 10 Apps Mas Acopladas" subtitle="Por conexiones de interfaces">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.topCoupled} layout="vertical" margin={{ left: 120 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={115} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="connections" fill="#EA352C" radius={[0, 4, 4, 0]}>
                  {data?.topCoupled?.map((e: { criticidad: string }, i: number) => (
                    <Cell key={i} fill={CRITICALITY_COLORS[e.criticidad] || CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer title="Modelo de Servicio">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.serviceModelDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" nameKey="name"
                  label={({ name, value }) => `${name}: ${value}`}>
                  {data?.serviceModelDistribution?.map((_: unknown, i: number) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartContainer title="Tipos de Componentes">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.componentTypes} layout="vertical" margin={{ left: 120 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={115} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#44546A" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer title="Tipos de Interfaces">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.interfaceTypes} layout="vertical" margin={{ left: 120 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={115} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#EA352C" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        <ChartContainer title="Distribucion por Entorno">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.environments}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#28A745" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="font-semibold mb-2">Grafo de Dependencias</h3>
          <p className="text-sm text-muted-foreground mb-4">{data?.network?.nodes?.length ?? 0} apps conectadas, {data?.network?.links?.length ?? 0} conexiones</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data?.network?.nodes?.slice(0, 12).map((n: { id: number; name: string; criticidad: string; interfaces: number }) => (
              <div key={n.id} className="border border-border rounded p-2 text-xs">
                <p className="font-medium truncate">{n.name}</p>
                <span className="px-1.5 py-0.5 rounded text-[10px]" style={{ backgroundColor: CRITICALITY_COLORS[n.criticidad] || '#888', color: '#fff' }}>
                  {n.criticidad}
                </span>
                <p className="mt-1 text-muted-foreground">{n.interfaces} interfaces</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

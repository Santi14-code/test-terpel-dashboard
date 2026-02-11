'use client'

import { useFilteredQuery } from '@/hooks/useFilteredQuery'
import { Header } from '@/components/layout/Header'
import { KPICard } from '@/components/charts/KPICard'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { CHART_COLORS, formatPercent } from '@/lib/utils'
import { Cloud, Zap, Cpu, Layers } from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'

export default function InnovationPage() {
  const { data, isLoading } = useFilteredQuery('/api/dashboard/innovation')

  if (isLoading) {
    return (
      <div className="flex-1">
        <Header title="Innovacion y Modernizacion" />
        <div className="p-6"><div className="h-96 bg-card rounded-lg animate-pulse" /></div>
      </div>
    )
  }

  const kpiCards = [
    { label: 'Cloud Adoption', value: formatPercent(data?.cloudAdoption ?? 0, 0), icon: Cloud },
    { label: 'Indice Modernidad', value: `${data?.avgModernity ?? 0}/100`, icon: Zap },
    { label: 'Categorias Tech', value: String(data?.techRadar?.length ?? 0), icon: Cpu },
    { label: 'Tipos Despliegue', value: String(data?.deploymentTypes?.length ?? 0), icon: Layers },
  ]

  return (
    <div className="flex-1">
      <Header title="Innovacion y Modernizacion" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpiCards.map((kpi) => (
            <KPICard key={kpi.label} label={kpi.label} value={kpi.value} icon={kpi.icon} />
          ))}
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="font-semibold mb-2">Adopcion Cloud</h3>
          <div className="w-full bg-muted rounded-full h-6 overflow-hidden">
            <div className="bg-primary h-6 rounded-full flex items-center justify-center text-xs font-medium text-white transition-all"
              style={{ width: `${data?.cloudAdoption ?? 0}%` }}>
              {data?.cloudAdoption ?? 0}%
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Porcentaje de aplicaciones en modelos cloud (SaaS, PaaS, IaaS)</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartContainer title="Distribucion por Modelo">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.modelDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" nameKey="name"
                  label={({ name, value }) => `${name}: ${value}`}>
                  {data?.modelDistribution?.map((_: unknown, i: number) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer title="Tipos de Despliegue">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.deploymentTypes} layout="vertical" margin={{ left: 120 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={115} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#EA352C" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="font-semibold mb-4">Radar Tecnologico por Categoria</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.techRadar?.map((cat: { category: string; technologies: { name: string; count: number }[] }) => (
              <div key={cat.category} className="border border-border rounded p-3">
                <h4 className="font-medium text-sm mb-2">{cat.category}</h4>
                <div className="space-y-1">
                  {cat.technologies.map((t) => (
                    <div key={t.name} className="flex items-center justify-between text-xs">
                      <span className="truncate mr-2">{t.name}</span>
                      <span className="text-muted-foreground font-mono">{t.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="font-semibold mb-4">Ranking de Modernidad</h3>
          <div className="overflow-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border">
                  <th className="text-left p-2">Aplicacion</th>
                  <th className="text-left p-2">Modelo</th>
                  <th className="text-right p-2">Indice</th>
                  <th className="text-left p-2 w-48">Barra</th>
                </tr>
              </thead>
              <tbody>
                {data?.appModernity?.map((a: { name: string; modelo: string; modernity: number }, i: number) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="p-2">{a.name}</td>
                    <td className="p-2">{a.modelo}</td>
                    <td className="p-2 text-right font-mono">{a.modernity}</td>
                    <td className="p-2">
                      <div className="w-full bg-muted rounded h-2">
                        <div className="h-2 rounded" style={{
                          width: `${a.modernity}%`,
                          backgroundColor: a.modernity > 60 ? '#28A745' : a.modernity > 30 ? '#FAE44C' : '#EA352C',
                        }} />
                      </div>
                    </td>
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

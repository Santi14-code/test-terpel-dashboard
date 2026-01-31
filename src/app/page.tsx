'use client'

import { useFilteredQuery } from '@/hooks/useFilteredQuery'
import { Header } from '@/components/layout/Header'
import { KPICard } from '@/components/charts/KPICard'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { CRITICALITY_COLORS, CHART_COLORS, formatNumber } from '@/lib/utils'
import {
  Monitor, Puzzle, Cpu, RefreshCw, ClipboardList, Pin,
} from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  Treemap,
} from 'recharts'
import { SunburstChart } from 'recharts'

/* eslint-disable @typescript-eslint/no-explicit-any */
function TreemapContent({ x, y, width, height, name, depth, colors, index, root }: any) {
  if (width < 30 || height < 20) return null
  // Find top-level index for coloring
  let colorIdx = index ?? 0
  if (depth === 2 && root?.children) {
    let acc = 0
    for (let i = 0; i < root.children.length; i++) {
      const childCount = root.children[i].children?.length ?? 1
      if (index < acc + childCount) { colorIdx = i; break }
      acc += childCount
    }
  }
  const fill = depth === 1
    ? (colors ?? CHART_COLORS)[index % (colors ?? CHART_COLORS).length]
    : depth === 2
      ? (colors ?? CHART_COLORS)[colorIdx % (colors ?? CHART_COLORS).length] + 'CC'
      : '#8884d855'
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} stroke="#fff" strokeWidth={depth === 1 ? 2 : 1} rx={2} />
      {width > 50 && height > 25 && (
        <text x={x + width / 2} y={y + height / 2} textAnchor="middle" dominantBaseline="central" fontSize={depth === 1 ? 12 : 10} fill="#fff" fontWeight={depth === 1 ? 700 : 400}>
          {name?.length > Math.floor(width / 7) ? name.slice(0, Math.floor(width / 7)) + '…' : name}
        </text>
      )}
    </g>
  )
}

export default function HomePage() {
  const { data, isLoading } = useFilteredQuery('/api/dashboard/home')

  if (isLoading) {
    return (
      <div className="flex-1">
        <Header title="Dashboard Principal" />
        <div className="p-6">
          <div className="grid grid-cols-6 gap-4 mb-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card rounded-lg border border-border p-4 h-24 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const kpis = data?.kpis
  const kpiCards = [
    { label: 'Aplicaciones', value: kpis?.apps ?? 0, icon: Monitor },
    { label: 'Componentes', value: kpis?.componentes ?? 0, icon: Puzzle },
    { label: 'Tecnologias', value: kpis?.tecnologias ?? 0, icon: Cpu },
    { label: 'Macroprocesos', value: kpis?.macroprocesos ?? 0, icon: RefreshCw },
    { label: 'Procesos', value: kpis?.procesos ?? 0, icon: ClipboardList },
    { label: 'Subprocesos', value: kpis?.subprocesos ?? 0, icon: Pin },
  ]

  return (
    <div className="flex-1">
      <Header title="Dashboard Principal" />
      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpiCards.map((kpi) => (
            <KPICard key={kpi.label} label={kpi.label} value={formatNumber(kpi.value)} icon={kpi.icon} />
          ))}
        </div>

        {/* Row 2: Criticality + Top 10 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartContainer title="Criticidad de Aplicaciones" subtitle="Distribucion por nivel">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.criticality}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {data?.criticality?.map((entry: { name: string }, i: number) => (
                    <Cell
                      key={i}
                      fill={CRITICALITY_COLORS[entry.name] || CHART_COLORS[i % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer title="Top 10 Apps por Componentes">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.topAppsByComponents} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={95} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="components" fill="#EA352C" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer title="Tecnologias Mas Utilizadas" subtitle="Top 20">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.techUsage?.slice(0, 10)} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={95} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#44546A" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Row 3: Full-width tech bar */}
        <ChartContainer title="Todas las Tecnologias" subtitle="Top 20 por numero de componentes">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.techUsage} margin={{ bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" tick={{ fontSize: 10 }} interval={0} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#EA352C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Row 4: Macroprocess Coverage */}
        <ChartContainer title="Cobertura de Macroprocesos" subtitle="Subprocesos cubiertos vs sin cobertura" height="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.macroprocessCoverage} margin={{ bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" tick={{ fontSize: 9 }} interval={0} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="covered" stackId="a" fill="#28A745" name="Cubiertos" />
              <Bar dataKey="uncovered" stackId="a" fill="#EA352C" name="Sin cobertura" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Row 5: Capability Hierarchy Sunburst */}
        {data?.sunburst?.children?.length > 0 && (
          <ChartContainer title="Mapa Jerárquico de Capacidades" subtitle="Tamaño por cantidad de aplicaciones vinculadas" height="h-[500px]">
            <SunburstChart data={data.sunburst} dataKey="value" nameKey="name" innerRadius={40} outerRadius={220} stroke="#fff" width="100%" height="100%" responsive>
              <Tooltip formatter={(v: any) => [`${v} apps`, 'Aplicaciones']} />
            </SunburstChart>
          </ChartContainer>
        )}

        {/* Row 6: Process Hierarchy Treemap */}
        {data?.treemap?.children?.length > 0 && (
          <ChartContainer title="Mapa Jerárquico de Procesos" subtitle="Tamaño por cantidad de componentes vinculados" height="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={data.treemap.children}
                dataKey="value"
                nameKey="name"
                stroke="#fff"
                content={<TreemapContent colors={['#EA352C', '#44546A', '#FAE44C', '#28A745', '#6F42C1', '#FD7E14', '#20C997', '#E83E8C']} />}
              >
                <Tooltip formatter={(v: any) => [`${v} componentes`, 'Componentes']} />
              </Treemap>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </div>
    </div>
  )
}

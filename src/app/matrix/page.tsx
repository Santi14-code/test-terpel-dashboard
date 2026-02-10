'use client'

import { useState } from 'react'
import { useFilteredQuery } from '@/hooks/useFilteredQuery'
import { Header } from '@/components/layout/Header'
import { KPICard } from '@/components/charts/KPICard'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { Layers, Code, Building2, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { CRITICALITY_COLORS } from '@/lib/utils'

interface MatrixData {
  kpis: {
    totalApps: number
    totalTechs: number
    totalProviders: number
    criticalApps: number
  }
  heatMapData: Array<{
    appId: number
    appName: string
    criticidad: string
    techId: number
    techName: string
    dependencyCount: number
    componentCount: number
  }>
  detailedList: Array<{
    id: number
    nombre: string
    descripcion: string
    criticidad: string
    proveedor: string
    fabricante: string
    estado: string
    techCount: number
    componentCount: number
    totalDependencies: number
    technologies: Array<{
      id: number
      name: string
      category: string
      componentCount: number
    }>
  }>
  techDistribution: Array<{
    name: string
    category: string
    appCount: number
    componentCount: number
    criticalApps: number
  }>
  criticalityDistribution: Array<{
    name: string
    value: number
    color: string
  }>
  filterOptions: {
    technologies: Array<{
      id_tecnologia: number
      tecnologia: string
      categoria: string
    }>
    providers: string[]
  }
}

export default function MatrixPage() {
  const [selectedTech, setSelectedTech] = useState<string>('')
  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [expandedApp, setExpandedApp] = useState<number | null>(null)

  // Build query params
  const additionalParams = new URLSearchParams()
  if (selectedTech) additionalParams.set('tecnologia', selectedTech)
  if (selectedProvider) additionalParams.set('proveedor', selectedProvider)

  const { data, isLoading } = useFilteredQuery<MatrixData>(
    `/api/dashboard/matrix?${additionalParams.toString()}`
  )

  if (isLoading || !data) {
    return (
      <div className="flex-1">
        <Header title="Matriz de Aplicaciones × Tecnologías" />
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
          <div className="h-96 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    )
  }

  const toggleAppExpand = (appId: number) => {
    setExpandedApp(expandedApp === appId ? null : appId)
  }

  return (
    <div className="flex-1">
      <Header title="Matriz de Aplicaciones × Tecnologías" />

      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            icon={Layers}
            title="Total Aplicaciones"
            value={data.kpis.totalApps}
            iconColor="text-blue-500"
          />
          <KPICard
            icon={Code}
            title="Tecnologías"
            value={data.kpis.totalTechs}
            iconColor="text-green-500"
          />
          <KPICard
            icon={Building2}
            title="Proveedores"
            value={data.kpis.totalProviders}
            iconColor="text-purple-500"
          />
          <KPICard
            icon={AlertTriangle}
            title="Apps Críticas"
            value={data.kpis.criticalApps}
            iconColor="text-red-500"
          />
        </div>

        {/* Filters */}
        <div className="bg-card border rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-3">Filtros Específicos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Criticality filter - using global filters */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Criticidad
              </label>
              <p className="text-sm text-muted-foreground italic">
                Use los filtros globales arriba
              </p>
            </div>

            {/* Technology filter */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Tecnología
              </label>
              <select
                value={selectedTech}
                onChange={(e) => setSelectedTech(e.target.value)}
                className="w-full px-3 py-2 bg-background border rounded-md text-sm"
              >
                <option value="">Todas las tecnologías</option>
                {data.filterOptions.technologies.map((tech) => (
                  <option key={tech.id_tecnologia} value={tech.id_tecnologia}>
                    {tech.tecnologia} ({tech.categoria})
                  </option>
                ))}
              </select>
            </div>

            {/* Provider filter */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Proveedor
              </label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full px-3 py-2 bg-background border rounded-md text-sm"
              >
                <option value="">Todos los proveedores</option>
                {data.filterOptions.providers.map((provider) => (
                  <option key={provider} value={provider}>
                    {provider}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Criticality Distribution */}
          <ChartContainer
            title="Distribución por Criticidad"
            subtitle="Aplicaciones por nivel de criticidad"
            height="h-80"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.criticalityDistribution.filter((d) => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.criticalityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Technology Distribution */}
          <ChartContainer
            title="Distribución de Tecnologías"
            subtitle="Top 10 tecnologías más usadas"
            height="h-80"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.techDistribution.slice(0, 10)}
                layout="vertical"
                margin={{ left: 100 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={90} />
                <Tooltip />
                <Legend />
                <Bar dataKey="appCount" fill="#3b82f6" name="Aplicaciones" />
                <Bar
                  dataKey="criticalApps"
                  fill="#ef4444"
                  name="Apps Críticas"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Heat Map */}
        <ChartContainer
          title="Mapa de Calor: Dependencias por Aplicación × Tecnología"
          subtitle="Intensidad de uso de tecnologías en cada aplicación"
          height="h-[600px]"
        >
          <div className="overflow-auto max-h-[550px]">
            <HeatMap data={data.heatMapData} />
          </div>
        </ChartContainer>

        {/* Detailed List with Drill-down */}
        <ChartContainer
          title="Lista Detallada de Aplicaciones"
          subtitle="Click para expandir y ver tecnologías utilizadas"
          height="auto"
        >
          <div className="space-y-2">
            {data.detailedList.map((app) => (
              <div
                key={app.id}
                className="border rounded-lg overflow-hidden transition-all"
              >
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleAppExpand(app.id)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {expandedApp === app.id ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{app.nombre}</h4>
                        <span
                          className="text-xs px-2 py-0.5 rounded"
                          style={{
                            backgroundColor:
                              CRITICALITY_COLORS[
                                app.criticidad as keyof typeof CRITICALITY_COLORS
                              ] + '20',
                            color:
                              CRITICALITY_COLORS[
                                app.criticidad as keyof typeof CRITICALITY_COLORS
                              ],
                          }}
                        >
                          {app.criticidad}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {app.descripcion}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-semibold">{app.techCount}</div>
                      <div className="text-xs text-muted-foreground">
                        Tecnologías
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{app.componentCount}</div>
                      <div className="text-xs text-muted-foreground">
                        Componentes
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">
                        {app.totalDependencies}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Dependencias
                      </div>
                    </div>
                  </div>
                </div>

                {expandedApp === app.id && (
                  <div className="border-t bg-muted/30 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="text-sm font-semibold">Proveedor:</span>{' '}
                        <span className="text-sm">{app.proveedor || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-sm font-semibold">Fabricante:</span>{' '}
                        <span className="text-sm">{app.fabricante || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-sm font-semibold">Estado:</span>{' '}
                        <span className="text-sm">{app.estado || 'N/A'}</span>
                      </div>
                    </div>

                    <h5 className="font-semibold text-sm mb-2">
                      Tecnologías Utilizadas:
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {app.technologies.map((tech) => (
                        <div
                          key={tech.id}
                          className="bg-background border rounded p-2"
                        >
                          <div className="font-medium text-sm">{tech.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {tech.category}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {tech.componentCount} componente(s)
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {data.detailedList.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron aplicaciones con los filtros seleccionados
              </div>
            )}
          </div>
        </ChartContainer>
      </div>
    </div>
  )
}

// Heat Map Component
function HeatMap({
  data,
}: {
  data: Array<{
    appId: number
    appName: string
    criticidad: string
    techId: number
    techName: string
    dependencyCount: number
    componentCount: number
  }>
}) {
  // Group by app and tech
  const apps = Array.from(new Set(data.map((d) => d.appName))).sort()
  const techs = Array.from(new Set(data.map((d) => d.techName))).sort()

  // Create matrix
  const matrix = new Map<string, number>()
  const criticalityMap = new Map<string, string>()

  data.forEach((d) => {
    const key = `${d.appName}|${d.techName}`
    matrix.set(key, d.dependencyCount)
    criticalityMap.set(d.appName, d.criticidad)
  })

  // Get max value for color scaling
  const maxValue = Math.max(...Array.from(matrix.values()))

  const getColor = (value: number) => {
    if (value === 0) return 'bg-muted'
    const intensity = Math.min(value / maxValue, 1)
    if (intensity < 0.25) return 'bg-blue-200'
    if (intensity < 0.5) return 'bg-blue-400'
    if (intensity < 0.75) return 'bg-blue-600'
    return 'bg-blue-800'
  }

  if (apps.length === 0 || techs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay datos para mostrar en el mapa de calor
      </div>
    )
  }

  return (
    <div className="inline-block min-w-full">
      <table className="border-collapse">
        <thead>
          <tr>
            <th className="border p-2 bg-muted sticky left-0 z-10 min-w-[200px]">
              Aplicación
            </th>
            {techs.map((tech) => (
              <th
                key={tech}
                className="border p-2 bg-muted text-xs min-w-[80px]"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              >
                {tech}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {apps.map((app) => (
            <tr key={app}>
              <td className="border p-2 font-medium text-sm bg-background sticky left-0 z-10">
                <div className="flex items-center gap-2">
                  <span>{app}</span>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor:
                        CRITICALITY_COLORS[
                          criticalityMap.get(app) as keyof typeof CRITICALITY_COLORS
                        ] + '20',
                      color:
                        CRITICALITY_COLORS[
                          criticalityMap.get(app) as keyof typeof CRITICALITY_COLORS
                        ],
                    }}
                  >
                    {criticalityMap.get(app)}
                  </span>
                </div>
              </td>
              {techs.map((tech) => {
                const key = `${app}|${tech}`
                const value = matrix.get(key) || 0
                return (
                  <td
                    key={tech}
                    className={`border p-2 text-center text-xs ${getColor(value)}`}
                    title={`${app} - ${tech}: ${value} dependencia(s)`}
                  >
                    {value > 0 ? value : ''}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

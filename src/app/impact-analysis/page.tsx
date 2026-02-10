'use client'

import { useImpactAnalysisQuery } from '@/hooks/useImpactAnalysisQuery'
import { Header } from '@/components/layout/Header'
import { KPICard } from '@/components/charts/KPICard'
import { ChartContainer } from '@/components/charts/ChartContainer'
import { CRITICALITY_COLORS, CHART_COLORS, formatNumber } from '@/lib/utils'
import {
  Crosshair, Puzzle, Link2, GitBranch, Cpu, ShieldAlert,
  Clock, Users, AlertTriangle, Database, ChevronDown, ChevronRight,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell,
  RadialBarChart, RadialBar,
} from 'recharts'
import { useState } from 'react'

/* eslint-disable @typescript-eslint/no-explicit-any */

const IMPACT_LEVEL_COLORS: Record<string, string> = {
  'MUY ALTO': '#EA352C',
  'ALTO': '#FD7E14',
  'MEDIO': '#FAE44C',
  'BAJO': '#28A745',
}

const SEVERITY_COLORS: Record<string, string> = {
  Critico: '#EA352C',
  Alto: '#FD7E14',
  Medio: '#FAE44C',
  Bajo: '#28A745',
}

export default function ImpactAnalysisPage() {
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null)
  const { data, isLoading } = useImpactAnalysisQuery(selectedAppId)
  const [expandedMacro, setExpandedMacro] = useState<Record<string, boolean>>({})

  const toggleMacro = (name: string) => {
    setExpandedMacro((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  if (isLoading) {
    return (
      <div className="flex-1">
        <Header title="Analisis de Impacto" />
        <div className="p-6 space-y-6">
          <div className="bg-card rounded-lg border border-border p-4 h-16 animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-card rounded-lg border border-border p-4 h-24 animate-pulse" />
            ))}
          </div>
          <div className="h-96 bg-card rounded-lg animate-pulse" />
        </div>
      </div>
    )
  }

  const appSelected = selectedAppId && data?.application

  return (
    <div className="flex-1">
      <Header title="Analisis de Impacto" />
      <div className="p-6 space-y-6">

        {/* Application Selector */}
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              Seleccionar Aplicacion:
            </label>
            <select
              value={selectedAppId ?? ''}
              onChange={(e) => setSelectedAppId(e.target.value ? Number(e.target.value) : null)}
              className="text-sm border border-border rounded-md px-3 py-1.5 bg-background flex-1 max-w-md"
            >
              <option value="">-- Selecciona una aplicacion --</option>
              {data?.applications?.map((app: any) => (
                <option key={app.id_aplicacion} value={app.id_aplicacion}>
                  {app.nombre} ({app.criticidad || 'Sin definir'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Empty State */}
        {!appSelected && (
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <Crosshair size={48} className="mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Selecciona una aplicacion
            </h3>
            <p className="text-sm text-muted-foreground">
              Usa el selector de arriba para elegir una aplicacion y generar su analisis de impacto completo.
            </p>
          </div>
        )}

        {/* --- Full Analysis (when app selected) --- */}
        {appSelected && (
          <>
            {/* Section 1: Executive Summary */}
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Impact Score */}
                <div className="flex flex-col items-center justify-center min-w-[200px]">
                  <div className="w-40 h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart
                        cx="50%" cy="50%"
                        innerRadius="70%" outerRadius="100%"
                        startAngle={180} endAngle={0}
                        data={[{ value: data.impactScore.total, fill: IMPACT_LEVEL_COLORS[data.impactScore.level] || '#888' }]}
                      >
                        <RadialBar dataKey="value" cornerRadius={10} background={{ fill: '#e5e7eb' }} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-center -mt-8">
                    <div className="text-3xl font-bold text-foreground">{data.impactScore.total}/100</div>
                    <span
                      className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: IMPACT_LEVEL_COLORS[data.impactScore.level] || '#888' }}
                    >
                      {data.impactScore.level}
                    </span>
                  </div>
                </div>

                {/* Application Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-xl font-bold text-foreground">{data.application.nombre}</h2>
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium text-white"
                      style={{ backgroundColor: CRITICALITY_COLORS[data.application.criticidad] || '#888' }}
                    >
                      {data.application.criticidad}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{data.application.descripcion}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground">Estado</span>
                      <p className="font-medium">{data.application.estado}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Modelo</span>
                      <p className="font-medium">{data.application.modeloServicio}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Proveedor</span>
                      <p className="font-medium">{data.application.proveedor}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Fabricante</span>
                      <p className="font-medium">{data.application.fabricante}</p>
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Desglose del Score</p>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { label: 'Componentes', value: data.impactScore.breakdown.components, max: 25 },
                        { label: 'Interfaces', value: data.impactScore.breakdown.interfaces, max: 25 },
                        { label: 'Procesos', value: data.impactScore.breakdown.processes, max: 20 },
                        { label: 'Criticidad', value: data.impactScore.breakdown.criticality, max: 15 },
                        { label: 'Datos Pers.', value: data.impactScore.breakdown.personalData, max: 15 },
                      ].map((item) => (
                        <div key={item.label} className="text-center">
                          <div className="text-xs text-muted-foreground">{item.label}</div>
                          <div className="text-sm font-bold">{item.value}/{item.max}</div>
                          <div className="w-full h-1.5 bg-muted rounded-full mt-1">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${(item.value / item.max) * 100}%`,
                                backgroundColor: IMPACT_LEVEL_COLORS[data.impactScore.level] || '#888',
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Impact Dimensions KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <KPICard label="Modulos Funcionales" value={formatNumber(data.dimensions.modulesCount)} icon={Puzzle} />
              <KPICard label="Interfaces de Integracion" value={formatNumber(data.dimensions.interfacesCount)} icon={Link2} />
              <KPICard label="Procesos de Negocio" value={formatNumber(data.dimensions.processesCount)} icon={GitBranch} />
              <KPICard label="Tecnologias" value={formatNumber(data.dimensions.technologiesCount)} icon={Cpu} />
              <KPICard label="Comp. Datos Personales" value={formatNumber(data.dimensions.personalDataComponents)} icon={Database} />
            </div>

            {/* Section 3: Integration Complexity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ChartContainer title="Interfaces por Tipo" subtitle={`${data.integrationComplexity.total} interfaces activas`}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.integrationComplexity.byType} layout="vertical" margin={{ left: 100 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="type" width={95} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="count" name="Interfaces" radius={[0, 4, 4, 0]}>
                      {data.integrationComplexity.byType?.map((_: any, i: number) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>

              {/* Interface Details Table */}
              <div className="bg-card rounded-lg border border-border p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Detalle de Interfaces</h3>
                <div className="overflow-auto max-h-[296px]">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-card z-10">
                      <tr className="border-b border-border">
                        <th className="text-left p-2">Nombre</th>
                        <th className="text-left p-2">Tipo</th>
                        <th className="text-left p-2">Estado</th>
                        <th className="text-right p-2">Consumidores</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.integrationComplexity.interfaceDetails?.map((iface: any, i: number) => (
                        <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                          <td className="p-2 font-medium text-xs">{iface.nombre}</td>
                          <td className="p-2 text-xs">{iface.tipo}</td>
                          <td className="p-2 text-xs">{iface.estado}</td>
                          <td className="p-2 text-right">{iface.consumerCount}</td>
                        </tr>
                      ))}
                      {(!data.integrationComplexity.interfaceDetails || data.integrationComplexity.interfaceDetails.length === 0) && (
                        <tr><td colSpan={4} className="p-4 text-center text-muted-foreground text-xs">Sin interfaces registradas</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Consumed Interfaces (dependencies on other apps) */}
            {data.integrationComplexity.consumedInterfaces?.length > 0 && (
              <div className="bg-card rounded-lg border border-border p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Interfaces Consumidas (Dependencias)</h3>
                <div className="overflow-auto max-h-64">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-card z-10">
                      <tr className="border-b border-border">
                        <th className="text-left p-2">Interfaz</th>
                        <th className="text-left p-2">Tipo</th>
                        <th className="text-left p-2">Aplicacion Proveedora</th>
                        <th className="text-left p-2">Componente Consumidor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.integrationComplexity.consumedInterfaces.map((ci: any, i: number) => (
                        <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                          <td className="p-2 text-xs font-medium">{ci.interface}</td>
                          <td className="p-2 text-xs">{ci.type}</td>
                          <td className="p-2 text-xs">{ci.providerApp}</td>
                          <td className="p-2 text-xs">{ci.consumer}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Section 4: Business Process Impact */}
            {data.businessProcessImpact?.length > 0 && (
              <div className="bg-card rounded-lg border border-border p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Impacto en Procesos de Negocio</h3>
                <div className="space-y-2">
                  {data.businessProcessImpact.map((macro: any) => (
                    <div key={macro.macroproceso} className="border border-border/50 rounded-md">
                      <button
                        onClick={() => toggleMacro(macro.macroproceso)}
                        className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors text-left"
                      >
                        <div className="flex items-center gap-2">
                          {expandedMacro[macro.macroproceso] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          <span className="text-sm font-medium">{macro.macroproceso}</span>
                          <span className="px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">
                            {macro.categoria}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">{macro.subprocessCount} subprocesos</span>
                      </button>
                      {expandedMacro[macro.macroproceso] && (
                        <div className="px-3 pb-3">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-border">
                                <th className="text-left p-2 text-xs">Subproceso</th>
                                <th className="text-left p-2 text-xs">Proceso</th>
                                <th className="text-left p-2 text-xs">Relacion</th>
                              </tr>
                            </thead>
                            <tbody>
                              {macro.subprocesses.map((sp: any, i: number) => (
                                <tr key={i} className="border-b border-border/30">
                                  <td className="p-2 text-xs">{sp.name}</td>
                                  <td className="p-2 text-xs text-muted-foreground">{sp.proceso}</td>
                                  <td className="p-2">
                                    <span className="px-2 py-0.5 rounded text-xs bg-primary/10 text-primary">
                                      {sp.tipoRelacion}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 5: Functional Modules */}
            {data.functionalModules?.length > 0 && (
              <div className="bg-card rounded-lg border border-border p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Modulos Funcionales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.functionalModules.map((group: any) => (
                    <div key={group.tipo} className="border border-border/50 rounded-md p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group.tipo}</h4>
                        <span className="text-xs bg-muted px-2 py-0.5 rounded">{group.count}</span>
                      </div>
                      <div className="space-y-2">
                        {group.components.map((comp: any, i: number) => (
                          <div key={i} className="text-xs">
                            <div className="flex items-center gap-1">
                              <span className="font-medium">{comp.nombre}</span>
                              {comp.hasPersonalData && (
                                <span className="px-1 py-0.5 rounded bg-red-100 text-red-700 text-[10px]">Datos Pers.</span>
                              )}
                            </div>
                            {comp.technology && (
                              <span className="text-muted-foreground">{comp.technology}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 6: Technology Considerations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-card rounded-lg border border-border p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Consideraciones Tecnologicas</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Modelo de Servicio:</span>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                      {data.technologyConsiderations.modeloServicio}
                    </span>
                    {data.technologyConsiderations.isCloudNative && (
                      <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">Cloud Native</span>
                    )}
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Tecnologias utilizadas:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {data.technologyConsiderations.technologies?.map((tech: any, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded text-xs bg-muted">
                          {tech.nombre}
                        </span>
                      ))}
                      {(!data.technologyConsiderations.technologies || data.technologyConsiderations.technologies.length === 0) && (
                        <span className="text-xs text-muted-foreground">Sin tecnologias registradas</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {data.technologyConsiderations.deployments?.length > 0 && (
                <div className="bg-card rounded-lg border border-border p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Despliegues</h3>
                  <div className="overflow-auto max-h-48">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-card">
                        <tr className="border-b border-border">
                          <th className="text-left p-2 text-xs">Entorno</th>
                          <th className="text-left p-2 text-xs">Plataforma</th>
                          <th className="text-left p-2 text-xs">Tipo</th>
                          <th className="text-right p-2 text-xs">Instancias</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.technologyConsiderations.deployments.map((d: any, i: number) => (
                          <tr key={i} className="border-b border-border/50">
                            <td className="p-2 text-xs">{d.entorno}</td>
                            <td className="p-2 text-xs">{d.plataforma}</td>
                            <td className="p-2 text-xs">{d.tipo}</td>
                            <td className="p-2 text-xs text-right">{d.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Section 7: Effort Estimation */}
            <div className="bg-card rounded-lg border border-border p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Estimacion de Esfuerzo</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 rounded-lg bg-muted/30">
                  <Clock size={16} className="mx-auto text-primary mb-1" />
                  <div className="text-lg font-bold">{data.effortEstimation.durationMonths.base}-{data.effortEstimation.durationMonths.withContingency}</div>
                  <div className="text-xs text-muted-foreground">Meses estimados</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/30">
                  <Users size={16} className="mx-auto text-primary mb-1" />
                  <div className="text-lg font-bold">{data.effortEstimation.teamSize}</div>
                  <div className="text-xs text-muted-foreground">FTEs requeridos</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/30">
                  <AlertTriangle size={16} className="mx-auto text-primary mb-1" />
                  <div className="text-lg font-bold">{data.effortEstimation.complexity}</div>
                  <div className="text-xs text-muted-foreground">Complejidad</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/30">
                  <ShieldAlert size={16} className="mx-auto text-primary mb-1" />
                  <div className="text-lg font-bold">{data.riskAssessment?.length || 0}</div>
                  <div className="text-xs text-muted-foreground">Riesgos identificados</div>
                </div>
              </div>

              <h4 className="text-xs font-medium text-muted-foreground mb-2">Fases del Proyecto</h4>
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2">Fase</th>
                      <th className="text-left p-2">Duracion (semanas)</th>
                      <th className="text-left p-2">Riesgos Principales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.effortEstimation.phases?.map((phase: any, i: number) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="p-2 font-medium text-xs">{phase.name}</td>
                        <td className="p-2 text-xs">{phase.durationWeeks}</td>
                        <td className="p-2 text-xs text-muted-foreground">{phase.risk}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 8: Risk Assessment */}
            {data.riskAssessment?.length > 0 && (
              <div className="bg-card rounded-lg border border-border p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Evaluacion de Riesgos</h3>
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2">Severidad</th>
                        <th className="text-left p-2">Riesgo</th>
                        <th className="text-left p-2">Probabilidad</th>
                        <th className="text-left p-2">Impacto</th>
                        <th className="text-left p-2">Mitigacion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.riskAssessment.map((risk: any) => (
                        <tr key={risk.id} className="border-b border-border/50 hover:bg-muted/50">
                          <td className="p-2">
                            <span
                              className="px-2 py-0.5 rounded text-xs font-medium text-white"
                              style={{ backgroundColor: SEVERITY_COLORS[risk.severity] || '#888' }}
                            >
                              {risk.severity}
                            </span>
                          </td>
                          <td className="p-2 font-medium text-xs">{risk.title}</td>
                          <td className="p-2 text-xs">{risk.probability}</td>
                          <td className="p-2 text-xs">{risk.impact}</td>
                          <td className="p-2 text-xs text-muted-foreground">{risk.mitigation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

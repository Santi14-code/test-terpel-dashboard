'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/Header'
import { KPICard } from '@/components/charts/KPICard'
import { CRITICALITY_COLORS } from '@/lib/utils'
import {
  Puzzle, Plug, Server, Layers, Cpu, Shield,
} from 'lucide-react'

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function AppDeepDivePage() {
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null)

  // Fetch app list
  const { data: listData } = useQuery({
    queryKey: ['app-deep-dive-list'],
    queryFn: () => fetch('/api/dashboard/app-deep-dive').then((r) => r.json()),
  })

  // Fetch app detail
  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: ['app-deep-dive', selectedAppId],
    queryFn: () => fetch(`/api/dashboard/app-deep-dive?appId=${selectedAppId}`).then((r) => r.json()),
    enabled: !!selectedAppId,
  })

  const detail = detailData?.detail
  const apps = listData?.apps ?? []

  return (
    <div className="flex-1">
      <Header title="Application Deep Dive" subtitle="Vista 360° de una aplicación con toda su información técnica" />
      <div className="p-6 space-y-6">
        {/* App Selector */}
        <div className="bg-card rounded-lg border border-border p-4">
          <label className="text-sm font-medium text-muted-foreground block mb-2">Seleccionar Aplicación</label>
          <select
            value={selectedAppId ?? ''}
            onChange={(e) => setSelectedAppId(e.target.value ? Number(e.target.value) : null)}
            className="w-full max-w-md text-sm bg-background border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">-- Seleccione una aplicación --</option>
            {apps.map((app: any) => (
              <option key={app.id_aplicacion} value={app.id_aplicacion}>
                {app.nombre} ({app.criticidad || 'Sin criticidad'})
              </option>
            ))}
          </select>
        </div>

        {!selectedAppId && (
          <div className="text-center text-muted-foreground py-20">
            Seleccione una aplicación para ver su información detallada
          </div>
        )}

        {detailLoading && selectedAppId && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card rounded-lg border border-border p-4 h-24 animate-pulse" />
            ))}
          </div>
        )}

        {detail && (
          <>
            {/* Header card */}
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold">{detail.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{detail.description}</p>
                </div>
                <span className="px-3 py-1 rounded text-sm font-semibold"
                  style={{ backgroundColor: CRITICALITY_COLORS[detail.criticidad] || '#888', color: '#fff' }}>
                  {detail.criticidad}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                <div><span className="text-muted-foreground">Estado:</span> <span className="font-medium">{detail.estado}</span></div>
                <div><span className="text-muted-foreground">Modelo:</span> <span className="font-medium">{detail.modelo}</span></div>
                <div><span className="text-muted-foreground">Proveedor:</span> <span className="font-medium">{detail.proveedor}</span></div>
                <div><span className="text-muted-foreground">Responsable:</span> <span className="font-medium">{detail.responsable}</span></div>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <KPICard label="Componentes" value={detail.summary.components} icon={Puzzle} />
              <KPICard label="Interfaces" value={detail.summary.interfaces} icon={Plug} />
              <KPICard label="Despliegues" value={detail.summary.deployments} icon={Server} />
              <KPICard label="Procesos" value={detail.summary.processes} icon={Layers} />
              <KPICard label="Tecnologías" value={detail.summary.technologies} icon={Cpu} />
              <KPICard label="Datos Personales" value={detail.summary.hasPersonalData ? 'Si' : 'No'} icon={Shield}
                color={detail.summary.hasPersonalData ? 'text-warning' : 'text-success'} />
            </div>

            {/* Components table */}
            <div className="bg-card rounded-lg border border-border p-4">
              <h3 className="font-semibold mb-3">Componentes Lógicos</h3>
              <div className="overflow-auto max-h-64">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card">
                    <tr className="border-b border-border">
                      <th className="text-left p-2">Nombre</th>
                      <th className="text-left p-2">Tipo</th>
                      <th className="text-left p-2">Tecnología</th>
                      <th className="text-left p-2">Categoría</th>
                      <th className="text-left p-2">Version</th>
                      <th className="text-center p-2">Datos Pers.</th>
                      <th className="text-center p-2">Documentado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.components.map((c: any, i: number) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                        <td className="p-2 font-medium">{c.name}</td>
                        <td className="p-2 text-muted-foreground">{c.type}</td>
                        <td className="p-2">{c.technology}</td>
                        <td className="p-2 text-muted-foreground">{c.techCategory}</td>
                        <td className="p-2">{c.version}</td>
                        <td className="p-2 text-center">{c.hasPersonalData ? <span className="text-yellow-400">Si</span> : '-'}</td>
                        <td className="p-2 text-center">{c.documentation ? <span className="text-green-400">Si</span> : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Interfaces table */}
            {detail.interfaces.length > 0 && (
              <div className="bg-card rounded-lg border border-border p-4">
                <h3 className="font-semibold mb-3">Interfaces</h3>
                <div className="overflow-auto max-h-64">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-card">
                      <tr className="border-b border-border">
                        <th className="text-left p-2">Nombre</th>
                        <th className="text-left p-2">Tipo</th>
                        <th className="text-left p-2">Estado</th>
                        <th className="text-left p-2">Descripción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.interfaces.map((iface: any, i: number) => (
                        <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                          <td className="p-2 font-medium">{iface.name}</td>
                          <td className="p-2">{iface.type}</td>
                          <td className="p-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${iface.status === 'Activa' ? 'bg-green-500/20 text-green-400' : 'bg-muted text-muted-foreground'}`}>
                              {iface.status}
                            </span>
                          </td>
                          <td className="p-2 text-muted-foreground text-xs">{iface.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Deployments table */}
            {detail.deployments.length > 0 && (
              <div className="bg-card rounded-lg border border-border p-4">
                <h3 className="font-semibold mb-3">Despliegues</h3>
                <div className="overflow-auto max-h-64">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-card">
                      <tr className="border-b border-border">
                        <th className="text-left p-2">Componente</th>
                        <th className="text-left p-2">Plataforma</th>
                        <th className="text-left p-2">Entorno</th>
                        <th className="text-left p-2">Tipo</th>
                        <th className="text-right p-2">Replicas</th>
                        <th className="text-left p-2">Nombre</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.deployments.map((d: any, i: number) => (
                        <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                          <td className="p-2 font-medium">{d.component}</td>
                          <td className="p-2">{d.platform}</td>
                          <td className="p-2">{d.environment}</td>
                          <td className="p-2 text-muted-foreground">{d.type}</td>
                          <td className="p-2 text-right">{d.replicas}</td>
                          <td className="p-2 text-muted-foreground text-xs">{d.deploymentName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Processes */}
            {detail.processes.length > 0 && (
              <div className="bg-card rounded-lg border border-border p-4">
                <h3 className="font-semibold mb-3">Procesos Soportados</h3>
                <div className="overflow-auto max-h-64">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-card">
                      <tr className="border-b border-border">
                        <th className="text-left p-2">Macroproceso</th>
                        <th className="text-left p-2">Proceso</th>
                        <th className="text-left p-2">Subprocesos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.processes.map((p: any, i: number) => (
                        <tr key={i} className="border-b border-border/50 hover:bg-muted/50 align-top">
                          <td className="p-2 font-medium">{p.macro}</td>
                          <td className="p-2">{p.proceso}</td>
                          <td className="p-2 text-xs text-muted-foreground">{p.subprocesos.join(', ')}</td>
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

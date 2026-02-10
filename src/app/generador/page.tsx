'use client'

import { useState, useEffect } from 'react'

export default function GeneradorPage() {
  const [vistaType, setVistaType] = useState<'capacidades' | 'aplicaciones' | 'integraciones'>('capacidades')
  const [filters, setFilters] = useState({
    lineaPrincipal: '',
    tipoLinea: '',
    capacidadL1: '',
  })

  const [lineasPrincipales, setLineasPrincipales] = useState<any[]>([])
  const [tiposLinea, setTiposLinea] = useState<any[]>([])
  const [capacidadesL1, setCapacidadesL1] = useState<any[]>([])

  const [diagramUrl, setDiagramUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [integrations, setIntegrations] = useState<any[]>([])
  const [integrationStats, setIntegrationStats] = useState<any>(null)
  const [integrationDiagramUrl, setIntegrationDiagramUrl] = useState<string | null>(null)

  // Load filter options on mount
  useEffect(() => {
    fetch('/api/diagrams/filters')
      .then((res) => res.json())
      .then((data) => {
        setLineasPrincipales(data.lineasPrincipales || [])
        setCapacidadesL1(data.capacidadesL1 || [])
      })
      .catch((err) => console.error('Error loading filters:', err))
  }, [])

  // Load tipos de linea and capacidades L1 when linea principal changes
  useEffect(() => {
    if (filters.lineaPrincipal) {
      fetch(`/api/diagrams/filters?lineaPrincipal=${filters.lineaPrincipal}`)
        .then((res) => res.json())
        .then((data) => {
          setTiposLinea(data.tiposLinea || [])
          setCapacidadesL1(data.capacidadesL1 || [])
        })
        .catch((err) => console.error('Error loading filters:', err))
    } else {
      setTiposLinea([])
      setCapacidadesL1([])
    }
  }, [filters.lineaPrincipal])

  // Load capacidades L1 when tipo linea changes
  useEffect(() => {
    if (filters.tipoLinea) {
      fetch(`/api/diagrams/filters?lineaPrincipal=${filters.lineaPrincipal}&tipoLinea=${filters.tipoLinea}`)
        .then((res) => res.json())
        .then((data) => {
          setCapacidadesL1(data.capacidadesL1 || [])
        })
        .catch((err) => console.error('Error loading capacidades L1:', err))
    } else if (filters.lineaPrincipal) {
      // Reset to linea principal capacidades if tipo linea is cleared
      fetch(`/api/diagrams/filters?lineaPrincipal=${filters.lineaPrincipal}`)
        .then((res) => res.json())
        .then((data) => {
          setCapacidadesL1(data.capacidadesL1 || [])
        })
        .catch((err) => console.error('Error loading capacidades L1:', err))
    }
  }, [filters.tipoLinea])

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setStats(null)
    setDiagramUrl(null)
    setIntegrations([])
    setIntegrationStats(null)
    setIntegrationDiagramUrl(null)

    try {
      const params = new URLSearchParams()
      if (filters.lineaPrincipal) params.set('lineaPrincipal', filters.lineaPrincipal)
      if (filters.tipoLinea) params.set('tipoLinea', filters.tipoLinea)

      if (vistaType === 'capacidades') {
        if (filters.capacidadL1) params.set('capacidadL1', filters.capacidadL1)

        const response = await fetch(`/api/diagrams/generate?${params.toString()}`)
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error generando diagrama')
        }
        const data = await response.json()
        setDiagramUrl(data.imageUrl)
        setStats(data.stats)
      } else if (vistaType === 'integraciones') {
        const response = await fetch(`/api/diagrams/integrations?${params.toString()}`)
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error consultando integraciones')
        }
        const data = await response.json()
        setIntegrations(data.integrations)
        setIntegrationStats(data.stats)
        setIntegrationDiagramUrl(data.imageUrl)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Diagram Generator</h1>
          <p className="text-sm text-muted-foreground">Genera diagramas de arquitectura empresarial desde la base de datos usando PlantUML</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">Filtros de Generación</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Selecciona el tipo de vista y los filtros para generar un diagrama arquitectónico personalizado.
        </p>

        {/* Vista Type Selector */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">Tipo de Vista</label>
          <select
            value={vistaType}
            onChange={(e) => {
              const newType = e.target.value as typeof vistaType
              setVistaType(newType)
              setFilters({ lineaPrincipal: '', tipoLinea: '', capacidadL1: '' })
              setDiagramUrl(null)
              setStats(null)
              setIntegrations([])
              setIntegrationStats(null)
              setIntegrationDiagramUrl(null)
              setError(null)
            }}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm md:w-1/3"
          >
            <option value="capacidades">Vista de Capacidades</option>
            <option value="aplicaciones" disabled>Vista de Aplicaciones (Próximamente)</option>
            <option value="integraciones">Vista de Integraciones</option>
          </select>
        </div>

        <div className={`grid gap-4 ${vistaType === 'capacidades' ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
          {/* Línea Principal Filter */}
          <div>
            <label className="mb-2 block text-sm font-medium">Línea Principal</label>
            <select
              value={filters.lineaPrincipal}
              onChange={(e) => {
                setFilters({ ...filters, lineaPrincipal: e.target.value, tipoLinea: '', capacidadL1: '' })
                setDiagramUrl(null)
                setIntegrations([])
                setIntegrationStats(null)
                setIntegrationDiagramUrl(null)
              }}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Todas las líneas</option>
              {lineasPrincipales.map((linea) => (
                <option key={linea.id_linea_negocio_principal} value={linea.id_linea_negocio_principal}>
                  {linea.descripcion}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de Línea Filter */}
          <div>
            <label className="mb-2 block text-sm font-medium">Tipo de Línea</label>
            <select
              value={filters.tipoLinea}
              onChange={(e) => {
                setFilters({ ...filters, tipoLinea: e.target.value, capacidadL1: '' })
                setDiagramUrl(null)
                setIntegrations([])
                setIntegrationStats(null)
                setIntegrationDiagramUrl(null)
              }}
              disabled={!filters.lineaPrincipal}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
            >
              <option value="">Todos los tipos</option>
              {tiposLinea.map((tipo) => (
                <option key={tipo.id_linea_negocio} value={tipo.id_linea_negocio}>
                  {tipo.tipo_linea_negocio}
                </option>
              ))}
            </select>
          </div>

          {/* Capacidad L1 Filter - only for capacidades view */}
          {vistaType === 'capacidades' && (
            <div>
              <label className="mb-2 block text-sm font-medium">Capacidad L1 (opcional)</label>
              <select
                value={filters.capacidadL1}
                onChange={(e) => {
                  setFilters({ ...filters, capacidadL1: e.target.value })
                  setDiagramUrl(null)
                }}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Todas las capacidades</option>
                {capacidadesL1.map((cap) => (
                  <option key={cap.id_capacidad} value={cap.id_capacidad}>
                    {cap.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading
              ? vistaType === 'integraciones' ? 'Consultando...' : 'Generando...'
              : vistaType === 'integraciones' ? 'Consultar Integraciones' : 'Generar Diagrama'}
          </button>

          {diagramUrl && vistaType === 'capacidades' && (
            <>
              <a
                href={diagramUrl}
                download
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                Descargar PNG
              </a>
              <a
                href={diagramUrl.replace('.png', '.puml')}
                download
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                Descargar PlantUML
              </a>
            </>
          )}

          {integrationDiagramUrl && vistaType === 'integraciones' && (
            <>
              <a
                href={integrationDiagramUrl}
                download
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                Descargar PNG
              </a>
              <a
                href={integrationDiagramUrl.replace('.png', '.puml')}
                download
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                Descargar PlantUML
              </a>
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">❌ {error}</p>
        </div>
      )}

      {/* Integration Stats */}
      {integrationStats && vistaType === 'integraciones' && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold">Resumen de Integraciones</h3>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm text-muted-foreground">Total Integraciones</p>
              <p className="text-2xl font-bold">{integrationStats.totalIntegrations}</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm text-muted-foreground">Apps Proveedoras</p>
              <p className="text-2xl font-bold">{integrationStats.uniqueProviders}</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm text-muted-foreground">Apps Consumidoras</p>
              <p className="text-2xl font-bold">{integrationStats.uniqueConsumers}</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm text-muted-foreground">Tipos de Interfaz</p>
              <p className="text-2xl font-bold">{integrationStats.interfaceTypes}</p>
            </div>
          </div>
        </div>
      )}

      {/* Integrations Table */}
      {integrations.length > 0 && vistaType === 'integraciones' && (
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Listado de Integraciones</h2>
          <div className="overflow-auto rounded-lg border" style={{ maxHeight: '600px' }}>
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">App Proveedora</th>
                  <th className="px-4 py-3 text-left font-medium">Componente Proveedor</th>
                  <th className="px-4 py-3 text-left font-medium">Interfaz</th>
                  <th className="px-4 py-3 text-left font-medium">Tipo</th>
                  <th className="px-4 py-3 text-left font-medium">Estado</th>
                  <th className="px-4 py-3 text-left font-medium">App Consumidora</th>
                  <th className="px-4 py-3 text-left font-medium">Componente Consumidor</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {integrations.map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/50">
                    <td className="px-4 py-2">{row.providerApp}</td>
                    <td className="px-4 py-2">{row.providerComponent}</td>
                    <td className="px-4 py-2 font-medium">{row.interfaceName}</td>
                    <td className="px-4 py-2">
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                        {row.interfaceType}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                        {row.interfaceStatus}
                      </span>
                    </td>
                    <td className="px-4 py-2">{row.consumerApp}</td>
                    <td className="px-4 py-2">{row.consumerComponent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Integration Diagram Viewer */}
      {integrationDiagramUrl && vistaType === 'integraciones' && (
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Diagrama Generado</h2>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const img = document.getElementById('integration-diagram-image') as HTMLImageElement
                  if (img) {
                    const currentWidth = parseFloat(img.style.width) || 100
                    img.style.width = Math.min(currentWidth + 20, 300) + '%'
                  }
                }}
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                Zoom +
              </button>
              <button
                onClick={() => {
                  const img = document.getElementById('integration-diagram-image') as HTMLImageElement
                  if (img) {
                    const currentWidth = parseFloat(img.style.width) || 100
                    img.style.width = Math.max(currentWidth - 20, 50) + '%'
                  }
                }}
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                Zoom -
              </button>
              <button
                onClick={() => {
                  const img = document.getElementById('integration-diagram-image') as HTMLImageElement
                  if (img) img.style.width = '100%'
                }}
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                Reset
              </button>
            </div>
          </div>
          <div className="overflow-auto rounded-lg border bg-white" style={{ maxHeight: '1200px', width: '100%' }}>
            <img
              id="integration-diagram-image"
              src={integrationDiagramUrl}
              alt="Blueprint de Integración Trivadis"
              style={{ width: '100%', height: 'auto', display: 'block' }}
              onError={() => {
                setError('Error cargando el diagrama de integraciones. Intenta generar nuevamente.')
              }}
              onLoad={(e) => {
                const img = e.target as HTMLImageElement
                const container = img.parentElement
                if (container && img.naturalWidth > 0) {
                  const containerWidth = container.clientWidth
                  const imageWidth = img.naturalWidth
                  if (imageWidth > containerWidth) {
                    img.style.width = (containerWidth / imageWidth) * 100 + '%'
                  } else {
                    img.style.width = '100%'
                  }
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Capabilities Stats Section */}
      {stats && vistaType === 'capacidades' && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold">Estadísticas del Diagrama</h3>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm text-muted-foreground">Capacidades L1</p>
              <p className="text-2xl font-bold">{stats.cap1}</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm text-muted-foreground">Capacidades L2</p>
              <p className="text-2xl font-bold">{stats.cap2}</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm text-muted-foreground">Capacidades L3</p>
              <p className="text-2xl font-bold">{stats.cap3}</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm text-muted-foreground">Aplicaciones</p>
              <p className="text-2xl font-bold">{stats.apps}</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm text-muted-foreground">Relaciones</p>
              <p className="text-2xl font-bold">{stats.relations}</p>
            </div>
          </div>
        </div>
      )}

      {/* Diagram Viewer */}
      {diagramUrl && vistaType === 'capacidades' && (
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Diagrama Generado</h2>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const img = document.getElementById('diagram-image') as HTMLImageElement
                  if (img) {
                    const currentWidth = parseFloat(img.style.width) || 100
                    const newWidth = Math.min(currentWidth + 20, 300)
                    img.style.width = newWidth + '%'
                  }
                }}
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                🔍 Zoom +
              </button>
              <button
                onClick={() => {
                  const img = document.getElementById('diagram-image') as HTMLImageElement
                  if (img) {
                    const currentWidth = parseFloat(img.style.width) || 100
                    const newWidth = Math.max(currentWidth - 20, 50)
                    img.style.width = newWidth + '%'
                  }
                }}
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                🔍 Zoom -
              </button>
              <button
                onClick={() => {
                  const img = document.getElementById('diagram-image') as HTMLImageElement
                  if (img) {
                    img.style.width = '100%'
                  }
                }}
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                ↺ Reset
              </button>
            </div>
          </div>
          <div className="overflow-auto rounded-lg border bg-white" style={{ maxHeight: '1200px', width: '100%' }}>
            <img
              id="diagram-image"
              src={diagramUrl}
              alt="Diagrama generado"
              style={{ width: '100%', height: 'auto', display: 'block' }}
              onError={(e) => {
                console.error('Error loading image:', diagramUrl)
                setError('Error cargando la imagen del diagrama. Intenta generar nuevamente.')
              }}
              onLoad={(e) => {
                console.log('Diagram loaded successfully:', diagramUrl)
                // Auto-fit diagram to container width on load
                const img = e.target as HTMLImageElement
                const container = img.parentElement
                if (container && img.naturalWidth > 0) {
                  const containerWidth = container.clientWidth
                  const imageWidth = img.naturalWidth
                  // If image is wider than container, scale it down to fit
                  // Otherwise, show it at 100% (but not larger than container)
                  if (imageWidth > containerWidth) {
                    const fitPercentage = (containerWidth / imageWidth) * 100
                    img.style.width = fitPercentage + '%'
                  } else {
                    img.style.width = '100%'
                  }
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">Instrucciones de Uso</h2>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>1. Selecciona el Tipo de Vista:</strong> Elige entre Vista de Capacidades o Vista de Integraciones.
          </p>
          <p>
            <strong>2. Selecciona una Línea Principal:</strong> Elige entre Combustible, Lubricantes, Tiendas de Conveniencia, etc.
          </p>
          <p>
            <strong>3. Filtra por Tipo de Línea (opcional):</strong> Si elegiste Combustible, puedes filtrar por Aviación, EDS, Flotas, etc.
          </p>
          {vistaType === 'capacidades' && (
            <p>
              <strong>4. Filtra por Capacidad L1 (opcional):</strong> Enfócate en una capacidad específica como "Gestión de la cadena de suministro".
            </p>
          )}
          <p>
            <strong>{vistaType === 'capacidades' ? '5' : '4'}. Haz clic en "{vistaType === 'integraciones' ? 'Consultar Integraciones' : 'Generar Diagrama'}":</strong>{' '}
            {vistaType === 'integraciones'
              ? 'El sistema mostrará una tabla con las integraciones entre aplicaciones.'
              : 'El sistema generará el diagrama PlantUML con todas las conexiones visibles.'}
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Los datos se consultan en tiempo real desde la base de datos.
          </p>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Metadata } from 'next'

export default function GeneradorPage() {
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

    try {
      const params = new URLSearchParams()
      if (filters.lineaPrincipal) params.set('lineaPrincipal', filters.lineaPrincipal)
      if (filters.tipoLinea) params.set('tipoLinea', filters.tipoLinea)
      if (filters.capacidadL1) params.set('capacidadL1', filters.capacidadL1)

      const response = await fetch(`/api/diagrams/generate?${params.toString()}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error generando diagrama')
      }

      const data = await response.json()
      setDiagramUrl(data.imageUrl)
      setStats(data.stats)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Generador de Diagramas</h1>
      </div>

      {/* Filters Section */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">Filtros de Generación</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Selecciona los filtros para generar un diagrama arquitectónico personalizado.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Línea Principal Filter */}
          <div>
            <label className="mb-2 block text-sm font-medium">Línea Principal</label>
            <select
              value={filters.lineaPrincipal}
              onChange={(e) => {
                setFilters({ ...filters, lineaPrincipal: e.target.value, tipoLinea: '', capacidadL1: '' })
                setDiagramUrl(null)
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

          {/* Capacidad L1 Filter */}
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
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={handleGenerate}
            disabled={loading || !filters.lineaPrincipal}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Generando...' : 'Generar Diagrama'}
          </button>

          {diagramUrl && (
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
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">❌ {error}</p>
        </div>
      )}

      {/* Stats Section */}
      {stats && (
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
      {diagramUrl && (
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
            <strong>1. Selecciona una Línea Principal:</strong> Elige entre Combustible, Lubricantes, Tiendas de Conveniencia, etc.
          </p>
          <p>
            <strong>2. Filtra por Tipo de Línea (opcional):</strong> Si elegiste Combustible, puedes filtrar por Aviación, EDS, Flotas, etc.
          </p>
          <p>
            <strong>3. Filtra por Capacidad L1 (opcional):</strong> Enfócate en una capacidad específica como "Gestión de la cadena de suministro".
          </p>
          <p>
            <strong>4. Haz clic en "Generar Diagrama":</strong> El sistema generará el diagrama PlantUML con todas las conexiones visibles.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            ⚡ Los diagramas se generan en tiempo real consultando la base de datos y usando PlantUML.
          </p>
        </div>
      </div>
    </div>
  )
}

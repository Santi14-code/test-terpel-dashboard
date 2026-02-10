import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseFilters, buildAppWhere } from '@/lib/filters'

const CRIT_SCORE: Record<string, number> = { Crítica: 4, Alta: 3, Media: 2, Baja: 1 }
const TCO_BY_MODEL: Record<string, number> = { SaaS: 45000, PaaS: 65000, IaaS: 95000, 'On-Premise': 120000 }

export async function GET(request: NextRequest) {
  const filters = parseFilters(request)
  const appWhere = buildAppWhere(filters)

  const apps = await prisma.tbl_aplicacion.findMany({
    where: appWhere,
    select: {
      id_aplicacion: true,
      nombre: true,
      criticidad: true,
      proveedor: true,
      cat_modelo_servicio: { select: { nombre: true } },
      tbl_componente_logico: {
        select: {
          id_tecnologia: true,
          rel_componente_log_despliegue: {
            select: {
              tbl_componente_despliegue: {
                select: { id_plataforma: true },
              },
            },
          },
        },
      },
      _count: { select: { tbl_componente_logico: true, tbl_interfaz: true } },
    },
  })

  // Build scatter data
  const scatterData = apps.map((app) => {
    const components = app._count.tbl_componente_logico
    const interfaces = app._count.tbl_interfaz
    const uniqueTechs = new Set(app.tbl_componente_logico.map((c) => c.id_tecnologia).filter(Boolean)).size
    const uniquePlatforms = new Set(
      app.tbl_componente_logico.flatMap((c) =>
        c.rel_componente_log_despliegue.map((d) => d.tbl_componente_despliegue.id_plataforma)
      )
    ).size

    // Complexity: normalized composite of components, techs, platforms
    const complexity = components + uniqueTechs * 2 + uniquePlatforms * 3
    const critScore = CRIT_SCORE[app.criticidad || 'Baja'] || 1
    const vendor = app.proveedor || 'Sin proveedor'
    const tco = TCO_BY_MODEL[app.cat_modelo_servicio.nombre] || 75000

    return {
      name: app.nombre,
      criticidad: app.criticidad || 'Sin definir',
      vendor,
      complexity,
      critScore,
      interfaces,
      components,
      uniqueTechs,
      uniquePlatforms,
      tco,
      // Quadrant classification
      quadrant:
        critScore >= 3 && complexity >= 10
          ? 'critical'
          : critScore >= 3
            ? 'monitor-high'
            : complexity >= 10
              ? 'monitor-complex'
              : 'stable',
    }
  })

  // Sort by risk (critScore * complexity) descending
  scatterData.sort((a, b) => b.critScore * b.complexity - a.critScore * a.complexity)

  // Quadrant counts
  const quadrants = {
    critical: scatterData.filter((d) => d.quadrant === 'critical').length,
    monitorHigh: scatterData.filter((d) => d.quadrant === 'monitor-high').length,
    monitorComplex: scatterData.filter((d) => d.quadrant === 'monitor-complex').length,
    stable: scatterData.filter((d) => d.quadrant === 'stable').length,
  }

  // Top 10 in red zone
  const redZone = scatterData
    .filter((d) => d.quadrant === 'critical')
    .slice(0, 10)
    .map((d) => ({
      name: d.name,
      criticidad: d.criticidad,
      complexity: d.complexity,
      interfaces: d.interfaces,
      components: d.components,
      vendor: d.vendor,
      tco: d.tco,
      action:
        d.complexity > 20
          ? 'Descomponer en microservicios'
          : d.interfaces > 5
            ? 'Reducir acoplamiento de interfaces'
            : 'Modernizar stack tecnologico',
    }))

  // Unique vendors for color legend
  const vendors = [...new Set(scatterData.map((d) => d.vendor))].sort()

  return NextResponse.json({
    scatter: scatterData,
    quadrants,
    redZone,
    vendors,
    totalApps: apps.length,
  })
}

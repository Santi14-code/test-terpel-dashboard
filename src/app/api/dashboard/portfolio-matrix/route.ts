import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseFilters, buildAppWhere } from '@/lib/filters'

const CLOUD_MODELS = ['SaaS', 'PaaS', 'IaaS']
const CRIT_VALUE: Record<string, number> = { Crítica: 10, Alta: 7, Media: 4, Baja: 1 }

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
          url_documentacion: true,
          cat_tecnologia: { select: { nombre: true } },
          rel_componente_log_subproceso: { select: { id_componente_log_subproceso: true } },
        },
      },
      _count: { select: { tbl_componente_logico: true, tbl_interfaz: true } },
    },
  })

  const scatterData = apps.map((app) => {
    // Business Value (Y axis): criticality + process coverage + integration count
    const critValue = CRIT_VALUE[app.criticidad || 'Baja'] || 1
    const processLinks = app.tbl_componente_logico.reduce(
      (sum, c) => sum + c.rel_componente_log_subproceso.length, 0
    )
    const businessValue = Math.min(critValue + Math.min(processLinks, 5) + Math.min(app._count.tbl_interfaz * 0.5, 3), 18)

    // Technical Capability (X axis): cloud model, documentation, tech diversity
    const isCloud = CLOUD_MODELS.includes(app.cat_modelo_servicio.nombre)
    const hasDocumentation = app.tbl_componente_logico.some((c) => c.url_documentacion)
    const uniqueTechs = new Set(app.tbl_componente_logico.map((c) => c.cat_tecnologia?.nombre).filter(Boolean)).size
    const techScore = (isCloud ? 6 : 2) + (hasDocumentation ? 3 : 0) + Math.min(uniqueTechs, 4) + (app.cat_modelo_servicio.nombre === 'SaaS' ? 3 : 0)

    // Quadrant classification (thresholds at midpoint)
    const highValue = businessValue >= 9
    const highTech = techScore >= 9
    const quadrant = highValue && highTech
      ? 'invest'
      : highValue && !highTech
        ? 'migrate'
        : !highValue && highTech
          ? 'tolerate'
          : 'eliminate'

    return {
      name: app.nombre,
      criticidad: app.criticidad || 'Sin definir',
      businessValue: +businessValue.toFixed(1),
      techScore,
      components: app._count.tbl_componente_logico,
      interfaces: app._count.tbl_interfaz,
      model: app.cat_modelo_servicio.nombre,
      quadrant,
    }
  })

  const quadrants = {
    invest: scatterData.filter((d) => d.quadrant === 'invest').length,
    migrate: scatterData.filter((d) => d.quadrant === 'migrate').length,
    tolerate: scatterData.filter((d) => d.quadrant === 'tolerate').length,
    eliminate: scatterData.filter((d) => d.quadrant === 'eliminate').length,
  }

  // Quick wins: apps in eliminate quadrant
  const quickWins = scatterData
    .filter((d) => d.quadrant === 'eliminate')
    .sort((a, b) => a.businessValue - b.businessValue)
    .slice(0, 10)

  // Migration candidates: high value but low tech
  const migrationCandidates = scatterData
    .filter((d) => d.quadrant === 'migrate')
    .sort((a, b) => b.businessValue - a.businessValue)
    .slice(0, 10)

  return NextResponse.json({
    scatter: scatterData,
    quadrants,
    quickWins,
    migrationCandidates,
    totalApps: apps.length,
  })
}

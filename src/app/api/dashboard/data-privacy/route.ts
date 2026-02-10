import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseFilters, buildAppWhere } from '@/lib/filters'

const CLOUD_MODELS = ['SaaS', 'PaaS', 'IaaS']

export async function GET(request: NextRequest) {
  const filters = parseFilters(request)
  const appWhere = buildAppWhere(filters)

  const [components, filteredApps] = await Promise.all([
    prisma.tbl_componente_logico.findMany({
      include: {
        tbl_aplicacion: {
          select: {
            id_aplicacion: true,
            nombre: true,
            criticidad: true,
            responsable: true,
            cat_modelo_servicio: { select: { nombre: true } },
          },
        },
        cat_tecnologia: { select: { nombre: true } },
        rel_componente_log_despliegue: {
          include: {
            tbl_componente_despliegue: {
              include: {
                cat_plataforma: { select: { nombre: true } },
                cat_entorno: { select: { nombre: true } },
              },
            },
          },
        },
        rel_com_interfaz_consumo: { select: { id_interfaz_consumo: true } },
      },
    }),
    prisma.tbl_aplicacion.findMany({
      where: appWhere,
      select: { id_aplicacion: true },
    }),
  ])

  const filteredIds = new Set(filteredApps.map((a) => a.id_aplicacion))

  const relevant = components.filter((c) => filteredIds.has(c.tbl_aplicacion.id_aplicacion))
  const withPersonalData = relevant.filter((c) => c.is_contiene_datos_personales === 'Si')

  // Unique apps with personal data
  const appsWithPD = new Map<number, { nombre: string; criticidad: string | null; responsable: string | null }>()
  for (const c of withPersonalData) {
    appsWithPD.set(c.tbl_aplicacion.id_aplicacion, {
      nombre: c.tbl_aplicacion.nombre,
      criticidad: c.tbl_aplicacion.criticidad,
      responsable: c.tbl_aplicacion.responsable,
    })
  }

  const criticalAppsWithPD = [...appsWithPD.values()].filter((a) => a.criticidad === 'Crítica' || a.criticidad === 'Alta').length
  const cloudPD = withPersonalData.filter((c) => CLOUD_MODELS.includes(c.tbl_aplicacion.cat_modelo_servicio.nombre)).length
  const noResponsible = withPersonalData.filter((c) => !c.tbl_aplicacion.responsable).length

  // Detailed table
  const detailTable = withPersonalData.map((c) => {
    const platforms = c.rel_componente_log_despliegue.map((d) => d.tbl_componente_despliegue.cat_plataforma.nombre)
    const environments = c.rel_componente_log_despliegue.map((d) => d.tbl_componente_despliegue.cat_entorno.nombre)
    return {
      component: c.nombre,
      app: c.tbl_aplicacion.nombre,
      criticidad: c.tbl_aplicacion.criticidad || 'Sin definir',
      model: c.tbl_aplicacion.cat_modelo_servicio.nombre,
      technology: c.cat_tecnologia?.nombre || 'Sin tecnologia',
      responsible: c.tbl_aplicacion.responsable || 'Sin asignar',
      platforms: [...new Set(platforms)],
      environments: [...new Set(environments)],
      consumers: c.rel_com_interfaz_consumo.length,
      isCloud: CLOUD_MODELS.includes(c.tbl_aplicacion.cat_modelo_servicio.nombre),
    }
  })

  // Risk flags
  const risks = {
    cloudWithPD: detailTable.filter((d) => d.isCloud).length,
    criticalNoResponsible: detailTable.filter((d) => (d.criticidad === 'Crítica' || d.criticidad === 'Alta') && d.responsible === 'Sin asignar').length,
    highExposure: detailTable.filter((d) => d.consumers > 3).length,
  }

  // Distribution by model
  const modelDist: Record<string, number> = {}
  for (const c of withPersonalData) {
    const m = c.tbl_aplicacion.cat_modelo_servicio.nombre
    modelDist[m] = (modelDist[m] || 0) + 1
  }
  const modelDistribution = Object.entries(modelDist)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  // Distribution by criticality
  const critDist: Record<string, number> = {}
  for (const a of appsWithPD.values()) {
    const cr = a.criticidad || 'Sin definir'
    critDist[cr] = (critDist[cr] || 0) + 1
  }
  const critDistribution = Object.entries(critDist)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  return NextResponse.json({
    kpis: {
      componentsWithPD: withPersonalData.length,
      appsWithPD: appsWithPD.size,
      criticalAppsWithPD,
      cloudPercent: withPersonalData.length > 0 ? Math.round((cloudPD / withPersonalData.length) * 100) : 0,
      noResponsible,
    },
    detailTable,
    risks,
    modelDistribution,
    critDistribution,
  })
}

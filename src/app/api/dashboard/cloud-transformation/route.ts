import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseFilters, buildAppWhere } from '@/lib/filters'

const CLOUD_MODELS = ['SaaS', 'PaaS', 'IaaS']
const CLOUD_TARGET = 80 // 80% cloud goal

export async function GET(request: NextRequest) {
  const filters = parseFilters(request)
  const appWhere = buildAppWhere(filters)

  const [apps, platforms, models] = await Promise.all([
    prisma.tbl_aplicacion.findMany({
      where: appWhere,
      select: {
        id_aplicacion: true,
        nombre: true,
        criticidad: true,
        cat_modelo_servicio: { select: { nombre: true } },
        tbl_componente_logico: {
          select: {
            rel_componente_log_despliegue: {
              select: {
                tbl_componente_despliegue: {
                  select: {
                    cat_plataforma: { select: { nombre: true } },
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.cat_plataforma.findMany({
      select: { nombre: true },
    }),
    prisma.cat_modelo_servicio.findMany({
      select: { nombre: true, _count: { select: { tbl_aplicacion: true } } },
    }),
  ])

  // Cloud vs On-Premise distribution
  const cloudApps = apps.filter((a) => CLOUD_MODELS.includes(a.cat_modelo_servicio.nombre))
  const onPremApps = apps.filter((a) => !CLOUD_MODELS.includes(a.cat_modelo_servicio.nombre))
  const cloudPercent = apps.length > 0 ? Math.round((cloudApps.length / apps.length) * 100) : 0

  // Donut: by model type
  const modelCounts: Record<string, number> = {}
  for (const app of apps) {
    const m = app.cat_modelo_servicio.nombre
    modelCounts[m] = (modelCounts[m] || 0) + 1
  }
  const modelDistribution = Object.entries(modelCounts)
    .map(([name, value]) => ({
      name,
      value,
      isCloud: CLOUD_MODELS.includes(name),
    }))
    .sort((a, b) => b.value - a.value)

  // Platform distribution: by platform × criticality
  const platformCritMap: Record<string, Record<string, number>> = {}
  for (const app of apps) {
    const platSet = new Set<string>()
    for (const comp of app.tbl_componente_logico) {
      for (const depl of comp.rel_componente_log_despliegue) {
        platSet.add(depl.tbl_componente_despliegue.cat_plataforma.nombre)
      }
    }
    for (const plat of platSet) {
      if (!platformCritMap[plat]) platformCritMap[plat] = {}
      const crit = app.criticidad || 'Sin definir'
      platformCritMap[plat][crit] = (platformCritMap[plat][crit] || 0) + 1
    }
  }

  const platformDistribution = Object.entries(platformCritMap)
    .map(([platform, crits]) => ({
      platform,
      Crítica: crits['Crítica'] || 0,
      Alta: crits['Alta'] || 0,
      Media: crits['Media'] || 0,
      Baja: crits['Baja'] || 0,
      total: Object.values(crits).reduce((s, v) => s + v, 0),
    }))
    .sort((a, b) => b.total - a.total)

  // Cloud apps list (for migration tracking)
  const onPremCritical = onPremApps
    .filter((a) => a.criticidad === 'Crítica' || a.criticidad === 'Alta')
    .map((a) => ({
      name: a.nombre,
      criticidad: a.criticidad,
      model: a.cat_modelo_servicio.nombre,
    }))
    .sort((a, b) => (a.criticidad === 'Crítica' ? -1 : 0) - (b.criticidad === 'Crítica' ? -1 : 0))

  return NextResponse.json({
    kpis: {
      totalApps: apps.length,
      cloudApps: cloudApps.length,
      onPremApps: onPremApps.length,
      cloudPercent,
      cloudTarget: CLOUD_TARGET,
      gap: Math.max(CLOUD_TARGET - cloudPercent, 0),
    },
    modelDistribution,
    platformDistribution,
    onPremCritical: onPremCritical.slice(0, 20),
  })
}

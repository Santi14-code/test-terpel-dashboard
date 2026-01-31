import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseFilters, buildAppWhere } from '@/lib/filters'

const TCO_BY_MODEL: Record<string, number> = { SaaS: 45000, PaaS: 65000, IaaS: 95000, 'On-Premise': 120000 }
const CRIT_MULT: Record<string, number> = { Crítica: 1.5, Alta: 1.2, Media: 1.0, Baja: 0.8 }
const CLOUD_MODELS = ['SaaS', 'PaaS', 'IaaS']

export async function GET(request: NextRequest) {
  const filters = parseFilters(request)
  const appWhere = buildAppWhere(filters)

  const [
    appsCount, componentesCount, tecnologiasCount,
    apps, appsByCriticidad, modelos, macroprocessCoverage,
  ] = await Promise.all([
    prisma.tbl_aplicacion.count({ where: appWhere }),
    prisma.tbl_componente_logico.count(),
    prisma.cat_tecnologia.count(),
    prisma.tbl_aplicacion.findMany({
      where: appWhere,
      select: {
        criticidad: true,
        cat_modelo_servicio: { select: { nombre: true } },
        _count: { select: { tbl_componente_logico: true, tbl_interfaz: true } },
        tbl_componente_logico: {
          select: { url_documentacion: true },
        },
      },
    }),
    prisma.tbl_aplicacion.groupBy({ by: ['criticidad'], where: appWhere, _count: { id_aplicacion: true } }),
    prisma.cat_modelo_servicio.findMany({
      select: { nombre: true, _count: { select: { tbl_aplicacion: true } } },
    }),
    prisma.cat_macroproceso.findMany({
      include: {
        cat_proceso: {
          include: {
            cat_subproceso: {
              include: { _count: { select: { rel_componente_log_subproceso: true } } },
            },
          },
        },
      },
    }),
  ])

  // TCO
  let totalTCO = 0
  let cloudCount = 0
  let documentedCount = 0
  let totalDebt = 0

  for (const app of apps) {
    const baseCost = TCO_BY_MODEL[app.cat_modelo_servicio.nombre] || 75000
    const critMult = CRIT_MULT[app.criticidad || 'Media'] || 1.0
    const compMult = 1 + (app._count.tbl_componente_logico * 0.05)
    totalTCO += Math.round(baseCost * critMult * compMult)

    if (CLOUD_MODELS.includes(app.cat_modelo_servicio.nombre)) cloudCount++
    if (app.tbl_componente_logico.some((c) => c.url_documentacion)) documentedCount++

    // Simple debt
    let debt = 0
    if (app.criticidad === 'Crítica') debt += 30
    else if (app.criticidad === 'Alta') debt += 20
    else debt += 10
    if (app._count.tbl_componente_logico > 10) debt += 15
    if (!app.tbl_componente_logico.some((c) => c.url_documentacion)) debt += 15
    totalDebt += Math.min(debt, 100)
  }

  const avgDebt = apps.length > 0 ? Math.round(totalDebt / apps.length) : 0
  const cloudAdoption = apps.length > 0 ? Math.round((cloudCount / apps.length) * 100) : 0
  const docCoverage = apps.length > 0 ? Math.round((documentedCount / apps.length) * 100) : 0

  // Coverage
  const totalSub = macroprocessCoverage.flatMap((m) => m.cat_proceso.flatMap((p) => p.cat_subproceso)).length
  const coveredSub = macroprocessCoverage.flatMap((m) =>
    m.cat_proceso.flatMap((p) => p.cat_subproceso.filter((s) => s._count.rel_componente_log_subproceso > 0))
  ).length
  const overallCoverage = totalSub > 0 ? Math.round((coveredSub / totalSub) * 100) : 0

  return NextResponse.json({
    kpis: {
      apps: appsCount,
      componentes: componentesCount,
      tecnologias: tecnologiasCount,
      totalTCO,
      avgDebt,
      cloudAdoption,
      docCoverage,
      overallCoverage,
    },
    criticality: appsByCriticidad.map((c) => ({
      name: c.criticidad || 'Sin definir',
      value: c._count.id_aplicacion,
    })),
    modelDistribution: modelos.map((m) => ({ name: m.nombre, value: m._count.tbl_aplicacion })),
    coverageByMacro: macroprocessCoverage.map((m) => {
      const total = m.cat_proceso.flatMap((p) => p.cat_subproceso).length
      const covered = m.cat_proceso.flatMap((p) => p.cat_subproceso.filter((s) => s._count.rel_componente_log_subproceso > 0)).length
      return { name: m.nombre, total, covered, uncovered: total - covered }
    }),
  })
}

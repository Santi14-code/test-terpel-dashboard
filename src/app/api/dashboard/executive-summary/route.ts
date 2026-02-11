import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseFilters, buildAppWhere } from '@/lib/filters'

const CLOUD_MODELS = ['SaaS', 'PaaS', 'IaaS']

export async function GET(request: NextRequest) {
  const filters = parseFilters(request)
  const appWhere = buildAppWhere(filters)

  const [
    totalApps,
    criticalApps,
    totalComponents,
    activeInterfaces,
    cloudApps,
    uniqueTechs,
    macroprocessCoverage,
    criticalityGrouped,
    heatmapData,
  ] = await Promise.all([
    prisma.tbl_aplicacion.count({ where: appWhere }),
    prisma.tbl_aplicacion.count({
      where: { ...appWhere, criticidad: 'Crítica' },
    }),
    prisma.tbl_componente_logico.count(),
    prisma.tbl_interfaz.count({ where: { estado: 'Activa' } }),
    prisma.tbl_aplicacion.count({
      where: {
        ...appWhere,
        cat_modelo_servicio: { nombre: { in: CLOUD_MODELS } },
      },
    }),
    prisma.cat_tecnologia.count(),
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
    prisma.tbl_aplicacion.groupBy({
      by: ['criticidad'],
      where: appWhere,
      _count: { id_aplicacion: true },
    }),
    // Heatmap: macroproceso -> proceso -> subproceso -> rel -> componente_logico (with tech)
    prisma.cat_macroproceso.findMany({
      include: {
        cat_proceso: {
          include: {
            cat_subproceso: {
              include: {
                rel_componente_log_subproceso: {
                  include: {
                    tbl_componente_logico: {
                      select: {
                        cat_tecnologia: { select: { nombre: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }),
  ])

  // Coverage calculation
  const totalSub = macroprocessCoverage.flatMap((m) => m.cat_proceso.flatMap((p) => p.cat_subproceso)).length
  const coveredSub = macroprocessCoverage.flatMap((m) =>
    m.cat_proceso.flatMap((p) => p.cat_subproceso.filter((s) => s._count.rel_componente_log_subproceso > 0))
  ).length

  const criticalPercent = totalApps > 0 ? Math.round((criticalApps / totalApps) * 100) : 0
  const cloudPercent = totalApps > 0 ? Math.round((cloudApps / totalApps) * 100) : 0
  const macroprocessCoveragePercent = totalSub > 0 ? Math.round((coveredSub / totalSub) * 100) : 0

  // Criticality distribution for donut
  const criticality = criticalityGrouped.map((c) => ({
    name: c.criticidad || 'Sin definir',
    value: c._count.id_aplicacion,
  }))

  // Build heatmap: count links between each macroproceso and each technology
  const macroCounts: Record<string, number> = {}
  const techCounts: Record<string, number> = {}
  const crossTab: Record<string, Record<string, number>> = {}

  for (const macro of heatmapData) {
    let macroTotal = 0
    for (const proc of macro.cat_proceso) {
      for (const sub of proc.cat_subproceso) {
        for (const rel of sub.rel_componente_log_subproceso) {
          const techName = rel.tbl_componente_logico.cat_tecnologia?.nombre
          if (!techName) continue
          macroTotal++
          techCounts[techName] = (techCounts[techName] || 0) + 1
          if (!crossTab[macro.nombre]) crossTab[macro.nombre] = {}
          crossTab[macro.nombre][techName] = (crossTab[macro.nombre][techName] || 0) + 1
        }
      }
    }
    macroCounts[macro.nombre] = macroTotal
  }

  // Top 5 macroprocesos by total links
  const top5Macros = Object.entries(macroCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name)

  // Top 5 technologies by total links
  const top5Techs = Object.entries(techCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name)

  // Build matrix[macro][tech]
  const matrix = top5Macros.map((macro) =>
    top5Techs.map((tech) => crossTab[macro]?.[tech] || 0)
  )

  return NextResponse.json({
    kpis: {
      totalApps,
      criticalPercent,
      totalComponents,
      activeInterfaces,
      cloudPercent,
      uniqueTechs,
      macroprocessCoverage: macroprocessCoveragePercent,
    },
    criticality,
    heatmap: {
      macroprocesses: top5Macros,
      technologies: top5Techs,
      matrix,
    },
  })
}

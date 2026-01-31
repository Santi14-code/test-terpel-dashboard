import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseFilters, buildAppWhere } from '@/lib/filters'

export async function GET(request: NextRequest) {
  const filters = parseFilters(request)
  const appWhere = buildAppWhere(filters)

  const [
    appsCount,
    componentesCount,
    tecnologiasCount,
    macroprocesosCount,
    procesosCount,
    subprocesosCount,
    appsByCriticidad,
    appsByComponentCount,
    techUsage,
    capabilityHierarchy,
    processHierarchy,
    macroprocessCoverage,
  ] = await Promise.all([
    prisma.tbl_aplicacion.count({ where: appWhere }),
    prisma.tbl_componente_logico.count(),
    prisma.cat_tecnologia.count(),
    prisma.cat_macroproceso.count(),
    prisma.cat_proceso.count(),
    prisma.cat_subproceso.count(),

    // Apps by criticidad
    prisma.tbl_aplicacion.groupBy({
      by: ['criticidad'],
      where: appWhere,
      _count: { id_aplicacion: true },
    }),

    // Top 10 apps by component count
    prisma.tbl_aplicacion.findMany({
      where: appWhere,
      select: {
        id_aplicacion: true,
        nombre: true,
        criticidad: true,
        _count: { select: { tbl_componente_logico: true } },
      },
      orderBy: { tbl_componente_logico: { _count: 'desc' } },
      take: 10,
    }),

    // Tech usage (top 20)
    prisma.cat_tecnologia.findMany({
      select: {
        nombre: true,
        categoria: true,
        _count: { select: { tbl_componente_logico: true } },
      },
      orderBy: { tbl_componente_logico: { _count: 'desc' } },
      take: 20,
    }),

    // Capability hierarchy for sunburst
    prisma.cat_capacidad.findMany({
      include: {
        cat_capacidad_nivel_2: {
          include: {
            cat_capacidad_nivel_3: {
              include: {
                rel_subproceso_capacidad_nvl_3: {
                  include: {
                    cat_subproceso: {
                      include: {
                        rel_componente_log_subproceso: {
                          include: {
                            tbl_componente_logico: {
                              select: { id_aplicacion: true },
                            },
                          },
                        },
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

    // Process hierarchy for treemap
    prisma.cat_macroproceso.findMany({
      include: {
        cat_proceso: {
          include: {
            cat_subproceso: {
              include: {
                rel_componente_log_subproceso: {
                  select: { id_componente_logico: true },
                },
              },
            },
          },
        },
      },
    }),

    // Macroprocess coverage
    prisma.cat_macroproceso.findMany({
      include: {
        cat_proceso: {
          include: {
            cat_subproceso: {
              include: {
                _count: { select: { rel_componente_log_subproceso: true } },
              },
            },
          },
        },
      },
    }),
  ])

  // Transform criticidad data
  const criticalityData = appsByCriticidad.map((c) => ({
    name: c.criticidad || 'Sin definir',
    value: c._count.id_aplicacion,
  }))

  // Transform top apps
  const topAppsByComponents = appsByComponentCount.map((a) => ({
    name: a.nombre,
    components: a._count.tbl_componente_logico,
    criticidad: a.criticidad,
  }))

  // Transform tech usage
  const techData = techUsage.map((t) => ({
    name: t.nombre,
    categoria: t.categoria,
    count: t._count.tbl_componente_logico,
  }))

  // Transform sunburst data (with fill colors for SunburstChart)
  const SUNBURST_COLORS = ['#EA352C', '#44546A', '#FAE44C', '#28A745', '#6F42C1', '#FD7E14', '#20C997', '#E83E8C', '#17A2B8', '#6C757D']
  const sunburstData = {
    name: 'Capacidades',
    children: capabilityHierarchy.map((cap1, i) => {
      const baseColor = SUNBURST_COLORS[i % SUNBURST_COLORS.length]
      return {
        name: cap1.nombre,
        fill: baseColor,
        children: cap1.cat_capacidad_nivel_2.map((cap2) => ({
          name: cap2.nombre,
          fill: baseColor + 'CC',
          children: cap2.cat_capacidad_nivel_3.map((cap3) => {
            const appIds = new Set<number>()
            cap3.rel_subproceso_capacidad_nvl_3.forEach((rel) => {
              rel.cat_subproceso.rel_componente_log_subproceso.forEach((r) => {
                appIds.add(r.tbl_componente_logico.id_aplicacion)
              })
            })
            return { name: cap3.nombre, fill: baseColor + '88', value: Math.max(appIds.size, 1) }
          }),
        })),
      }
    }),
  }

  // Transform treemap data
  const treemapData = {
    name: 'Procesos',
    children: processHierarchy.map((macro) => ({
      name: macro.nombre,
      children: macro.cat_proceso.map((proc) => ({
        name: proc.nombre,
        children: proc.cat_subproceso.map((sub) => ({
          name: sub.nombre || 'Sin nombre',
          value: sub.rel_componente_log_subproceso.length || 1,
        })),
      })),
    })),
  }

  // Macroprocess coverage
  const coverageData = macroprocessCoverage.map((macro) => {
    const totalSub = macro.cat_proceso.flatMap((p) => p.cat_subproceso).length
    const coveredSub = macro.cat_proceso.flatMap((p) =>
      p.cat_subproceso.filter((s) => s._count.rel_componente_log_subproceso > 0)
    ).length
    return {
      name: macro.nombre,
      total: totalSub,
      covered: coveredSub,
      uncovered: totalSub - coveredSub,
      percentage: totalSub > 0 ? Math.round((coveredSub / totalSub) * 100) : 0,
    }
  })

  return NextResponse.json({
    kpis: {
      apps: appsCount,
      componentes: componentesCount,
      tecnologias: tecnologiasCount,
      macroprocesos: macroprocesosCount,
      procesos: procesosCount,
      subprocesos: subprocesosCount,
    },
    criticality: criticalityData,
    topAppsByComponents,
    techUsage: techData,
    sunburst: sunburstData,
    treemap: treemapData,
    macroprocessCoverage: coverageData,
  })
}

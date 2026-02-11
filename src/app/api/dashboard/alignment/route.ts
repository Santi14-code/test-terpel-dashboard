import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseFilters, buildAppWhere } from '@/lib/filters'

export async function GET(request: NextRequest) {
  const filters = parseFilters(request)
  const appWhere = buildAppWhere(filters)
  const [capabilities, macroprocesses, appCount] = await Promise.all([
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
                          include: { tbl_componente_logico: { select: { id_aplicacion: true } } },
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

    prisma.cat_macroproceso.findMany({
      include: {
        cat_proceso: {
          include: {
            cat_subproceso: {
              include: {
                rel_componente_log_subproceso: {
                  include: { tbl_componente_logico: { select: { id_aplicacion: true, nombre: true } } },
                },
                rel_subproceso_capacidad_nvl_3: {
                  include: { cat_capacidad_nivel_3: { select: { nombre: true } } },
                },
              },
            },
          },
        },
      },
    }),

    prisma.tbl_aplicacion.count(),
  ])

  // Sankey: Capabilities -> Subprocesses -> Apps
  const sankeyNodes: { name: string }[] = []
  const sankeyLinks: { source: number; target: number; value: number }[] = []
  const nodeIndex = new Map<string, number>()

  function getNodeIdx(name: string) {
    if (!nodeIndex.has(name)) {
      nodeIndex.set(name, sankeyNodes.length)
      sankeyNodes.push({ name })
    }
    return nodeIndex.get(name)!
  }

  for (const cap1 of capabilities) {
    const cap1Idx = getNodeIdx(`Cap: ${cap1.nombre}`)
    for (const cap2 of cap1.cat_capacidad_nivel_2) {
      for (const cap3 of cap2.cat_capacidad_nivel_3) {
        const appIds = new Set<number>()
        for (const rel of cap3.rel_subproceso_capacidad_nvl_3) {
          for (const r of rel.cat_subproceso.rel_componente_log_subproceso) {
            appIds.add(r.tbl_componente_logico.id_aplicacion)
          }
        }
        if (appIds.size > 0) {
          const cap3Idx = getNodeIdx(cap3.nombre)
          sankeyLinks.push({ source: cap1Idx, target: cap3Idx, value: appIds.size })
        }
      }
    }
  }

  // Coverage radar: per macroprocess, what % of subprocesses have apps
  const radarData = macroprocesses.map((macro) => {
    const allSubs = macro.cat_proceso.flatMap((p) => p.cat_subproceso)
    const coveredSubs = allSubs.filter((s) => s.rel_componente_log_subproceso.length > 0)
    return {
      macroproceso: macro.nombre,
      total: allSubs.length,
      covered: coveredSubs.length,
      coverage: allSubs.length > 0 ? Math.round((coveredSubs.length / allSubs.length) * 100) : 0,
    }
  })

  // ROI scatter: apps per capability vs subprocess count
  const capabilityROI = capabilities.map((cap1) => {
    const appIds = new Set<number>()
    let subCount = 0
    for (const cap2 of cap1.cat_capacidad_nivel_2) {
      for (const cap3 of cap2.cat_capacidad_nivel_3) {
        subCount += cap3.rel_subproceso_capacidad_nvl_3.length
        for (const rel of cap3.rel_subproceso_capacidad_nvl_3) {
          for (const r of rel.cat_subproceso.rel_componente_log_subproceso) {
            appIds.add(r.tbl_componente_logico.id_aplicacion)
          }
        }
      }
    }
    return { name: cap1.nombre, apps: appIds.size, subprocesses: subCount }
  })

  return NextResponse.json({
    sankey: { nodes: sankeyNodes, links: sankeyLinks },
    radarData,
    capabilityROI,
    totalApps: appCount,
    overallCoverage: radarData.length > 0
      ? Math.round(radarData.reduce((s, r) => s + r.coverage, 0) / radarData.length)
      : 0,
  })
}

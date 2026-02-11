import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseFilters, buildAppWhere } from '@/lib/filters'

export async function GET(request: NextRequest) {
  const filters = parseFilters(request)
  const appWhere = buildAppWhere(filters)

  const [capabilities, filteredApps] = await Promise.all([
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
                              select: {
                                id_aplicacion: true,
                                tbl_aplicacion: {
                                  select: {
                                    nombre: true,
                                    criticidad: true,
                                  },
                                },
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
            },
          },
        },
      },
    }),
    prisma.tbl_aplicacion.findMany({
      where: appWhere,
      select: { id_aplicacion: true },
    }),
  ])

  const filteredIds = new Set(filteredApps.map((a) => a.id_aplicacion))

  // Analyze fragmentation at capability level 2 (more meaningful grouping)
  const fragmentation: {
    capability: string
    parentCapability: string
    apps: { name: string; criticidad: string | null }[]
    technologies: string[]
    subCapabilities: number
  }[] = []

  for (const cap1 of capabilities) {
    for (const cap2 of cap1.cat_capacidad_nivel_2) {
      const appMap = new Map<number, { name: string; criticidad: string | null }>()
      const techSet = new Set<string>()

      for (const cap3 of cap2.cat_capacidad_nivel_3) {
        for (const rel of cap3.rel_subproceso_capacidad_nvl_3) {
          for (const compRel of rel.cat_subproceso.rel_componente_log_subproceso) {
            const comp = compRel.tbl_componente_logico
            if (!filteredIds.has(comp.id_aplicacion)) continue
            appMap.set(comp.id_aplicacion, {
              name: comp.tbl_aplicacion.nombre,
              criticidad: comp.tbl_aplicacion.criticidad,
            })
            if (comp.cat_tecnologia?.nombre) techSet.add(comp.cat_tecnologia.nombre)
          }
        }
      }

      if (appMap.size > 0) {
        fragmentation.push({
          capability: cap2.nombre,
          parentCapability: cap1.nombre,
          apps: [...appMap.values()],
          technologies: [...techSet],
          subCapabilities: cap2.cat_capacidad_nivel_3.length,
        })
      }
    }
  }

  // Sort by number of apps descending (most fragmented first)
  fragmentation.sort((a, b) => b.apps.length - a.apps.length)

  const fragmented = fragmentation.filter((f) => f.apps.length > 1)
  const totalCapabilities = fragmentation.length
  const fragmentedCount = fragmented.length
  const avgAppsPerCapability = totalCapabilities > 0
    ? +(fragmentation.reduce((s, f) => s + f.apps.length, 0) / totalCapabilities).toFixed(1)
    : 0
  const maxFragmented = fragmented[0]?.apps.length ?? 0

  // Top fragmented for bar chart
  const barChart = fragmented.slice(0, 15).map((f) => ({
    name: f.capability.length > 30 ? f.capability.slice(0, 30) + '...' : f.capability,
    fullName: f.capability,
    apps: f.apps.length,
    parent: f.parentCapability,
  }))

  return NextResponse.json({
    kpis: {
      totalCapabilities,
      fragmentedCount,
      avgAppsPerCapability,
      maxFragmented,
    },
    barChart,
    fragmentation: fragmented.slice(0, 30),
  })
}

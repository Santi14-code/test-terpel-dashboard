import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseFilters, buildAppWhere } from '@/lib/filters'
import { CRITICALITY_COLORS } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const filters = parseFilters(request)
    const appWhere = buildAppWhere(filters)

    // Get query parameters for additional filters
    const { searchParams } = new URL(request.url)
    const tecnologiaFilter = searchParams.get('tecnologia')
    const proveedorFilter = searchParams.get('proveedor')

    // Build component where clause for technology filter
    const componentWhere: any = {}
    if (tecnologiaFilter) {
      componentWhere.id_tecnologia = parseInt(tecnologiaFilter)
    }

    // Get all applications with their components and technologies
    const aplicaciones = await prisma.tbl_aplicacion.findMany({
      where: {
        ...appWhere,
        ...(proveedorFilter ? { proveedor: { contains: proveedorFilter } } : {}),
      },
      include: {
        tbl_componente_logico: {
          where: componentWhere,
          include: {
            cat_tecnologia: {
              select: {
                id_tecnologia: true,
                tecnologia: true,
                categoria: true,
              },
            },
            rel_com_interfaz_consumo: {
              include: {
                tbl_interfaz: {
                  include: {
                    tbl_componente_logico: {
                      select: {
                        id_aplicacion: true,
                        tbl_aplicacion: {
                          select: {
                            id_aplicacion: true,
                            nombre: true,
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
        cat_estado: {
          select: {
            nombre: true,
          },
        },
      },
    })

    // KPIs
    const totalApps = aplicaciones.length
    const totalTechs = new Set(
      aplicaciones.flatMap((app) =>
        app.tbl_componente_logico.map((comp) => comp.id_tecnologia)
      )
    ).size
    const totalProviders = new Set(
      aplicaciones.map((app) => app.proveedor).filter(Boolean)
    ).size
    const criticalApps = aplicaciones.filter(
      (app) => app.criticidad === 'Crítica'
    ).length

    // Heat map data: matrix of apps × technologies with dependency count
    const heatMapData: any[] = []
    const techMap = new Map<number, string>()

    aplicaciones.forEach((app) => {
      const appTechs = new Map<number, number>() // techId -> dependency count

      app.tbl_componente_logico.forEach((comp) => {
        if (comp.cat_tecnologia) {
          const techId = comp.cat_tecnologia.id_tecnologia
          const techName = comp.cat_tecnologia.tecnologia
          techMap.set(techId, techName)

          // Count dependencies (interfaces consumed)
          const depCount = comp.rel_com_interfaz_consumo.length
          appTechs.set(techId, (appTechs.get(techId) || 0) + depCount)
        }
      })

      appTechs.forEach((depCount, techId) => {
        heatMapData.push({
          appId: app.id_aplicacion,
          appName: app.nombre,
          criticidad: app.criticidad,
          techId,
          techName: techMap.get(techId),
          dependencyCount: depCount,
          componentCount: app.tbl_componente_logico.filter(
            (c) => c.id_tecnologia === techId
          ).length,
        })
      })
    })

    // Detailed list with drill-down data
    const detailedList = aplicaciones.map((app) => {
      const techCount = new Set(
        app.tbl_componente_logico.map((c) => c.id_tecnologia)
      ).size
      const componentCount = app.tbl_componente_logico.length
      const totalDependencies = app.tbl_componente_logico.reduce(
        (sum, comp) => sum + comp.rel_com_interfaz_consumo.length,
        0
      )

      // Get unique technologies used
      const technologies = Array.from(
        new Map(
          app.tbl_componente_logico
            .filter((c) => c.cat_tecnologia)
            .map((c) => [
              c.cat_tecnologia!.id_tecnologia,
              {
                id: c.cat_tecnologia!.id_tecnologia,
                name: c.cat_tecnologia!.tecnologia,
                category: c.cat_tecnologia!.categoria,
                componentCount: app.tbl_componente_logico.filter(
                  (comp) => comp.id_tecnologia === c.cat_tecnologia!.id_tecnologia
                ).length,
              },
            ])
        ).values()
      )

      return {
        id: app.id_aplicacion,
        nombre: app.nombre,
        descripcion: app.descripcion,
        criticidad: app.criticidad,
        proveedor: app.proveedor,
        fabricante: app.fabricante,
        estado: app.cat_estado?.nombre,
        techCount,
        componentCount,
        totalDependencies,
        technologies,
      }
    })

    // Technology distribution
    const techDistribution = new Map<string, any>()
    aplicaciones.forEach((app) => {
      app.tbl_componente_logico.forEach((comp) => {
        if (comp.cat_tecnologia) {
          const key = comp.cat_tecnologia.tecnologia
          if (!techDistribution.has(key)) {
            techDistribution.set(key, {
              name: comp.cat_tecnologia.tecnologia,
              category: comp.cat_tecnologia.categoria,
              appCount: new Set<number>(),
              componentCount: 0,
              criticalApps: 0,
            })
          }
          const tech = techDistribution.get(key)!
          tech.appCount.add(app.id_aplicacion)
          tech.componentCount++
          if (app.criticidad === 'Crítica') {
            tech.criticalApps++
          }
        }
      })
    })

    const techDistributionArray = Array.from(techDistribution.values())
      .map((tech) => ({
        name: tech.name,
        category: tech.category,
        appCount: tech.appCount.size,
        componentCount: tech.componentCount,
        criticalApps: tech.criticalApps,
      }))
      .sort((a, b) => b.appCount - a.appCount)

    // Criticality distribution
    const criticalityDist = [
      { name: 'Crítica', value: 0, color: CRITICALITY_COLORS['Crítica'] },
      { name: 'Alta', value: 0, color: CRITICALITY_COLORS['Alta'] },
      { name: 'Media', value: 0, color: CRITICALITY_COLORS['Media'] },
      { name: 'Baja', value: 0, color: CRITICALITY_COLORS['Baja'] },
    ]

    aplicaciones.forEach((app) => {
      const crit = criticalityDist.find((c) => c.name === app.criticidad)
      if (crit) crit.value++
    })

    // Get unique technologies for filter options
    const allTechnologies = await prisma.cat_tecnologia.findMany({
      select: {
        id_tecnologia: true,
        tecnologia: true,
        categoria: true,
      },
      orderBy: {
        tecnologia: 'asc',
      },
    })

    // Get unique providers for filter options
    const providers = Array.from(
      new Set(aplicaciones.map((app) => app.proveedor).filter(Boolean))
    ).sort()

    return NextResponse.json({
      kpis: {
        totalApps,
        totalTechs,
        totalProviders,
        criticalApps,
      },
      heatMapData,
      detailedList,
      techDistribution: techDistributionArray,
      criticalityDistribution: criticalityDist,
      filterOptions: {
        technologies: allTechnologies,
        providers,
      },
    })
  } catch (error) {
    console.error('Error fetching matrix data:', error)
    return NextResponse.json(
      { error: 'Error al obtener datos de matriz' },
      { status: 500 }
    )
  }
}

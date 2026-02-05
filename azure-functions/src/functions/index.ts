import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { prisma } from '../lib/db'
import { parseFilters, buildAppWhere } from '../lib/filters'

// Utility function for CORS headers
function corsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

// Error handler
function errorResponse(error: any, context: InvocationContext): HttpResponseInit {
  context.error('Error:', error)
  return {
    status: 500,
    headers: corsHeaders(),
    jsonBody: { error: error.message || 'Internal server error' },
  }
}

// ============================================================================
// FILTERS ENDPOINT
// ============================================================================
async function filtersHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    if (request.method === 'OPTIONS') {
      return { status: 200, headers: corsHeaders() }
    }

    const [lineasPrincipal, lineasNegocio, estados, criticidades] = await Promise.all([
      prisma.cat_linea_negocio_principal.findMany({
        select: { id_linea_negocio_principal: true, descripcion: true },
        orderBy: { descripcion: 'asc' },
      }),
      prisma.cat_linea_negocio.findMany({
        select: { id_linea_negocio: true, tipo_linea_negocio: true, id_linea_negocio_principal: true },
        orderBy: { tipo_linea_negocio: 'asc' },
      }),
      prisma.cat_estado.findMany({
        select: { id_estado: true, nombre: true },
        orderBy: { nombre: 'asc' },
      }),
      prisma.tbl_aplicacion.findMany({
        select: { criticidad: true },
        distinct: ['criticidad'],
        where: { criticidad: { not: null } },
      }),
    ])

    return {
      status: 200,
      headers: corsHeaders(),
      jsonBody: {
        lineasPrincipal: lineasPrincipal.map((l) => ({
          id: l.id_linea_negocio_principal,
          descripcion: l.descripcion,
        })),
        lineasNegocio: lineasNegocio.map((l) => ({
          id: l.id_linea_negocio,
          tipo: l.tipo_linea_negocio,
          id_principal: l.id_linea_negocio_principal,
        })),
        estados: estados.map((e) => ({ id: e.id_estado, nombre: e.nombre })),
        criticidades: criticidades.map((c) => c.criticidad).filter(Boolean),
      },
    }
  } catch (error: any) {
    return errorResponse(error, context)
  }
}

app.http('filters', {
  methods: ['GET', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'filters',
  handler: filtersHandler,
})

// ============================================================================
// HOME DASHBOARD ENDPOINT
// ============================================================================
async function homeHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    if (request.method === 'OPTIONS') {
      return { status: 200, headers: corsHeaders() }
    }

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

      prisma.tbl_aplicacion.groupBy({
        by: ['criticidad'],
        where: appWhere,
        _count: { id_aplicacion: true },
      }),

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

      prisma.cat_tecnologia.findMany({
        select: {
          nombre: true,
          categoria: true,
          _count: { select: { tbl_componente_logico: true } },
        },
        orderBy: { tbl_componente_logico: { _count: 'desc' } },
        take: 20,
      }),

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

    const criticalityData = appsByCriticidad.map((c) => ({
      name: c.criticidad || 'Sin definir',
      value: c._count.id_aplicacion,
    }))

    const topAppsByComponents = appsByComponentCount.map((a) => ({
      name: a.nombre,
      components: a._count.tbl_componente_logico,
      criticidad: a.criticidad,
    }))

    const techData = techUsage.map((t) => ({
      name: t.nombre,
      categoria: t.categoria,
      count: t._count.tbl_componente_logico,
    }))

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

    return {
      status: 200,
      headers: corsHeaders(),
      jsonBody: {
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
      },
    }
  } catch (error: any) {
    return errorResponse(error, context)
  }
}

app.http('dashboard-home', {
  methods: ['GET', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'dashboard/home',
  handler: homeHandler,
})

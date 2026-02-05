import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseFilters, buildAppWhere } from '@/lib/filters'

export async function GET(request: NextRequest) {
  const filters = parseFilters(request)
  const appWhere = buildAppWhere(filters)
  const [apps, deployments, platforms, environments] = await Promise.all([
    prisma.tbl_aplicacion.findMany({
      where: appWhere,
      select: {
        id_aplicacion: true,
        nombre: true,
        criticidad: true,
        cat_estado: { select: { nombre: true } },
        cat_modelo_servicio: { select: { nombre: true } },
        tbl_componente_logico: {
          select: {
            nombre: true,
            rel_componente_log_despliegue: {
              select: {
                tbl_componente_despliegue: {
                  select: {
                    replicas: true,
                    cat_entorno: { select: { nombre: true } },
                    cat_plataforma: { select: { nombre: true } },
                  },
                },
              },
            },
          },
        },
        _count: { select: { tbl_componente_logico: true, tbl_interfaz: true } },
      },
    }),

    prisma.tbl_componente_despliegue.count(),
    prisma.cat_plataforma.findMany({
      select: { nombre: true, _count: { select: { tbl_componente_despliegue: true } } },
      orderBy: { tbl_componente_despliegue: { _count: 'desc' } },
    }),
    prisma.cat_entorno.findMany({
      select: { nombre: true, _count: { select: { tbl_componente_despliegue: true } } },
    }),
  ])

  // Synthetic SLA based on criticidad and deployment redundancy
  const appPerformance = apps.map((app) => {
    const totalReplicas = app.tbl_componente_logico.reduce((sum, c) =>
      sum + c.rel_componente_log_despliegue.reduce((s, d) =>
        s + (d.tbl_componente_despliegue.replicas || 1), 0), 0)
    const envCount = new Set(
      app.tbl_componente_logico.flatMap((c) =>
        c.rel_componente_log_despliegue.map((d) => d.tbl_componente_despliegue.cat_entorno.nombre))
    ).size

    const baseSLA = app.criticidad === 'Crítica' ? 99.9 : app.criticidad === 'Alta' ? 99.5 : 99.0
    const sla = Math.min(99.99, baseSLA + (totalReplicas > 2 ? 0.05 : 0))

    return {
      name: app.nombre,
      criticidad: app.criticidad || 'Sin definir',
      estado: app.cat_estado.nombre,
      modelo: app.cat_modelo_servicio.nombre,
      components: app._count.tbl_componente_logico,
      interfaces: app._count.tbl_interfaz,
      replicas: totalReplicas,
      environments: envCount,
      syntheticSLA: sla,
    }
  })

  // Environment distribution per app type
  const envDistribution = environments.map((e) => ({
    name: e.nombre,
    count: e._count.tbl_componente_despliegue,
  }))

  // Bottlenecks: apps with high interfaces but low replicas
  const bottlenecks = appPerformance
    .filter((a) => a.interfaces > 3 && a.replicas <= 1)
    .sort((a, b) => b.interfaces - a.interfaces)
    .slice(0, 15)

  return NextResponse.json({
    totalDeployments: deployments,
    appPerformance: appPerformance.slice(0, 30),
    platforms: platforms.map((p) => ({ name: p.nombre, count: p._count.tbl_componente_despliegue })),
    envDistribution,
    bottlenecks,
    avgSLA: appPerformance.length > 0
      ? +(appPerformance.reduce((s, a) => s + a.syntheticSLA, 0) / appPerformance.length).toFixed(2)
      : 0,
  })
}

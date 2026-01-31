import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseFilters, buildAppWhere } from '@/lib/filters'

export async function GET(request: NextRequest) {
  const filters = parseFilters(request)
  const appWhere = buildAppWhere(filters)
  const [apps, recentComponents, recentApps] = await Promise.all([
    prisma.tbl_aplicacion.findMany({
      where: appWhere,
      select: {
        id_aplicacion: true,
        nombre: true,
        criticidad: true,
        fecha_creacion: true,
        fecha_modificacion: true,
        cat_estado: { select: { nombre: true } },
        _count: { select: { tbl_componente_logico: true, tbl_interfaz: true } },
      },
    }),

    // Most recently modified components
    prisma.tbl_componente_logico.findMany({
      select: {
        nombre: true,
        fecha_modificacion: true,
        tbl_aplicacion: { select: { nombre: true } },
      },
      orderBy: { fecha_modificacion: 'desc' },
      take: 50,
    }),

    // Most recently modified apps
    prisma.tbl_aplicacion.findMany({
      where: appWhere,
      select: {
        nombre: true,
        fecha_modificacion: true,
        criticidad: true,
        _count: { select: { tbl_componente_logico: true } },
      },
      orderBy: { fecha_modificacion: 'desc' },
      take: 20,
    }),
  ])

  // Volatility: apps sorted by modification recency and component count
  const volatileApps = apps
    .map((a) => ({
      name: a.nombre,
      criticidad: a.criticidad || 'Sin definir',
      components: a._count.tbl_componente_logico,
      interfaces: a._count.tbl_interfaz,
      lastModified: a.fecha_modificacion.toISOString(),
      daysSinceModification: Math.floor((Date.now() - a.fecha_modificacion.getTime()) / 86400000),
    }))
    .sort((a, b) => a.daysSinceModification - b.daysSinceModification)

  // Changes by month (synthetic timeline based on modification dates)
  const monthCounts = new Map<string, number>()
  for (const comp of recentComponents) {
    const month = comp.fecha_modificacion.toISOString().slice(0, 7)
    monthCounts.set(month, (monthCounts.get(month) || 0) + 1)
  }

  const changeTimeline = Array.from(monthCounts.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, count]) => ({ month, changes: count }))

  // Changes vs complexity scatter
  const changesVsComplexity = apps.map((a) => ({
    name: a.nombre,
    components: a._count.tbl_componente_logico,
    interfaces: a._count.tbl_interfaz,
    daysSinceChange: Math.floor((Date.now() - a.fecha_modificacion.getTime()) / 86400000),
    criticidad: a.criticidad || 'Sin definir',
  }))

  return NextResponse.json({
    volatileApps: volatileApps.slice(0, 20),
    recentChanges: recentApps.map((a) => ({
      name: a.nombre,
      criticidad: a.criticidad,
      components: a._count.tbl_componente_logico,
      lastModified: a.fecha_modificacion.toISOString(),
    })),
    changeTimeline,
    changesVsComplexity: changesVsComplexity.slice(0, 30),
  })
}

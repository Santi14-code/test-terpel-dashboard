import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseFilters, buildAppWhere } from '@/lib/filters'

export async function GET(request: NextRequest) {
  const filters = parseFilters(request)
  const appWhere = buildAppWhere(filters)

  const [
    apps,
    totalComponents,
    totalInterfaces,
    appsByEstado,
    appsByCriticidad,
    appsByModeloServicio,
  ] = await Promise.all([
    prisma.tbl_aplicacion.findMany({
      where: appWhere,
      select: {
        id_aplicacion: true,
        nombre: true,
        descripcion: true,
        criticidad: true,
        proveedor: true,
        fabricante: true,
        responsable: true,
        cat_estado: { select: { nombre: true } },
        cat_modelo_servicio: { select: { nombre: true } },
        _count: { select: { tbl_componente_logico: true, tbl_interfaz: true } },
      },
      orderBy: { nombre: 'asc' },
    }),

    prisma.tbl_componente_logico.count(),
    prisma.tbl_interfaz.count(),

    prisma.tbl_aplicacion.groupBy({
      by: ['id_estado'],
      where: appWhere,
      _count: { id_aplicacion: true },
    }),

    prisma.tbl_aplicacion.groupBy({
      by: ['criticidad'],
      where: appWhere,
      _count: { id_aplicacion: true },
    }),

    prisma.tbl_aplicacion.groupBy({
      by: ['id_modelo_servicio'],
      where: appWhere,
      _count: { id_aplicacion: true },
    }),
  ])

  const [estados, modelos] = await Promise.all([
    prisma.cat_estado.findMany({ select: { id_estado: true, nombre: true } }),
    prisma.cat_modelo_servicio.findMany({ select: { id_modelo_servicio: true, nombre: true } }),
  ])

  const estadoMap = Object.fromEntries(estados.map((e) => [e.id_estado, e.nombre]))
  const modeloMap = Object.fromEntries(modelos.map((m) => [m.id_modelo_servicio, m.nombre]))

  // Build inventory with score
  const inventory = apps.map((a) => ({
    id: a.id_aplicacion,
    nombre: a.nombre,
    descripcion: a.descripcion,
    criticidad: a.criticidad || 'Sin definir',
    estado: a.cat_estado.nombre,
    modelo: a.cat_modelo_servicio.nombre,
    proveedor: a.proveedor || 'Sin definir',
    fabricante: a.fabricante || 'Sin definir',
    responsable: a.responsable,
    components: a._count.tbl_componente_logico,
    interfaces: a._count.tbl_interfaz,
    score: a._count.tbl_componente_logico + a._count.tbl_interfaz,
  }))

  // KPIs
  const totalApps = apps.length
  const saasCount = apps.filter((a) => a.cat_modelo_servicio.nombre === 'SaaS').length
  const onPremCount = apps.filter((a) => a.cat_modelo_servicio.nombre === 'On-Premise').length
  const criticalCount = apps.filter((a) => a.criticidad === 'Crítica').length

  const kpis = {
    totalApps,
    totalComponents,
    totalInterfaces,
    saasCount,
    saasPercent: totalApps > 0 ? Math.round((saasCount / totalApps) * 100) : 0,
    onPremCount,
    onPremPercent: totalApps > 0 ? Math.round((onPremCount / totalApps) * 100) : 0,
    criticalCount,
    criticalPercent: totalApps > 0 ? Math.round((criticalCount / totalApps) * 100) : 0,
  }

  // Top 10 by complexity (components + interfaces)
  const topByComplexity = [...inventory]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)

  // Top 10 by integration (interfaces)
  const topByIntegration = [...inventory]
    .sort((a, b) => b.interfaces - a.interfaces)
    .slice(0, 10)

  // Apps by fabricante
  const providerMap = new Map<string, number>()
  for (const app of apps) {
    const fab = app.fabricante || 'Sin definir'
    providerMap.set(fab, (providerMap.get(fab) || 0) + 1)
  }
  const byProvider = Array.from(providerMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  // Health metrics
  const CLOUD_MODELS = ['SaaS', 'PaaS', 'IaaS']
  const withCriticality = apps.filter((a) => a.criticidad && a.criticidad !== 'Sin definir').length
  const cloudApps = apps.filter((a) => CLOUD_MODELS.includes(a.cat_modelo_servicio.nombre)).length
  const avgComponents = totalApps > 0
    ? +(inventory.reduce((sum, a) => sum + a.components, 0) / totalApps).toFixed(1)
    : 0
  const avgInterfaces = totalApps > 0
    ? +(inventory.reduce((sum, a) => sum + a.interfaces, 0) / totalApps).toFixed(1)
    : 0
  const topProviderConcentration = byProvider.length > 0
    ? Math.round((byProvider[0].value / totalApps) * 100)
    : 0

  const healthMetrics = [
    { value: totalApps > 0 ? Math.round((withCriticality / totalApps) * 100) : 0, label: '% Criticidad Definida', suffix: '%' },
    { value: totalApps > 0 ? Math.round((cloudApps / totalApps) * 100) : 0, label: '% En la Nube', suffix: '%' },
    { value: avgComponents, label: 'Prom. Componentes/App', suffix: '' },
    { value: avgInterfaces, label: 'Prom. Interfaces/App', suffix: '' },
    { value: topProviderConcentration, label: `Concentracion en ${byProvider[0]?.name || 'N/A'}`, suffix: '%' },
  ]

  return NextResponse.json({
    kpis,
    byCriticidad: appsByCriticidad.map((c) => ({
      name: c.criticidad || 'Sin definir',
      value: c._count.id_aplicacion,
    })),
    byModelo: appsByModeloServicio.map((m) => ({
      name: modeloMap[m.id_modelo_servicio] || 'Unknown',
      value: m._count.id_aplicacion,
    })),
    byEstado: appsByEstado.map((e) => ({
      name: estadoMap[e.id_estado] || 'Unknown',
      value: e._count.id_aplicacion,
    })),
    topByComplexity,
    topByIntegration,
    byProvider,
    inventory,
    healthMetrics,
  })
}

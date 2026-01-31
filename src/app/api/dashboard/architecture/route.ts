import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseFilters, buildAppWhere } from '@/lib/filters'

export async function GET(request: NextRequest) {
  const filters = parseFilters(request)
  const appWhere = buildAppWhere(filters)
  const [interfaces, consumptions, apps, componentTypes, interfaceTypes, deployments] = await Promise.all([
    prisma.tbl_interfaz.findMany({
      select: {
        id_interfaz: true,
        nombre_interfaz: true,
        estado: true,
        id_aplicacion: true,
        id_componente_logico: true,
        cat_tipo_interfaz: { select: { nombre_tipo: true } },
        _count: { select: { rel_com_interfaz_consumo: true } },
      },
    }),
    prisma.rel_com_interfaz_consumo.findMany({
      select: {
        id_interfaz: true,
        id_componente_logico: true,
        tbl_componente_logico: { select: { id_aplicacion: true, nombre: true } },
        tbl_interfaz: { select: { id_aplicacion: true, nombre_interfaz: true } },
      },
    }),
    prisma.tbl_aplicacion.findMany({
      where: appWhere,
      select: {
        id_aplicacion: true,
        nombre: true,
        criticidad: true,
        cat_modelo_servicio: { select: { nombre: true } },
        _count: { select: { tbl_componente_logico: true, tbl_interfaz: true } },
      },
    }),
    prisma.cat_componente_logico_tipo.findMany({
      select: { nombre_tipo: true, _count: { select: { tbl_componente_logico: true } } },
      orderBy: { tbl_componente_logico: { _count: 'desc' } },
    }),
    prisma.cat_tipo_interfaz.findMany({
      select: { nombre_tipo: true, _count: { select: { tbl_interfaz: true } } },
      orderBy: { tbl_interfaz: { _count: 'desc' } },
    }),
    prisma.cat_entorno.findMany({
      select: { nombre: true, _count: { select: { tbl_componente_despliegue: true } } },
    }),
  ])

  const appMap = new Map(apps.map((a) => [a.id_aplicacion, a]))
  const linkMap = new Map<string, number>()

  for (const c of consumptions) {
    const consumerAppId = c.tbl_componente_logico.id_aplicacion
    const providerAppId = c.tbl_interfaz.id_aplicacion
    if (providerAppId && consumerAppId !== providerAppId) {
      const key = `${Math.min(consumerAppId, providerAppId)}-${Math.max(consumerAppId, providerAppId)}`
      linkMap.set(key, (linkMap.get(key) || 0) + 1)
    }
  }

  const connectedApps = new Set<number>()
  const links = Array.from(linkMap.entries()).map(([key, value]) => {
    const [source, target] = key.split('-').map(Number)
    connectedApps.add(source)
    connectedApps.add(target)
    return { source, target, value }
  })

  const nodes = Array.from(connectedApps).map((id) => {
    const app = appMap.get(id)
    return {
      id,
      name: app?.nombre || 'Unknown',
      criticidad: app?.criticidad || 'Sin definir',
      components: app?._count.tbl_componente_logico || 0,
      interfaces: app?._count.tbl_interfaz || 0,
    }
  })

  const couplingCount = new Map<number, number>()
  for (const c of consumptions) {
    const appId = c.tbl_componente_logico.id_aplicacion
    couplingCount.set(appId, (couplingCount.get(appId) || 0) + 1)
    if (c.tbl_interfaz.id_aplicacion) {
      couplingCount.set(c.tbl_interfaz.id_aplicacion, (couplingCount.get(c.tbl_interfaz.id_aplicacion) || 0) + 1)
    }
  }

  const topCoupled = Array.from(couplingCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id, connections]) => ({
      name: appMap.get(id)?.nombre || 'Unknown',
      connections,
      criticidad: appMap.get(id)?.criticidad || 'Sin definir',
    }))

  const modelDistribution = new Map<string, number>()
  for (const app of apps) {
    const model = app.cat_modelo_servicio.nombre
    modelDistribution.set(model, (modelDistribution.get(model) || 0) + 1)
  }

  return NextResponse.json({
    network: { nodes, links },
    topCoupled,
    componentTypes: componentTypes.map((t) => ({ name: t.nombre_tipo, count: t._count.tbl_componente_logico })),
    interfaceTypes: interfaceTypes.map((t) => ({ name: t.nombre_tipo, count: t._count.tbl_interfaz })),
    serviceModelDistribution: Array.from(modelDistribution.entries()).map(([name, value]) => ({ name, value })),
    environments: deployments.map((e) => ({ name: e.nombre, count: e._count.tbl_componente_despliegue })),
  })
}

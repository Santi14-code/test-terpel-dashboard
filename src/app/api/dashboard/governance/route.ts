import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseFilters, buildAppWhere } from '@/lib/filters'

export async function GET(request: NextRequest) {
  const filters = parseFilters(request)
  const appWhere = buildAppWhere(filters)

  const [
    apps,
    appsByEstado,
    appsByCriticidad,
    appsByModeloServicio,
    appsByLine,
    techUsage,
  ] = await Promise.all([
    prisma.tbl_aplicacion.findMany({
      where: appWhere,
      select: {
        id_aplicacion: true,
        nombre: true,
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

    prisma.$queryRaw`
      SELECT lnp.descripcion as linea_principal, COUNT(DISTINCT a.id_aplicacion) as app_count
      FROM reestructuracion.tbl_aplicacion a
      JOIN reestructuracion.tbl_componente_logico cl ON cl.id_aplicacion = a.id_aplicacion
      JOIN reestructuracion.rel_componente_log_subproceso rcs ON rcs.id_componente_logico = cl.id_componente_logico
      JOIN reestructuracion.cat_subproceso sp ON sp.id_subproceso = rcs.id_subproceso
      JOIN reestructuracion.rel_subproceso_linea_negocio rsln ON rsln.id_subproceso = sp.id_subproceso
      JOIN reestructuracion.cat_linea_negocio ln ON ln.id_linea_negocio = rsln.id_linea_negocio
      JOIN reestructuracion.cat_linea_negocio_principal lnp ON lnp.id_linea_negocio_principal = ln.id_linea_negocio_principal
      GROUP BY lnp.descripcion
      ORDER BY app_count DESC
    ` as Promise<{ linea_principal: string; app_count: bigint }[]>,

    prisma.cat_tecnologia.findMany({
      select: {
        nombre: true,
        categoria: true,
        _count: { select: { tbl_componente_logico: true } },
      },
      orderBy: { tbl_componente_logico: { _count: 'desc' } },
      take: 20,
    }),
  ])

  const [estados, modelos] = await Promise.all([
    prisma.cat_estado.findMany({ select: { id_estado: true, nombre: true } }),
    prisma.cat_modelo_servicio.findMany({ select: { id_modelo_servicio: true, nombre: true } }),
  ])

  const estadoMap = Object.fromEntries(estados.map((e) => [e.id_estado, e.nombre]))
  const modeloMap = Object.fromEntries(modelos.map((m) => [m.id_modelo_servicio, m.nombre]))

  // Heat map: criticidad vs estado
  const heatMap: { criticidad: string; estado: string; count: number }[] = []
  const critEstadoCounts = new Map<string, number>()
  for (const app of apps) {
    const key = `${app.criticidad || 'Sin definir'}|${app.cat_estado.nombre}`
    critEstadoCounts.set(key, (critEstadoCounts.get(key) || 0) + 1)
  }
  critEstadoCounts.forEach((count, key) => {
    const [criticidad, estado] = key.split('|')
    heatMap.push({ criticidad, estado, count })
  })

  const tcoByLine = (appsByLine as { linea_principal: string; app_count: bigint }[]).map((l) => ({
    name: l.linea_principal,
    apps: Number(l.app_count),
    estimatedTCO: Number(l.app_count) * 85000,
  }))

  return NextResponse.json({
    inventory: apps.map((a) => ({
      id: a.id_aplicacion,
      nombre: a.nombre,
      criticidad: a.criticidad || 'Sin definir',
      estado: a.cat_estado.nombre,
      modelo: a.cat_modelo_servicio.nombre,
      proveedor: a.proveedor,
      fabricante: a.fabricante,
      responsable: a.responsable,
      components: a._count.tbl_componente_logico,
      interfaces: a._count.tbl_interfaz,
    })),
    byEstado: appsByEstado.map((e) => ({
      name: estadoMap[e.id_estado] || 'Unknown',
      value: e._count.id_aplicacion,
    })),
    byCriticidad: appsByCriticidad.map((c) => ({
      name: c.criticidad || 'Sin definir',
      value: c._count.id_aplicacion,
    })),
    byModelo: appsByModeloServicio.map((m) => ({
      name: modeloMap[m.id_modelo_servicio] || 'Unknown',
      value: m._count.id_aplicacion,
    })),
    heatMap,
    tcoByLine,
    techRedundancy: techUsage.map((t) => ({
      name: t.nombre,
      categoria: t.categoria,
      count: t._count.tbl_componente_logico,
    })),
  })
}

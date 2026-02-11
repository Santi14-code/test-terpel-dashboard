import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const appId = request.nextUrl.searchParams.get('appId')

  // If no appId, return app list for selector
  if (!appId) {
    const apps = await prisma.tbl_aplicacion.findMany({
      select: { id_aplicacion: true, nombre: true, criticidad: true },
      orderBy: { nombre: 'asc' },
    })
    return NextResponse.json({ apps, detail: null })
  }

  const id = Number(appId)
  if (isNaN(id)) {
    return NextResponse.json({ apps: [], detail: null })
  }

  const [app, processes] = await Promise.all([
    prisma.tbl_aplicacion.findUnique({
      where: { id_aplicacion: id },
      include: {
        cat_modelo_servicio: { select: { nombre: true } },
        cat_estado: { select: { nombre: true } },
        tbl_componente_logico: {
          include: {
            cat_tecnologia: { select: { nombre: true, categoria: true } },
            cat_componente_logico_tipo: { select: { nombre_tipo: true } },
            rel_componente_log_despliegue: {
              include: {
                tbl_componente_despliegue: {
                  include: {
                    cat_plataforma: { select: { nombre: true } },
                    cat_entorno: { select: { nombre: true } },
                    cat_componente_despliegue_tipo: { select: { nombre_tipo: true } },
                  },
                },
              },
            },
            rel_componente_log_subproceso: {
              include: {
                cat_subproceso: {
                  include: {
                    cat_proceso: {
                      include: { cat_macroproceso: { select: { nombre: true } } },
                    },
                  },
                },
              },
            },
          },
        },
        tbl_interfaz: {
          include: {
            cat_tipo_interfaz: { select: { nombre_tipo: true } },
          },
        },
      },
    }),
    // Get process mapping for this app
    prisma.rel_componente_log_subproceso.findMany({
      where: { tbl_componente_logico: { id_aplicacion: id } },
      include: {
        cat_subproceso: {
          include: {
            cat_proceso: {
              include: { cat_macroproceso: true },
            },
          },
        },
      },
    }),
  ])

  if (!app) {
    return NextResponse.json({ apps: [], detail: null })
  }

  // Components
  const components = app.tbl_componente_logico.map((c) => ({
    name: c.nombre,
    type: c.cat_componente_logico_tipo.nombre_tipo,
    technology: c.cat_tecnologia?.nombre || 'Sin tecnologia',
    techCategory: c.cat_tecnologia?.categoria || '-',
    version: c.version || '-',
    hasPersonalData: c.is_contiene_datos_personales === 'Si',
    documentation: !!c.url_documentacion,
  }))

  // Interfaces
  const interfaces = app.tbl_interfaz.map((iface) => ({
    name: iface.nombre_interfaz,
    type: iface.cat_tipo_interfaz.nombre_tipo,
    status: iface.estado || 'Sin estado',
    description: iface.descripcion || '-',
  }))

  // Deployments
  const deployments = app.tbl_componente_logico.flatMap((c) =>
    c.rel_componente_log_despliegue.map((d) => ({
      component: c.nombre,
      platform: d.tbl_componente_despliegue.cat_plataforma.nombre,
      environment: d.tbl_componente_despliegue.cat_entorno.nombre,
      type: d.tbl_componente_despliegue.cat_componente_despliegue_tipo.nombre_tipo,
      replicas: d.tbl_componente_despliegue.replicas ?? 1,
      deploymentName: d.tbl_componente_despliegue.componente || '-',
    }))
  )

  // Processes
  const processMap = new Map<string, { macro: string; proceso: string; subprocesos: string[] }>()
  for (const rel of processes) {
    const sub = rel.cat_subproceso
    const proc = sub.cat_proceso
    const macro = proc.cat_macroproceso
    const key = `${macro.nombre}|${proc.nombre}`
    if (!processMap.has(key)) {
      processMap.set(key, { macro: macro.nombre, proceso: proc.nombre, subprocesos: [] })
    }
    if (sub.nombre) processMap.get(key)!.subprocesos.push(sub.nombre)
  }
  const processList = [...processMap.values()]

  // Unique technologies
  const techs = [...new Set(components.map((c) => c.technology).filter((t) => t !== 'Sin tecnologia'))]
  // Unique platforms
  const platforms = [...new Set(deployments.map((d) => d.platform))]

  const detail = {
    name: app.nombre,
    description: app.descripcion,
    criticidad: app.criticidad || 'Sin definir',
    estado: app.cat_estado.nombre,
    modelo: app.cat_modelo_servicio.nombre,
    proveedor: app.proveedor || 'Sin proveedor',
    fabricante: app.fabricante || 'Sin fabricante',
    responsable: app.responsable || 'Sin asignar',
    summary: {
      components: components.length,
      interfaces: interfaces.length,
      deployments: deployments.length,
      processes: processList.length,
      technologies: techs.length,
      platforms: platforms.length,
      hasPersonalData: components.some((c) => c.hasPersonalData),
    },
    components,
    interfaces,
    deployments,
    processes: processList,
  }

  return NextResponse.json({ apps: [], detail })
}

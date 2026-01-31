import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseFilters, buildAppWhere } from '@/lib/filters'

// Synthetic TCO estimation
const TCO_BY_MODEL: Record<string, number> = {
  SaaS: 45000,
  PaaS: 65000,
  IaaS: 95000,
  'On-Premise': 120000,
}

const CRITICALITY_MULTIPLIER: Record<string, number> = {
  Crítica: 1.5,
  Alta: 1.2,
  Media: 1.0,
  Baja: 0.8,
}

export async function GET(request: NextRequest) {
  const filters = parseFilters(request)
  const appWhere = buildAppWhere(filters)

  const [apps, platforms, environments] = await Promise.all([
    prisma.tbl_aplicacion.findMany({
      where: appWhere,
      select: {
        id_aplicacion: true,
        nombre: true,
        criticidad: true,
        cat_modelo_servicio: { select: { nombre: true } },
        cat_estado: { select: { nombre: true } },
        _count: { select: { tbl_componente_logico: true } },
      },
    }),

    prisma.cat_plataforma.findMany({
      select: {
        nombre: true,
        _count: { select: { tbl_componente_despliegue: true } },
      },
      orderBy: { tbl_componente_despliegue: { _count: 'desc' } },
    }),

    prisma.cat_entorno.findMany({
      select: {
        nombre: true,
        _count: { select: { tbl_componente_despliegue: true } },
      },
    }),
  ])

  // Calculate TCO per app
  const appTCO = apps.map((app) => {
    const baseCost = TCO_BY_MODEL[app.cat_modelo_servicio.nombre] || 75000
    const critMult = CRITICALITY_MULTIPLIER[app.criticidad || 'Media'] || 1.0
    const componentMult = 1 + (app._count.tbl_componente_logico * 0.05)
    const tco = Math.round(baseCost * critMult * componentMult)
    return {
      name: app.nombre,
      modelo: app.cat_modelo_servicio.nombre,
      criticidad: app.criticidad || 'Sin definir',
      estado: app.cat_estado.nombre,
      components: app._count.tbl_componente_logico,
      tco,
    }
  }).sort((a, b) => b.tco - a.tco)

  const totalTCO = appTCO.reduce((sum, a) => sum + a.tco, 0)

  // TCO by service model
  const tcoByModel = new Map<string, { count: number; tco: number }>()
  for (const app of appTCO) {
    const existing = tcoByModel.get(app.modelo) || { count: 0, tco: 0 }
    existing.count++
    existing.tco += app.tco
    tcoByModel.set(app.modelo, existing)
  }

  // TCO by criticidad
  const tcoByCriticidad = new Map<string, { count: number; tco: number }>()
  for (const app of appTCO) {
    const existing = tcoByCriticidad.get(app.criticidad) || { count: 0, tco: 0 }
    existing.count++
    existing.tco += app.tco
    tcoByCriticidad.set(app.criticidad, existing)
  }

  return NextResponse.json({
    totalTCO,
    appTCO: appTCO.slice(0, 30),
    tcoByModel: Array.from(tcoByModel.entries()).map(([name, data]) => ({
      name, apps: data.count, tco: data.tco,
    })),
    tcoByCriticidad: Array.from(tcoByCriticidad.entries()).map(([name, data]) => ({
      name, apps: data.count, tco: data.tco,
    })),
    platforms: platforms.map((p) => ({ name: p.nombre, count: p._count.tbl_componente_despliegue })),
    environments: environments.map((e) => ({ name: e.nombre, count: e._count.tbl_componente_despliegue })),
  })
}

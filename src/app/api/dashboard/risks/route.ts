import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseFilters, buildAppWhere } from '@/lib/filters'

export async function GET(request: NextRequest) {
  const filters = parseFilters(request)
  const appWhere = buildAppWhere(filters)
  const [apps, personalDataComponents] = await Promise.all([
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
            is_contiene_datos_personales: true,
            _count: {
              select: {
                rel_com_interfaz_consumo: true,
                rel_componente_log_despliegue: true,
              },
            },
          },
        },
        _count: { select: { tbl_componente_logico: true, tbl_interfaz: true } },
      },
    }),

    prisma.tbl_componente_logico.findMany({
      where: { is_contiene_datos_personales: 'Si' },
      select: {
        nombre: true,
        tbl_aplicacion: { select: { nombre: true, criticidad: true } },
        rel_com_interfaz_consumo: {
          select: { tbl_interfaz: { select: { nombre_interfaz: true, id_aplicacion: true } } },
        },
      },
    }),
  ])

  // Risk matrix: criticidad x number of interfaces (coupling = exposure)
  const riskMatrix = apps.map((app) => {
    const critScore = app.criticidad === 'Crítica' ? 4 : app.criticidad === 'Alta' ? 3 : app.criticidad === 'Media' ? 2 : 1
    const couplingScore = Math.min(app._count.tbl_interfaz, 10)
    return {
      name: app.nombre,
      criticidad: app.criticidad || 'Sin definir',
      critScore,
      couplingScore,
      riskLevel: critScore * couplingScore,
      components: app._count.tbl_componente_logico,
      interfaces: app._count.tbl_interfaz,
    }
  }).sort((a, b) => b.riskLevel - a.riskLevel)

  // SPOFs: critical apps with single deployment or no redundancy
  const spofs = apps
    .filter((a) => (a.criticidad === 'Crítica' || a.criticidad === 'Alta'))
    .map((a) => {
      const deployments = a.tbl_componente_logico.reduce((sum, c) => sum + c._count.rel_componente_log_despliegue, 0)
      return {
        name: a.nombre,
        criticidad: a.criticidad,
        components: a._count.tbl_componente_logico,
        deployments,
        isSPOF: deployments <= a._count.tbl_componente_logico,
      }
    })
    .filter((a) => a.isSPOF)
    .sort((a, b) => (b.criticidad === 'Crítica' ? 1 : 0) - (a.criticidad === 'Crítica' ? 1 : 0))

  // Personal data flow
  const personalDataApps = personalDataComponents.map((c) => ({
    component: c.nombre,
    app: c.tbl_aplicacion.nombre,
    criticidad: c.tbl_aplicacion.criticidad,
    consumedBy: c.rel_com_interfaz_consumo.length,
  }))

  // Risk distribution
  const riskDistribution = [
    { name: 'Crítico', value: riskMatrix.filter((r) => r.riskLevel > 20).length, color: '#EA352C' },
    { name: 'Alto', value: riskMatrix.filter((r) => r.riskLevel > 10 && r.riskLevel <= 20).length, color: '#FD7E14' },
    { name: 'Medio', value: riskMatrix.filter((r) => r.riskLevel > 5 && r.riskLevel <= 10).length, color: '#FAE44C' },
    { name: 'Bajo', value: riskMatrix.filter((r) => r.riskLevel <= 5).length, color: '#28A745' },
  ]

  return NextResponse.json({
    riskMatrix: riskMatrix.slice(0, 30),
    riskDistribution,
    spofs,
    personalDataApps,
    criticalWithoutRedundancy: spofs.filter((s) => s.criticidad === 'Crítica'),
  })
}

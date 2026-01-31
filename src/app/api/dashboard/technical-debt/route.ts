import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseFilters, buildAppWhere } from '@/lib/filters'

function calculateDebtScore(app: {
  criticidad: string | null
  componentCount: number
  hasDoc: number
  interfaceCount: number
  techCategories: string[]
}): number {
  let score = 0
  if (app.criticidad === 'Crítica') score += 30
  else if (app.criticidad === 'Alta') score += 20
  else if (app.criticidad === 'Media') score += 10
  else score += 5

  if (app.componentCount > 20) score += 25
  else if (app.componentCount > 10) score += 15
  else if (app.componentCount > 5) score += 10
  else score += 5

  score += app.hasDoc > 0 ? 0 : 15

  if (app.interfaceCount > 10) score += 20
  else if (app.interfaceCount > 5) score += 10
  else score += 5

  if (app.techCategories.length > 5) score += 10
  else if (app.techCategories.length > 3) score += 5

  return Math.min(score, 100)
}

export async function GET(request: NextRequest) {
  const filters = parseFilters(request)
  const appWhere = buildAppWhere(filters)

  const [apps, technologies] = await Promise.all([
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
            version: true,
            url_documentacion: true,
            cat_tecnologia: { select: { nombre: true, categoria: true } },
            _count: { select: { rel_com_interfaz_consumo: true } },
          },
        },
        _count: { select: { tbl_componente_logico: true, tbl_interfaz: true } },
      },
    }),
    prisma.cat_tecnologia.findMany({
      select: {
        nombre: true,
        categoria: true,
        _count: { select: { tbl_componente_logico: true } },
      },
      orderBy: { tbl_componente_logico: { _count: 'desc' } },
    }),
  ])

  const appDebt = apps.map((app) => {
    const techCategories = [...new Set(
      app.tbl_componente_logico
        .map((c) => c.cat_tecnologia?.categoria)
        .filter(Boolean) as string[]
    )]
    const hasDoc = app.tbl_componente_logico.filter((c) => c.url_documentacion).length
    const score = calculateDebtScore({
      criticidad: app.criticidad,
      componentCount: app._count.tbl_componente_logico,
      hasDoc,
      interfaceCount: app._count.tbl_interfaz,
      techCategories,
    })
    return {
      id: app.id_aplicacion,
      nombre: app.nombre,
      criticidad: app.criticidad || 'Sin definir',
      estado: app.cat_estado.nombre,
      modelo: app.cat_modelo_servicio.nombre,
      components: app._count.tbl_componente_logico,
      interfaces: app._count.tbl_interfaz,
      debtScore: score,
      hasDocumentation: hasDoc > 0,
      techCount: techCategories.length,
    }
  }).sort((a, b) => b.debtScore - a.debtScore)

  const debtDistribution = [
    { name: 'Crítico (>75)', value: appDebt.filter((a) => a.debtScore > 75).length, color: '#EA352C' },
    { name: 'Alto (50-75)', value: appDebt.filter((a) => a.debtScore > 50 && a.debtScore <= 75).length, color: '#FD7E14' },
    { name: 'Medio (25-50)', value: appDebt.filter((a) => a.debtScore > 25 && a.debtScore <= 50).length, color: '#FAE44C' },
    { name: 'Bajo (≤25)', value: appDebt.filter((a) => a.debtScore <= 25).length, color: '#28A745' },
  ]

  const avgDebt = appDebt.length > 0
    ? Math.round(appDebt.reduce((sum, a) => sum + a.debtScore, 0) / appDebt.length)
    : 0

  const techByCategory = new Map<string, { count: number; techs: string[] }>()
  for (const t of technologies) {
    const cat = t.categoria || 'Sin categoría'
    const existing = techByCategory.get(cat) || { count: 0, techs: [] }
    existing.count += t._count.tbl_componente_logico
    existing.techs.push(t.nombre)
    techByCategory.set(cat, existing)
  }

  return NextResponse.json({
    averageDebtScore: avgDebt,
    debtDistribution,
    appDebt: appDebt.slice(0, 50),
    techAntiquity: Array.from(techByCategory.entries()).map(([cat, data]) => ({
      categoria: cat,
      componentCount: data.count,
      techCount: data.techs.length,
    })).sort((a, b) => b.componentCount - a.componentCount),
    prioritizationMatrix: appDebt.slice(0, 20).map((a) => ({
      name: a.nombre,
      debtScore: a.debtScore,
      components: a.components,
      criticidad: a.criticidad,
    })),
  })
}

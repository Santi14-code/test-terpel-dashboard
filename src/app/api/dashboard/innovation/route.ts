import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseFilters, buildAppWhere } from '@/lib/filters'

const CLOUD_MODELS = ['SaaS', 'PaaS', 'IaaS']
const MODERN_TECH_KEYWORDS = ['react', 'angular', 'vue', 'node', 'python', 'kubernetes', 'docker', 'kafka', 'redis', 'graphql', 'typescript', 'go', 'rust', 'terraform', 'aws', 'azure', 'gcp']

export async function GET(request: NextRequest) {
  const filters = parseFilters(request)
  const appWhere = buildAppWhere(filters)

  const [apps, technologies, modelos, deploymentTypes] = await Promise.all([
    prisma.tbl_aplicacion.findMany({
      where: appWhere,
      select: {
        id_aplicacion: true,
        nombre: true,
        criticidad: true,
        cat_modelo_servicio: { select: { nombre: true } },
        tbl_componente_logico: {
          select: {
            cat_tecnologia: { select: { nombre: true, categoria: true } },
          },
        },
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

    prisma.cat_modelo_servicio.findMany({
      select: { nombre: true, _count: { select: { tbl_aplicacion: true } } },
    }),

    prisma.cat_componente_despliegue_tipo.findMany({
      select: { nombre_tipo: true, _count: { select: { tbl_componente_despliegue: true } } },
    }),
  ])

  // Cloud adoption
  const cloudApps = apps.filter((a) => CLOUD_MODELS.includes(a.cat_modelo_servicio.nombre)).length
  const cloudAdoption = apps.length > 0 ? Math.round((cloudApps / apps.length) * 100) : 0

  // Modernity index per app
  const appModernity = apps.map((app) => {
    const techs = app.tbl_componente_logico
      .map((c) => c.cat_tecnologia?.nombre?.toLowerCase() || '')
      .filter(Boolean)
    const modernCount = techs.filter((t) => MODERN_TECH_KEYWORDS.some((k) => t.includes(k))).length
    const isCloud = CLOUD_MODELS.includes(app.cat_modelo_servicio.nombre)
    const modernity = Math.min(100, Math.round(
      (modernCount / Math.max(techs.length, 1)) * 60 + (isCloud ? 40 : 0)
    ))
    return { name: app.nombre, modernity, modelo: app.cat_modelo_servicio.nombre, criticidad: app.criticidad }
  }).sort((a, b) => b.modernity - a.modernity)

  const avgModernity = appModernity.length > 0
    ? Math.round(appModernity.reduce((s, a) => s + a.modernity, 0) / appModernity.length)
    : 0

  // Tech radar by category
  const techByCategory = new Map<string, { techs: { name: string; count: number }[] }>()
  for (const t of technologies) {
    const cat = t.categoria || 'Sin categoría'
    const existing = techByCategory.get(cat) || { techs: [] }
    existing.techs.push({ name: t.nombre, count: t._count.tbl_componente_logico })
    techByCategory.set(cat, existing)
  }

  return NextResponse.json({
    cloudAdoption,
    avgModernity,
    modelDistribution: modelos.map((m) => ({ name: m.nombre, value: m._count.tbl_aplicacion })),
    appModernity: appModernity.slice(0, 30),
    techRadar: Array.from(techByCategory.entries()).map(([cat, data]) => ({
      category: cat,
      technologies: data.techs.slice(0, 10),
    })),
    deploymentTypes: deploymentTypes.map((d) => ({ name: d.nombre_tipo, count: d._count.tbl_componente_despliegue })),
  })
}

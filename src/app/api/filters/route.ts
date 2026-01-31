import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const [lineasPrincipal, lineasNegocio, estados, criticidades] = await Promise.all([
    prisma.cat_linea_negocio_principal.findMany({
      select: { id_linea_negocio_principal: true, descripcion: true },
      orderBy: { descripcion: 'asc' },
    }),
    prisma.cat_linea_negocio.findMany({
      select: { id_linea_negocio: true, tipo_linea_negocio: true, id_linea_negocio_principal: true },
      orderBy: { tipo_linea_negocio: 'asc' },
    }),
    prisma.cat_estado.findMany({
      select: { id_estado: true, nombre: true },
      orderBy: { nombre: 'asc' },
    }),
    prisma.tbl_aplicacion.findMany({
      select: { criticidad: true },
      distinct: ['criticidad'],
      where: { criticidad: { not: null } },
    }),
  ])

  return NextResponse.json({
    lineasPrincipal: lineasPrincipal.map((l) => ({
      id: l.id_linea_negocio_principal,
      descripcion: l.descripcion,
    })),
    lineasNegocio: lineasNegocio.map((l) => ({
      id: l.id_linea_negocio,
      tipo: l.tipo_linea_negocio,
      id_principal: l.id_linea_negocio_principal,
    })),
    estados: estados.map((e) => ({ id: e.id_estado, nombre: e.nombre })),
    criticidades: criticidades.map((c) => c.criticidad).filter(Boolean),
  })
}

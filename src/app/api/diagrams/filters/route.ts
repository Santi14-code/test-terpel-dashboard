import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const lineaPrincipalId = searchParams.get('lineaPrincipal')

    // Get líneas principales
    const lineasPrincipales = await prisma.cat_linea_negocio_principal.findMany({
      orderBy: { descripcion: 'asc' },
    })

    // Get capacidades L1
    const capacidadesL1 = await prisma.cat_capacidad.findMany({
      orderBy: { nombre: 'asc' },
    })

    // Get tipos de línea if lineaPrincipal is specified
    let tiposLinea = []
    if (lineaPrincipalId) {
      tiposLinea = await prisma.cat_linea_negocio.findMany({
        where: {
          id_linea_negocio_principal: parseInt(lineaPrincipalId),
        },
        orderBy: { tipo_linea_negocio: 'asc' },
      })
    }

    return NextResponse.json({
      lineasPrincipales,
      capacidadesL1,
      tiposLinea,
    })
  } catch (error) {
    console.error('Error fetching filters:', error)
    return NextResponse.json({ error: 'Error cargando filtros' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const lineaPrincipalId = searchParams.get('lineaPrincipal')
    const tipoLineaId = searchParams.get('tipoLinea')

    // Get líneas principales
    const lineasPrincipales = await prisma.cat_linea_negocio_principal.findMany({
      orderBy: { descripcion: 'asc' },
    })

    // Get capacidades L1 - filtered by business line context
    let capacidadesL1 = []

    if (tipoLineaId) {
      // If tipo de línea is selected, get only L1 capacities related to it
      const subprocesses = await prisma.cat_subproceso.findMany({
        where: {
          rel_subproceso_linea_negocio: {
            some: {
              id_linea_negocio: parseInt(tipoLineaId),
            },
          },
        },
        include: {
          rel_subproceso_capacidad_nvl_3: {
            include: {
              cat_capacidad_nivel_3: {
                include: {
                  cat_capacidad_nivel_2: {
                    include: {
                      cat_capacidad: true,
                    },
                  },
                },
              },
            },
          },
        },
      })

      const cap1Map = new Map()
      subprocesses.forEach((subprocess) => {
        subprocess.rel_subproceso_capacidad_nvl_3.forEach((rel) => {
          const cap1 = rel.cat_capacidad_nivel_3.cat_capacidad_nivel_2.cat_capacidad
          cap1Map.set(cap1.id_capacidad, cap1)
        })
      })
      capacidadesL1 = Array.from(cap1Map.values()).sort((a, b) =>
        a.nombre.localeCompare(b.nombre)
      )
    } else if (lineaPrincipalId) {
      // If only línea principal is selected, get L1 capacities for that línea
      const subprocesses = await prisma.cat_subproceso.findMany({
        where: {
          rel_subproceso_linea_negocio: {
            some: {
              cat_linea_negocio: {
                id_linea_negocio_principal: parseInt(lineaPrincipalId),
              },
            },
          },
        },
        include: {
          rel_subproceso_capacidad_nvl_3: {
            include: {
              cat_capacidad_nivel_3: {
                include: {
                  cat_capacidad_nivel_2: {
                    include: {
                      cat_capacidad: true,
                    },
                  },
                },
              },
            },
          },
        },
      })

      const cap1Map = new Map()
      subprocesses.forEach((subprocess) => {
        subprocess.rel_subproceso_capacidad_nvl_3.forEach((rel) => {
          const cap1 = rel.cat_capacidad_nivel_3.cat_capacidad_nivel_2.cat_capacidad
          cap1Map.set(cap1.id_capacidad, cap1)
        })
      })
      capacidadesL1 = Array.from(cap1Map.values()).sort((a, b) =>
        a.nombre.localeCompare(b.nombre)
      )
    } else {
      // If no filter selected, show all L1 capacities
      capacidadesL1 = await prisma.cat_capacidad.findMany({
        orderBy: { nombre: 'asc' },
      })
    }

    // Get tipos de línea if lineaPrincipal is specified
    let tiposLinea: Awaited<ReturnType<typeof prisma.cat_linea_negocio.findMany>> = []
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

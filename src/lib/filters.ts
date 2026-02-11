import { NextRequest } from 'next/server'

export interface ParsedFilters {
  criticidad: string[]
  estados: number[]
  lineasPrincipal: number[]
  lineasNegocio: number[]
}

export function parseFilters(request: NextRequest): ParsedFilters {
  const sp = request.nextUrl.searchParams
  return {
    criticidad: sp.get('criticidad')?.split(',').filter(Boolean) ?? [],
    estados: sp.get('estados')?.split(',').map(Number).filter(Boolean) ?? [],
    lineasPrincipal: sp.get('lineasPrincipal')?.split(',').map(Number).filter(Boolean) ?? [],
    lineasNegocio: sp.get('lineasNegocio')?.split(',').map(Number).filter(Boolean) ?? [],
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildAppWhere(filters: ParsedFilters): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {}

  if (filters.criticidad.length) {
    where.criticidad = { in: filters.criticidad }
  }

  if (filters.estados.length) {
    where.id_estado = { in: filters.estados }
  }

  // Filter by business line: app must have at least one component linked
  // to a subprocess that belongs to the selected business line(s)
  if (filters.lineasNegocio.length || filters.lineasPrincipal.length) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lineaWhere: any = {}
    if (filters.lineasNegocio.length) {
      lineaWhere.id_linea_negocio = { in: filters.lineasNegocio }
    }
    if (filters.lineasPrincipal.length) {
      lineaWhere.id_linea_negocio_principal = { in: filters.lineasPrincipal }
    }

    where.tbl_componente_logico = {
      some: {
        rel_componente_log_subproceso: {
          some: {
            cat_subproceso: {
              rel_subproceso_linea_negocio: {
                some: {
                  cat_linea_negocio: lineaWhere,
                },
              },
            },
          },
        },
      },
    }
  }

  return where
}

export function hasFilters(filters: ParsedFilters): boolean {
  return (
    filters.criticidad.length > 0 ||
    filters.estados.length > 0 ||
    filters.lineasPrincipal.length > 0 ||
    filters.lineasNegocio.length > 0
  )
}

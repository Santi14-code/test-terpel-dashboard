import { HttpRequest } from '@azure/functions'

export interface ParsedFilters {
  criticidad: string[]
  estados: number[]
  lineasPrincipal: number[]
  lineasNegocio: number[]
}

export function parseFilters(request: HttpRequest): ParsedFilters {
  const criticidad = request.query.get('criticidad')?.split(',').filter(Boolean) ?? []
  const estados = request.query.get('estados')?.split(',').map(Number).filter((n) => !isNaN(n)) ?? []
  const lineasPrincipal = request.query.get('lineasPrincipal')?.split(',').map(Number).filter((n) => !isNaN(n)) ?? []
  const lineasNegocio = request.query.get('lineasNegocio')?.split(',').map(Number).filter((n) => !isNaN(n)) ?? []

  return {
    criticidad,
    estados,
    lineasPrincipal,
    lineasNegocio,
  }
}

export function buildAppWhere(filters: ParsedFilters): any {
  const where: any = {}

  if (filters.criticidad.length) {
    where.criticidad = { in: filters.criticidad }
  }

  if (filters.estados.length) {
    where.id_estado = { in: filters.estados }
  }

  if (filters.lineasNegocio.length || filters.lineasPrincipal.length) {
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

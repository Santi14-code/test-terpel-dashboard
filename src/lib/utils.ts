import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return num.toLocaleString()
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

export const CRITICALITY_COLORS: Record<string, string> = {
  Crítica: '#EA352C',
  Alta: '#FD7E14',
  Media: '#FAE44C',
  Baja: '#28A745',
}

export const CRITICALITY_ORDER = ['Crítica', 'Alta', 'Media', 'Baja']

export const CHART_COLORS = [
  '#EA352C', '#FAE44C', '#44546A', '#28A745', '#17A2B8',
  '#FD7E14', '#6f42c1', '#e83e8c', '#20c997', '#6610f2',
  '#fd7e14', '#007bff', '#dc3545', '#ffc107', '#28a745',
]

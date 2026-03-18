import type { AnimeStatusCode } from '../types/anime'

const statusMap: Record<AnimeStatusCode, string> = {
  1: 'En emision',
  2: 'Finalizado',
  3: 'Proximamente',
}

export function formatTypeLabel(type: string): string {
  const normalized = type.trim().toLowerCase()

  if (normalized === 'tv') {
    return 'TV'
  }

  if (normalized === 'ova' || normalized === 'ona') {
    return normalized.toUpperCase()
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

export function formatStatusLabel(status?: string | AnimeStatusCode): string {
  if (typeof status === 'number') {
    return statusMap[status]
  }

  if (!status) {
    return 'Sin estado'
  }

  return status
}

export function formatGenreLabel(value: string): string {
  return value
    .split('-')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ')
}

export function formatEpisodeLabel(number: number): string {
  return `Episodio ${String(number).padStart(2, '0')}`
}

export function getHostname(value?: string): string | null {
  if (!value) {
    return null
  }

  try {
    return new URL(value).hostname.replace(/^www\./, '')
  } catch {
    return value
  }
}

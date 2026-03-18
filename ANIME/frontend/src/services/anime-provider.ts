import { animeClientConfig, type AnimeProviderKey } from '../config/anime'
import { demoAnimeCatalog, demoEpisodesByNumber, demoLatestEpisodes } from '../data/demo'
import type {
  AnimeDetail,
  AnimeEpisodeLink,
  AnimeStatusCode,
  AnimeSummary,
  EpisodeDetail,
  EpisodeSummary,
  SearchParams,
  SearchResultPage,
} from '../types/anime'

export interface AnimeProvider {
  getLatestEpisodes(signal?: AbortSignal): Promise<EpisodeSummary[]>
  getOnAir(signal?: AbortSignal): Promise<AnimeSummary[]>
  search(params: SearchParams, signal?: AbortSignal): Promise<SearchResultPage>
  getAnimeBySlug(slug: string, signal?: AbortSignal): Promise<AnimeDetail>
  getEpisodeByNumber(
    animeSlug: string,
    episodeNumber: number,
    signal?: AbortSignal,
  ): Promise<EpisodeDetail>
}

class AnimeApiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message)
    this.name = 'AnimeApiError'
  }
}

interface ApiEnvelope<T> {
  success: boolean
  data: T
}

interface AnimeFlvListItem {
  title: string
  type: string
  slug: string
  url: string
}

interface AnimeFlvEpisodeListItem {
  title: string
  number: number
  cover?: string
  slug: string
  url: string
}

interface AnimeFlvSearchMediaItem {
  title: string
  cover?: string
  synopsis?: string
  rating?: string
  slug: string
  type: string
  url?: string
}

interface AnimeFlvSearchResponse {
  currentPage: number
  hasNextPage: boolean
  previousPage?: string | null
  nextPage?: string | null
  foundPages: number
  media: AnimeFlvSearchMediaItem[]
}

interface AnimeFlvDetailResponse {
  title: string
  alternative_titles?: string[]
  status?: string
  rating?: string
  type: string
  cover?: string
  synopsis?: string
  genres?: string[]
  next_airing_episode?: string | null
  episodes: Array<{
    number: number
    slug: string
    url: string
  }>
  url?: string
  related?: Array<{
    title: string
    relation: string
    slug: string
    url?: string
  }>
}

interface AnimeFlvEpisodeResponse {
  title: string
  number: number
  servers: Array<{
    name: string
    download?: string
    embed?: string
  }>
}

function extractAnimeSlugFromEpisodeSlug(episodeSlug: string, number: number): string {
  const suffix = `-${number}`

  if (episodeSlug.endsWith(suffix)) {
    return episodeSlug.slice(0, -suffix.length)
  }

  return episodeSlug
}

async function requestJson<T>(
  path: string,
  signal?: AbortSignal,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers)
  headers.set('Accept', 'application/json')

  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${animeClientConfig.baseUrl}${path}`, {
    ...init,
    headers,
    signal,
  })

  if (!response.ok) {
    let message = 'La API de anime respondio con un error.'

    try {
      const payload = (await response.json()) as Partial<{ message: string }>
      if (payload.message) {
        message = payload.message
      }
    } catch {
      message = response.statusText || message
    }

    throw new AnimeApiError(message, response.status)
  }

  const payload = (await response.json()) as ApiEnvelope<T>

  if (!payload.success) {
    throw new AnimeApiError('La API respondio sin datos validos.')
  }

  return payload.data
}

function mapAnimeFlvSummary(item: AnimeFlvListItem): AnimeSummary {
  return {
    title: item.title,
    slug: item.slug,
    type: item.type,
    url: item.url,
  }
}

function mapSearchItem(item: AnimeFlvSearchMediaItem): AnimeSummary {
  return {
    title: item.title,
    slug: item.slug,
    type: item.type,
    cover: item.cover,
    synopsis: item.synopsis,
    rating: item.rating,
    url: item.url,
  }
}

function normalizeEpisodeLinks(episodes: AnimeEpisodeLink[]): AnimeEpisodeLink[] {
  const episodeMap = new Map<number, AnimeEpisodeLink>()

  for (const episode of episodes) {
    if (!Number.isFinite(episode.number) || episode.number <= 0) {
      continue
    }

    const current = episodeMap.get(episode.number)

    if (!current || (!current.url && episode.url) || (!current.slug && episode.slug)) {
      episodeMap.set(episode.number, episode)
    }
  }

  return [...episodeMap.values()].sort((left, right) => left.number - right.number)
}

function createAnimeFlvProvider(): AnimeProvider {
  const detailCache = new Map<string, AnimeDetail>()

  async function fetchAnimeDetail(slug: string, signal?: AbortSignal): Promise<AnimeDetail> {
    const cached = detailCache.get(slug)

    if (cached) {
      return cached
    }

    const data = await requestJson<AnimeFlvDetailResponse>(
      `/api/anime/${encodeURIComponent(slug)}`,
      signal,
    )

    const detail: AnimeDetail = {
      title: data.title,
      slug,
      type: data.type,
      cover: data.cover,
      synopsis: data.synopsis,
      rating: data.rating,
      alternativeTitles: data.alternative_titles ?? [],
      status: data.status,
      genres: data.genres ?? [],
      nextAiringEpisode: data.next_airing_episode ?? null,
      episodes: normalizeEpisodeLinks(data.episodes ?? []),
      related: data.related ?? [],
      url: data.url,
    }

    detailCache.set(slug, detail)
    return detail
  }

  async function enrichOnAirSummary(
    item: AnimeFlvListItem,
    signal?: AbortSignal,
  ): Promise<AnimeSummary> {
    try {
      const detail = await fetchAnimeDetail(item.slug, signal)

      return {
        title: item.title,
        slug: item.slug,
        type: item.type,
        cover: detail.cover,
        synopsis: detail.synopsis,
        rating: detail.rating,
        url: item.url,
      }
    } catch (error) {
      if (signal?.aborted || (error instanceof Error && error.name === 'AbortError')) {
        throw error
      }

      return mapAnimeFlvSummary(item)
    }
  }

  async function enrichRelatedAnime(
    item: AnimeDetail['related'][number],
    signal?: AbortSignal,
  ): Promise<AnimeDetail['related'][number]> {
    try {
      const detail = await fetchAnimeDetail(item.slug, signal)

      return {
        ...item,
        cover: detail.cover,
      }
    } catch (error) {
      if (signal?.aborted || (error instanceof Error && error.name === 'AbortError')) {
        throw error
      }

      return item
    }
  }

  return {
    async getLatestEpisodes(signal) {
      const data = await requestJson<AnimeFlvEpisodeListItem[]>(
        '/api/list/latest-episodes',
        signal,
      )

      return data.map((item) => ({
        title: item.title,
        animeSlug: extractAnimeSlugFromEpisodeSlug(item.slug, item.number),
        episodeSlug: item.slug,
        number: item.number,
        cover: item.cover,
        url: item.url,
      }))
    },

    async getOnAir(signal) {
      const data = await requestJson<AnimeFlvListItem[]>('/api/list/animes-on-air', signal)
      return Promise.all(data.map((item) => enrichOnAirSummary(item, signal)))
    },

    async search(params, signal) {
      const query = params.query.trim()
      const hasFilters =
        params.genres.length > 0 || params.statuses.length > 0 || params.types.length > 0

      if (!query && !hasFilters) {
        return {
          currentPage: 1,
          hasNextPage: false,
          previousPage: null,
          nextPage: null,
          foundPages: 0,
          media: [],
          mode: 'filter',
        }
      }

      if (query) {
        const searchParams = new URLSearchParams({
          query,
          page: String(params.page),
        })

        const data = await requestJson<AnimeFlvSearchResponse>(
          `/api/search?${searchParams.toString()}`,
          signal,
        )

        return {
          ...data,
          media: data.media.map(mapSearchItem),
          mode: 'text',
        }
      }

      const searchParams = new URLSearchParams({
        order: params.order,
        page: String(params.page),
      })

      const data = await requestJson<AnimeFlvSearchResponse>(
        `/api/search/by-filter?${searchParams.toString()}`,
        signal,
        {
          method: 'POST',
          body: JSON.stringify({
            genres: params.genres,
            statuses: params.statuses,
            types: params.types,
          }),
        },
      )

      return {
        ...data,
        media: data.media.map(mapSearchItem),
        mode: 'filter',
      }
    },

    async getAnimeBySlug(slug, signal) {
      const detail = await fetchAnimeDetail(slug, signal)
      const related = await Promise.all(
        detail.related.map((item) => enrichRelatedAnime(item, signal)),
      )

      return {
        ...detail,
        related,
      }
    },

    async getEpisodeByNumber(animeSlug, episodeNumber, signal) {
      const data = await requestJson<AnimeFlvEpisodeResponse>(
        `/api/anime/${encodeURIComponent(animeSlug)}/episode/${episodeNumber}`,
        signal,
      )

      return {
        animeSlug,
        title: data.title,
        number: data.number,
        servers: data.servers.map((server) => ({
          name: server.name,
          download: server.download ?? null,
          embed: server.embed ?? null,
        })),
      }
    },
  }
}

function matchesQuery(value: string, query: string): boolean {
  return value.toLowerCase().includes(query.toLowerCase())
}

function hasAnyGenres(target: string[], selected: string[]): boolean {
  if (selected.length === 0) {
    return true
  }

  return selected.some((genre) => target.includes(genre))
}

function normalizeStatusToCode(value?: string): AnimeStatusCode | null {
  const normalized = value?.toLowerCase()

  if (normalized === 'en emision') {
    return 1
  }

  if (normalized === 'finalizado') {
    return 2
  }

  if (normalized === 'proximamente') {
    return 3
  }

  return null
}

function createDemoProvider(): AnimeProvider {
  return {
    async getLatestEpisodes() {
      return demoLatestEpisodes
    },

    async getOnAir() {
      return demoAnimeCatalog
        .filter((anime) => anime.status?.toLowerCase() === 'en emision')
        .map((anime) => ({
          title: anime.title,
          slug: anime.slug,
          type: anime.type,
          cover: anime.cover,
          synopsis: anime.synopsis,
          rating: anime.rating,
          url: anime.url,
        }))
    },

    async search(params) {
      const query = params.query.trim()
      const filtered = demoAnimeCatalog.filter((anime) => {
        const matchesText =
          !query ||
          matchesQuery(anime.title, query) ||
          matchesQuery(anime.synopsis ?? '', query) ||
          anime.genres.some((genre) => matchesQuery(genre, query))

        const matchesTypes = params.types.length === 0 || params.types.includes(anime.type)
        const statusCode = normalizeStatusToCode(anime.status)
        const matchesStatuses =
          params.statuses.length === 0 ||
          (statusCode !== null && params.statuses.includes(statusCode))

        return matchesText && matchesTypes && matchesStatuses && hasAnyGenres(anime.genres, params.genres)
      })

      return {
        currentPage: 1,
        hasNextPage: false,
        previousPage: null,
        nextPage: null,
        foundPages: filtered.length > 0 ? 1 : 0,
        media: filtered.map((anime) => ({
          title: anime.title,
          slug: anime.slug,
          type: anime.type,
          cover: anime.cover,
          synopsis: anime.synopsis,
          rating: anime.rating,
          url: anime.url,
        })),
        mode: query ? 'text' : 'filter',
      }
    },

    async getAnimeBySlug(slug) {
      const anime = demoAnimeCatalog.find((entry) => entry.slug === slug)

      if (!anime) {
        throw new AnimeApiError('No se encontro el anime solicitado.', 404)
      }

      return {
        ...anime,
        related: anime.related.map((related) => ({
          ...related,
          cover: demoAnimeCatalog.find((entry) => entry.slug === related.slug)?.cover,
        })),
      }
    },

    async getEpisodeByNumber(animeSlug, episodeNumber) {
      const episode = demoEpisodesByNumber.get(`${animeSlug}-${episodeNumber}`)

      if (!episode) {
        throw new AnimeApiError('No se encontro el episodio solicitado.', 404)
      }

      return {
        ...episode,
        servers: [...episode.servers].sort((left, right) => left.name.localeCompare(right.name)),
      }
    },
  }
}

function createProvider(providerKey: AnimeProviderKey): AnimeProvider {
  if (providerKey === 'demo') {
    return createDemoProvider()
  }

  return createAnimeFlvProvider()
}

export const animeProvider = createProvider(animeClientConfig.provider)


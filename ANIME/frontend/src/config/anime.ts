export type AnimeProviderKey = 'animeflv' | 'demo'

const knownProviders = new Set<AnimeProviderKey>(['animeflv', 'demo'])

function normalizeProvider(value?: string): AnimeProviderKey {
  if (value && knownProviders.has(value as AnimeProviderKey)) {
    return value as AnimeProviderKey
  }

  return 'animeflv'
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '')
}

export const animeClientConfig = {
  provider: normalizeProvider(import.meta.env.VITE_ANIME_PROVIDER),
  baseUrl: trimTrailingSlash(
    import.meta.env.VITE_ANIME_API_BASE_URL ?? 'https://animeflv.ahmedrangel.com',
  ),
  allowExternalEmbeds: import.meta.env.VITE_ALLOW_EXTERNAL_EMBEDS !== 'false',
}

export const animeProviderLabels: Record<AnimeProviderKey, string> = {
  animeflv: 'AnimeFLV Adapter',
  demo: 'Demo Local',
}

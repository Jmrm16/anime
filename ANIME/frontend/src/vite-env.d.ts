/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ANIME_PROVIDER?: string
  readonly VITE_ANIME_API_BASE_URL?: string
  readonly VITE_ALLOW_EXTERNAL_EMBEDS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

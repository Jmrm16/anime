import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link, useParams } from 'react-router-dom'
import { animeClientConfig } from '../config/anime'
import { PageLoader } from '../components/PageLoader'
import { StatePanel } from '../components/StatePanel'
import { useAsyncData } from '../hooks/useAsyncData'
import {
  formatEpisodeLabel,
  formatGenreLabel,
  formatStatusLabel,
  formatTypeLabel,
  getHostname,
} from '../lib/format'
import { animeProvider } from '../services/anime-provider'
import type { AnimeEpisodeLink, EpisodeServer } from '../types/anime'

interface WatchPayload {
  animeSlug: string
  animeTitle: string
  animeCover?: string
  animeSynopsis?: string
  animeType: string
  animeStatus?: string
  animeGenres: string[]
  episodes: AnimeEpisodeLink[]
  episodeTitle: string
  number: number
  servers: EpisodeServer[]
}

function getPlayableVideoUrl(value?: string | null): string | null {
  if (!value) {
    return null
  }

  try {
    const url = new URL(value)
    const path = url.pathname.toLowerCase()

    if (
      path.endsWith('.mp4') ||
      path.endsWith('.webm') ||
      path.endsWith('.ogg') ||
      path.endsWith('.m3u8')
    ) {
      return value
    }
  } catch {
    return null
  }

  return null
}

function getServerMode(server?: EpisodeServer): 'video' | 'embed' | 'link' | 'empty' {
  if (!server) {
    return 'empty'
  }

  if (getPlayableVideoUrl(server.download)) {
    return 'video'
  }

  if (server.embed) {
    return 'embed'
  }

  if (server.download) {
    return 'link'
  }

  return 'empty'
}

function pickPreferredServer(servers: EpisodeServer[]): string | null {
  const directServer = servers.find((server) => getServerMode(server) === 'video')
  return directServer?.name ?? servers[0]?.name ?? null
}

function ensureVisibleEpisode(
  episodes: AnimeEpisodeLink[],
  animeSlug: string,
  episodeNumber: number,
): AnimeEpisodeLink[] {
  if (episodes.some((episode) => episode.number === episodeNumber)) {
    return episodes
  }

  return [...episodes, { number: episodeNumber, slug: `${animeSlug}-${episodeNumber}` }].sort(
    (left, right) => left.number - right.number,
  )
}

function forcePageTop() {
  window.scrollTo(0, 0)
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
  document.querySelector('main')?.scrollTo(0, 0)
}

export function WatchPage() {
  const { slug, number } = useParams()
  const episodeNumber = Number(number ?? '0')
  const [selectedServer, setSelectedServer] = useState<string | null>(null)
  const playerFrameRef = useRef<HTMLDivElement | null>(null)
  const episodeRailRef = useRef<HTMLDivElement | null>(null)
  const activeEpisodeRef = useRef<HTMLDivElement | null>(null)
  const [playerHeight, setPlayerHeight] = useState<number | null>(null)

  const watchState = useAsyncData(
    [slug ?? '', episodeNumber],
    async (signal) => {
      const [anime, episode] = await Promise.all([
        animeProvider.getAnimeBySlug(slug ?? '', signal),
        animeProvider.getEpisodeByNumber(slug ?? '', episodeNumber, signal),
      ])

      const payload: WatchPayload = {
        animeSlug: anime.slug,
        animeTitle: anime.title,
        animeCover: anime.cover,
        animeSynopsis: anime.synopsis,
        animeType: anime.type,
        animeStatus: anime.status,
        animeGenres: anime.genres,
        episodes: ensureVisibleEpisode(anime.episodes, anime.slug, episode.number),
        episodeTitle: episode.title,
        number: episode.number,
        servers: episode.servers,
      }

      return payload
    },
    {
      enabled: Boolean(slug) && Number.isFinite(episodeNumber) && episodeNumber > 0,
      resetOnLoad: true,
      minimumDelayMs: 280,
    },
  )

  useEffect(() => {
    const preferredServer = pickPreferredServer(watchState.data?.servers ?? [])
    setSelectedServer(preferredServer)
  }, [
    watchState.data?.number,
    watchState.data?.servers.map((server) => server.name).join('|'),
  ])

  useEffect(() => {
    const node = playerFrameRef.current
    if (!node || typeof ResizeObserver === 'undefined') {
      return
    }

    const updateHeight = () => {
      setPlayerHeight(Math.round(node.getBoundingClientRect().height))
    }

    updateHeight()

    const observer = new ResizeObserver(() => {
      updateHeight()
    })

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [watchState.data?.number, selectedServer])

  useEffect(() => {
    const container = episodeRailRef.current
    const activeCard = activeEpisodeRef.current

    if (!container || !activeCard) {
      return
    }

    const containerTop = container.scrollTop
    const containerBottom = containerTop + container.clientHeight
    const targetTop = activeCard.offsetTop - container.offsetTop
    const targetBottom = targetTop + activeCard.offsetHeight

    if (targetTop < containerTop || targetBottom > containerBottom) {
      container.scrollTo({
        top: Math.max(0, targetTop - 12),
        behavior: 'auto',
      })
    }
  }, [watchState.data?.number])

  useEffect(() => {
    forcePageTop()

    const rafId = window.requestAnimationFrame(() => {
      forcePageTop()
    })

    return () => {
      window.cancelAnimationFrame(rafId)
    }
  }, [slug, episodeNumber])

  if (!slug || !Number.isFinite(episodeNumber) || episodeNumber <= 0) {
    return (
      <StatePanel
        title="Ruta invalida"
        message="El episodio solicitado no tiene un numero valido en la URL."
      />
    )
  }

  if (watchState.loading) {
    return (
      <PageLoader
        title="Preparando reproductor"
        message="Estoy consultando el anime y los servidores disponibles para este episodio."
        variant="watch"
      />
    )
  }

  if (watchState.error || !watchState.data) {
    return (
      <StatePanel
        title="No pude abrir el episodio"
        message={watchState.error ?? 'No se encontraron servidores para este episodio.'}
      />
    )
  }

  const data = watchState.data
  const activeServer =
    data.servers.find((server) => server.name === selectedServer) ?? data.servers[0]
  const activeMode = getServerMode(activeServer)
  const directVideoUrl = getPlayableVideoUrl(activeServer?.download)
  const canUseExternalEmbed = animeClientConfig.allowExternalEmbeds
  const currentIndex = data.episodes.findIndex((episode) => episode.number === data.number)
  const previousEpisode = currentIndex > 0 ? data.episodes[currentIndex - 1] : null
  const nextEpisode =
    currentIndex >= 0 && currentIndex < data.episodes.length - 1
      ? data.episodes[currentIndex + 1]
      : null
  const shortSynopsis =
    data.animeSynopsis && data.animeSynopsis.length > 210
      ? `${data.animeSynopsis.slice(0, 210).trim()}...`
      : data.animeSynopsis
  const episodeRailStyle = playerHeight
    ? ({ ['--player-height' as string]: `${playerHeight}px` } as CSSProperties)
    : undefined

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[32px] border border-white/10 bg-[#111111]">
        <div className="border-b border-white/10 px-6 py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-orange-300">{data.animeTitle}</p>
              <h1 className="text-3xl font-semibold text-white">
                {formatEpisodeLabel(data.number)} - {data.episodeTitle}
              </h1>
              <div className="flex flex-wrap gap-2 text-sm text-slate-300">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  {formatTypeLabel(data.animeType)}
                </span>
                {data.animeStatus ? (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                    {formatStatusLabel(data.animeStatus)}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {previousEpisode ? (
                <Link
                  to={`/anime/${data.animeSlug}/episode/${previousEpisode.number}`}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:text-white"
                >
                  Episodio anterior
                </Link>
              ) : null}
              {nextEpisode ? (
                <Link
                  to={`/anime/${data.animeSlug}/episode/${nextEpisode.number}`}
                  className="rounded-2xl bg-orange-400 px-4 py-3 text-sm font-semibold text-black transition hover:bg-orange-300"
                >
                  Siguiente episodio
                </Link>
              ) : null}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Servidores</p>
              <p className="text-sm text-slate-400">
                Host: {getHostname(activeServer?.embed ?? activeServer?.download ?? '') ?? 'sin dato'}
              </p>
            </div>

            <div className="hide-scrollbar overflow-x-auto pb-1">
              <div className="flex gap-3">
                {data.servers.map((server) => {
                  const active = server.name === activeServer?.name
                  const mode = getServerMode(server)

                  return (
                    <button
                      key={server.name}
                      type="button"
                      onClick={() => setSelectedServer(server.name)}
                      className={
                        active
                          ? 'shrink-0 rounded-xl border border-orange-400/30 bg-orange-400/10 px-3 py-2 text-left'
                          : 'shrink-0 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left transition hover:border-white/20'
                      }
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white">{server.name}</p>
                        <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                          {mode}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {mode === 'video'
                          ? 'Directo'
                          : mode === 'embed'
                            ? 'Integrado'
                            : mode === 'link'
                              ? 'Externo'
                              : 'Sin fuente'}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
          <div className="min-w-0 bg-black">
            <div ref={playerFrameRef} className="relative aspect-video bg-black">
              {activeMode === 'video' && directVideoUrl ? (
                <video
                  key={directVideoUrl}
                  controls
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 h-full w-full bg-black"
                  src={directVideoUrl}
                />
              ) : activeMode === 'embed' && activeServer?.embed && canUseExternalEmbed ? (
                <iframe
                  title={`${data.episodeTitle} - ${activeServer.name}`}
                  src={activeServer.embed}
                  className="absolute inset-0 h-full w-full border-0 bg-black"
                  allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                  allowFullScreen
                  referrerPolicy="no-referrer"
                />
              ) : activeMode === 'embed' && activeServer?.embed ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black px-8 text-center">
                  <div className="max-w-xl space-y-4">
                    <p className="text-xs uppercase tracking-[0.32em] text-orange-300/80">
                      Embed bloqueado
                    </p>
                    <h3 className="text-2xl font-semibold text-white">
                      Esta fuente externa esta deshabilitada en la app.
                    </h3>
                    <a
                      href={activeServer.embed}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-medium text-slate-200 transition hover:border-orange-400/30 hover:text-white"
                    >
                      Abrir fuera de la app
                    </a>
                  </div>
                </div>
              ) : activeMode === 'link' && activeServer?.download ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black px-8 text-center">
                  <div className="max-w-xl space-y-4">
                    <p className="text-xs uppercase tracking-[0.32em] text-orange-300/80">
                      Enlace externo
                    </p>
                    <h3 className="text-2xl font-semibold text-white">
                      Esta fuente no expone reproductor embebido.
                    </h3>
                    <a
                      href={activeServer.download}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex rounded-2xl bg-orange-400 px-5 py-3 font-semibold text-black transition hover:bg-orange-300"
                    >
                      Abrir enlace
                    </a>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-black px-8 text-center">
                  <div className="max-w-xl space-y-4">
                    <p className="text-xs uppercase tracking-[0.32em] text-slate-500">
                      Sin fuente
                    </p>
                    <h3 className="text-2xl font-semibold text-white">
                      No hay una fuente utilizable para este episodio.
                    </h3>
                  </div>
                </div>
              )}
            </div>
          </div>

          <aside
            style={episodeRailStyle}
            className="border-t border-white/10 bg-[#111111] xl:h-[var(--player-height)] xl:min-h-0 xl:border-l xl:border-t-0"
          >
            <div className="flex h-full min-h-0 flex-col">
              <div ref={episodeRailRef} className="min-h-0 flex-1 overflow-y-auto px-3 py-3 scrollbar-thin">
                <div className="space-y-3">
                  {data.episodes.map((episode) => {
                    const active = episode.number === data.number
                    const cardClassName = active
                      ? 'flex gap-3 rounded-[22px] border border-orange-400/30 bg-orange-400/8 p-2.5'
                      : 'flex gap-3 rounded-[22px] border border-white/10 bg-white/[0.03] p-2.5 transition hover:border-white/20 hover:bg-white/[0.05]'
                    const cardContent = (
                      <>
                        <div className="relative h-[68px] w-[120px] shrink-0 overflow-hidden rounded-[18px] bg-black">
                          {data.animeCover ? (
                            <img
                              src={data.animeCover}
                              alt={`Portada de ${data.animeTitle}`}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : null}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <span className="absolute bottom-1.5 right-1.5 rounded bg-black/85 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                            {episode.number}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
                            {formatEpisodeLabel(episode.number)}
                          </p>
                          <h3 className="mt-1 line-clamp-2 text-[15px] font-semibold leading-6 text-white">
                            {data.animeTitle}
                          </h3>
                          <p className="mt-1 text-sm text-slate-400">
                            {active ? 'Reproduciendo ahora' : 'Abrir episodio'}
                          </p>
                        </div>
                      </>
                    )

                    if (active) {
                      return (
                        <div
                          key={episode.slug}
                          ref={activeEpisodeRef}
                          aria-current="true"
                          className={cardClassName}
                        >
                          {cardContent}
                        </div>
                      )
                    }

                    return (
                      <Link
                        key={episode.slug}
                        to={`/anime/${data.animeSlug}/episode/${episode.number}`}
                        className={cardClassName}
                      >
                        {cardContent}
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          </aside>
        </div>

        <div className="border-t border-white/10 px-6 py-5">
          <p className="max-w-3xl text-sm leading-7 text-slate-400">
            {shortSynopsis ?? 'Sin sinopsis disponible.'}
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-[32px] border border-white/10 bg-[#111111] p-6">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Informacion</p>
            <div className="flex flex-wrap gap-2">
              {data.animeGenres.slice(0, 6).map((genre) => (
                <span
                  key={genre}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300"
                >
                  {formatGenreLabel(genre)}
                </span>
              ))}
            </div>
            <p className="max-w-3xl text-sm leading-7 text-slate-400">
              {data.animeSynopsis ?? 'Sin sinopsis disponible.'}
            </p>
          </div>
        </div>

        <aside className="rounded-[32px] border border-white/10 bg-[#111111] p-6">
          <div className="space-y-5">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Reproduccion</p>
              <h3 className="mt-2 text-xl font-semibold text-white">{activeServer?.name}</h3>
            </div>

            <div className="border-t border-white/10 pt-5 text-sm leading-7 text-slate-400">
              <p>Host: {getHostname(activeServer?.embed ?? activeServer?.download ?? '') ?? 'sin dato'}</p>
              <p>
                Embeds externos: {canUseExternalEmbed ? 'habilitados en la app' : 'bloqueados'}
              </p>
              <p>
                Modo actual: {activeMode === 'video' ? 'directo' : activeMode === 'embed' ? 'embed integrado' : activeMode === 'link' ? 'enlace externo' : 'sin fuente'}
              </p>
            </div>

            {activeServer?.download ? (
              <a
                href={activeServer.download}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-white/20 hover:text-white"
              >
                Abrir enlace directo
              </a>
            ) : null}
          </div>
        </aside>
      </section>
    </div>
  )
}

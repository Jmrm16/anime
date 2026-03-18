import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MediaSlider } from '../components/MediaSlider'
import { PageLoader } from '../components/PageLoader'
import { SliderPosterCard } from '../components/SliderPosterCard'
import { StatePanel } from '../components/StatePanel'
import { useAsyncData } from '../hooks/useAsyncData'
import {
  formatEpisodeLabel,
  formatGenreLabel,
  formatStatusLabel,
  formatTypeLabel,
} from '../lib/format'
import { animeProvider } from '../services/anime-provider'

function forcePageTop() {
  window.scrollTo(0, 0)
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
  document.querySelector('main')?.scrollTo(0, 0)
}

export function AnimeDetailPage() {
  const { slug } = useParams()
  const [showFullSynopsis, setShowFullSynopsis] = useState(false)

  useEffect(() => {
    forcePageTop()

    const rafId = window.requestAnimationFrame(() => {
      forcePageTop()
    })

    return () => {
      window.cancelAnimationFrame(rafId)
    }
  }, [slug])

  const animeState = useAsyncData(
    [slug ?? ''],
    (signal) => animeProvider.getAnimeBySlug(slug ?? '', signal),
    {
      enabled: Boolean(slug),
      resetOnLoad: true,
      minimumDelayMs: 280,
    },
  )

  if (!slug) {
    return (
      <StatePanel
        title="Slug invalido"
        message="La ruta del anime no es valida. Regresa al inicio y selecciona otra tarjeta."
      />
    )
  }

  if (animeState.loading) {
    return (
      <PageLoader
        title="Cargando anime"
        message="Estoy reuniendo portada, sinopsis, episodios y relaciones."
      />
    )
  }

  if (animeState.error || !animeState.data) {
    return (
      <StatePanel
        title="No pude abrir el anime"
        message={animeState.error ?? 'No se encontraron datos para este slug.'}
      />
    )
  }

  const anime = animeState.data
  const shortSynopsis =
    anime.synopsis && anime.synopsis.length > 220
      ? `${anime.synopsis.slice(0, 220).trim()}...`
      : anime.synopsis

  return (
    <div className="space-y-10">
      <section className="relative min-h-[620px] overflow-hidden rounded-[36px] bg-[#111111]">
        {anime.cover ? (
          <img
            src={anime.cover}
            alt={`Portada de ${anime.title}`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,8,0.96)_0%,rgba(8,8,8,0.72)_38%,rgba(8,8,8,0.18)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.16)_0%,rgba(0,0,0,0.84)_100%)]" />

        <div className="relative flex min-h-[620px] flex-col justify-end px-6 pb-8 pt-16 sm:px-8 lg:px-10">
          <div className="max-w-3xl space-y-5">
            <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-slate-200">
              <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5">
                {formatTypeLabel(anime.type)}
              </span>
              <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5">
                {formatStatusLabel(anime.status)}
              </span>
              {anime.rating ? (
                <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5">
                  Rating {anime.rating}
                </span>
              ) : null}
            </div>

            <div className="space-y-3">
              <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
                {anime.title}
              </h1>
              {anime.alternativeTitles.length > 0 ? (
                <p className="text-sm leading-7 text-slate-300">
                  {anime.alternativeTitles.join(' / ')}
                </p>
              ) : null}
            </div>

            <p className="max-w-2xl text-base leading-8 text-slate-200/90">
              {shortSynopsis ?? 'No hay sinopsis disponible para este anime.'}
            </p>

            <div className="flex flex-wrap gap-2">
              {anime.genres.slice(0, 5).map((genre) => (
                <span
                  key={genre}
                  className="rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-sm text-slate-200"
                >
                  {formatGenreLabel(genre)}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to={`/anime/${anime.slug}/episode/${anime.episodes[0]?.number ?? 1}`}
                className="rounded-2xl bg-orange-400 px-6 py-3 font-semibold text-black transition hover:bg-orange-300"
              >
                Comenzar a ver
              </Link>
              <button
                type="button"
                onClick={() => setShowFullSynopsis((current) => !current)}
                className="rounded-2xl border border-white/10 bg-black/25 px-6 py-3 font-medium text-white transition hover:border-white/20 hover:bg-black/35"
              >
                {showFullSynopsis ? 'Ocultar detalles' : 'Mas detalles'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {showFullSynopsis ? (
        <section
          id="anime-details"
          className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"
        >
          <div className="rounded-[30px] border border-white/10 bg-[#111111] p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Sinopsis</p>
            <p className="mt-4 text-base leading-8 text-slate-200">
              {anime.synopsis ?? 'No hay sinopsis disponible para este anime.'}
            </p>
          </div>

          <aside className="rounded-[30px] border border-white/10 bg-[#111111] p-6">
            <div className="space-y-5">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Episodios</p>
                <p className="mt-2 text-3xl font-semibold text-white">{anime.episodes.length}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Proximo estreno</p>
                <p className="mt-2 text-sm leading-7 text-slate-200">
                  {anime.nextAiringEpisode ?? 'Sin fecha registrada'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Generos</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {anime.genres.map((genre) => (
                    <span
                      key={genre}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300"
                    >
                      {formatGenreLabel(genre)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </section>
      ) : null}

      <MediaSlider
        eyebrow="Temporada 1"
        title="Episodios"
        actionLabel="Ir al primero"
        actionTo={`/anime/${anime.slug}/episode/${anime.episodes[0]?.number ?? 1}`}
      >
        <>
          {anime.episodes.map((episode) => (
            <SliderPosterCard
              key={episode.slug}
              to={`/anime/${anime.slug}/episode/${episode.number}`}
              title={`${anime.title} - ${episode.number}`}
              image={anime.cover}
              footer={formatEpisodeLabel(episode.number)}
            />
          ))}
        </>
      </MediaSlider>

      {anime.related.length > 0 ? (
        <MediaSlider
          eyebrow="Relacionados"
          title="Mas series para ver"
          actionLabel="Buscar"
          actionTo="/search"
        >
          <>
            {anime.related.map((related) => (
              <SliderPosterCard
                key={`${related.slug}-${related.relation}`}
                to={`/anime/${related.slug}`}
                title={related.title}
                image={related.cover}
                footer={related.relation}
              />
            ))}
          </>
        </MediaSlider>
      ) : null}
    </div>
  )
}

import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MediaSlider } from '../components/MediaSlider'
import { SliderPosterCard } from '../components/SliderPosterCard'
import { StatePanel } from '../components/StatePanel'
import { useAsyncData } from '../hooks/useAsyncData'
import { formatEpisodeLabel, formatTypeLabel } from '../lib/format'
import { animeProvider } from '../services/anime-provider'

export function HomePage() {
  const navigate = useNavigate()
  const [quickQuery, setQuickQuery] = useState('')

  const latestEpisodes = useAsyncData([], (signal) => animeProvider.getLatestEpisodes(signal))
  const onAir = useAsyncData([], (signal) => animeProvider.getOnAir(signal))

  const featuredSlug = latestEpisodes.data?.[0]?.animeSlug ?? onAir.data?.[0]?.slug ?? ''
  const featuredAnime = useAsyncData(
    [featuredSlug],
    (signal) => animeProvider.getAnimeBySlug(featuredSlug, signal),
    { enabled: Boolean(featuredSlug) },
  )

  function handleQuickSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const query = quickQuery.trim()
    if (!query) {
      return
    }

    navigate(`/search?query=${encodeURIComponent(query)}`)
  }

  const featuredTitle = featuredAnime.data?.title ?? 'Explora nuevos animes'
  const featuredDescription =
    featuredAnime.data?.synopsis ??
    'Abre una serie destacada, revisa sus episodios y navega el catalogo con una portada mas limpia y directa.'
  const featuredCover = featuredAnime.data?.cover
  const featuredType = featuredAnime.data?.type
  const featuredStatus = featuredAnime.data?.status

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-[36px] bg-[#111111]">
        {featuredCover ? (
          <img
            src={featuredCover}
            alt={`Portada de ${featuredTitle}`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,10,0.96)_0%,rgba(10,10,10,0.78)_42%,rgba(10,10,10,0.36)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.12)_0%,rgba(10,10,10,0.72)_100%)]" />

        <div className="relative grid min-h-[500px] gap-10 px-6 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-10">
          <div className="flex flex-col justify-end space-y-6">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.35em] text-orange-300/80">
                Destacado de hoy
              </p>

              <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-slate-300">
                {featuredType ? (
                  <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1.5">
                    {formatTypeLabel(featuredType)}
                  </span>
                ) : null}
                {featuredStatus ? (
                  <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1.5">
                    {featuredStatus}
                  </span>
                ) : null}
                <span className="rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1.5 text-orange-100">
                  Catalogo adaptable
                </span>
              </div>

              <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
                {featuredTitle}
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-200/90">
                {featuredDescription}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to={featuredSlug ? `/anime/${featuredSlug}` : '/search'}
                className="rounded-2xl bg-orange-400 px-6 py-3 font-semibold text-black transition hover:bg-orange-300"
              >
                Ver anime
              </Link>
              <Link
                to="/search"
                className="rounded-2xl border border-white/10 bg-black/25 px-6 py-3 font-medium text-white transition hover:border-white/20 hover:bg-black/35"
              >
                Explorar catalogo
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-5 lg:items-end">
            <div className="grid w-full gap-4 sm:grid-cols-3 lg:max-w-[460px]">
              <div className="rounded-[28px] border border-white/10 bg-black/35 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Recientes</p>
                <p className="mt-3 text-3xl font-semibold text-white">
                  {latestEpisodes.data?.length ?? 0}
                </p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-black/35 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">En emision</p>
                <p className="mt-3 text-3xl font-semibold text-white">
                  {onAir.data?.length ?? 0}
                </p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-black/35 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Embeds</p>
                <p className="mt-3 text-sm font-medium leading-6 text-white">
                  Priorizados solo si no hay fuente directa
                </p>
              </div>
            </div>

            <div className="w-full rounded-[32px] border border-white/10 bg-black/45 p-5 backdrop-blur lg:max-w-[460px]">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                Busca rapido
              </p>
              <form onSubmit={handleQuickSearch} className="mt-4 flex flex-col gap-3">
                <input
                  type="search"
                  value={quickQuery}
                  onChange={(event) => setQuickQuery(event.target.value)}
                  placeholder="Escribe un titulo o genero"
                  className="h-14 rounded-2xl border border-white/10 bg-[#151515] px-4 text-white outline-none transition placeholder:text-slate-500 focus:border-orange-400/40"
                />
                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    className="rounded-2xl bg-orange-400 px-5 py-3 font-semibold text-black transition hover:bg-orange-300"
                  >
                    Buscar ahora
                  </button>
                  <Link
                    to="/search"
                    className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-medium text-slate-200 transition hover:border-white/20 hover:text-white"
                  >
                    Filtros
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {latestEpisodes.loading ? (
        <section className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Lo nuevo</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Ultimos episodios</h2>
          </div>
          <StatePanel
            title="Cargando episodios"
            message="Estoy consultando el proveedor activo para traer los lanzamientos mas recientes."
          />
        </section>
      ) : latestEpisodes.error ? (
        <section className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Lo nuevo</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Ultimos episodios</h2>
          </div>
          <StatePanel title="No pude cargar los episodios" message={latestEpisodes.error} />
        </section>
      ) : (
        <MediaSlider eyebrow="Lo nuevo" title="Ultimos episodios" actionLabel="Ver mas" actionTo="/search">
          <>
            {latestEpisodes.data?.map((episode) => (
              <SliderPosterCard
                key={episode.episodeSlug}
                to={`/anime/${episode.animeSlug}/episode/${episode.number}`}
                title={episode.title}
                image={episode.cover}
                footer={formatEpisodeLabel(episode.number)}
              />
            ))}
          </>
        </MediaSlider>
      )}

      {onAir.loading ? (
        <section className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Cartelera</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Series en emision</h2>
          </div>
          <StatePanel
            title="Cargando cartelera"
            message="Estoy revisando las series que siguen publicando episodios."
          />
        </section>
      ) : onAir.error ? (
        <section className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Cartelera</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Series en emision</h2>
          </div>
          <StatePanel title="No pude cargar la cartelera" message={onAir.error} />
        </section>
      ) : (
        <MediaSlider eyebrow="Cartelera" title="Series en emision" actionLabel="Explorar" actionTo="/search">
          <>
            {onAir.data?.map((anime) => (
              <SliderPosterCard
                key={anime.slug}
                to={`/anime/${anime.slug}`}
                title={anime.title}
                image={anime.cover}
                footer={
                  anime.rating
                    ? `${formatTypeLabel(anime.type)} • ${anime.rating}`
                    : formatTypeLabel(anime.type)
                }
              />
            ))}
          </>
        </MediaSlider>
      )}
    </div>
  )
}

import { FormEvent, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PosterCard } from '../components/PosterCard'
import { StatePanel } from '../components/StatePanel'
import { useAsyncData } from '../hooks/useAsyncData'
import { formatGenreLabel, formatStatusLabel, formatTypeLabel } from '../lib/format'
import { animeProvider } from '../services/anime-provider'
import type { AnimeStatusCode, SearchOrder, SearchParams } from '../types/anime'

const typeOptions = ['tv', 'movie', 'special', 'ova']
const genreOptions = [
  'accion',
  'aventura',
  'comedia',
  'drama',
  'fantasia',
  'romance',
  'shounen',
  'sobrenatural',
]
const statusOptions: AnimeStatusCode[] = [1, 2, 3]
const orderOptions: SearchOrder[] = ['default', 'updated', 'added', 'title', 'rating']

function parseArrayParam(value: string | null): string[] {
  if (!value) {
    return []
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function parseStatusParam(value: string | null): AnimeStatusCode[] {
  return parseArrayParam(value)
    .map((item) => Number(item))
    .filter((item): item is AnimeStatusCode => item === 1 || item === 2 || item === 3)
}

function parseSearchParams(searchParams: URLSearchParams): SearchParams {
  const page = Number(searchParams.get('page') ?? '1')
  const order = (searchParams.get('order') ?? 'default') as SearchOrder

  return {
    query: searchParams.get('query') ?? '',
    page: Number.isNaN(page) || page < 1 ? 1 : page,
    order: orderOptions.includes(order) ? order : 'default',
    genres: parseArrayParam(searchParams.get('genres')),
    statuses: parseStatusParam(searchParams.get('statuses')),
    types: parseArrayParam(searchParams.get('types')),
  }
}

function toSearchParams(value: SearchParams): URLSearchParams {
  const searchParams = new URLSearchParams()

  if (value.query.trim()) {
    searchParams.set('query', value.query.trim())
  }

  if (value.page > 1) {
    searchParams.set('page', String(value.page))
  }

  if (value.order !== 'default') {
    searchParams.set('order', value.order)
  }

  if (value.genres.length > 0) {
    searchParams.set('genres', value.genres.join(','))
  }

  if (value.statuses.length > 0) {
    searchParams.set('statuses', value.statuses.join(','))
  }

  if (value.types.length > 0) {
    searchParams.set('types', value.types.join(','))
  }

  return searchParams
}

function toggleValue(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value]
}

function toggleStatus(list: AnimeStatusCode[], value: AnimeStatusCode): AnimeStatusCode[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value]
}

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const criteria = parseSearchParams(searchParams)
  const [formState, setFormState] = useState<SearchParams>(criteria)

  useEffect(() => {
    setFormState(criteria)
  }, [searchParams])

  const hasCriteria =
    criteria.query.trim().length > 0 ||
    criteria.genres.length > 0 ||
    criteria.statuses.length > 0 ||
    criteria.types.length > 0

  const results = useAsyncData(
    [
      criteria.query,
      criteria.page,
      criteria.order,
      criteria.genres.join(','),
      criteria.statuses.join(','),
      criteria.types.join(','),
    ],
    (signal) => animeProvider.search(criteria, signal),
    { enabled: hasCriteria },
  )

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSearchParams(
      toSearchParams({
        ...formState,
        page: 1,
      }),
    )
  }

  function changePage(page: number) {
    setSearchParams(
      toSearchParams({
        ...criteria,
        page,
      }),
    )
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="panel h-fit px-5 py-6">
        <div className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-cyan-200/70">Busqueda</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Explora el catalogo</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              El contrato vive en la capa de servicios. Si cambias de API, las vistas no
              necesitan reescribirse.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Titulo</label>
              <input
                type="search"
                value={formState.query}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    query: event.target.value,
                  }))
                }
                placeholder="Ej. isekai, frieren, shounen"
                className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Orden</label>
              <select
                value={formState.order}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    order: event.target.value as SearchOrder,
                  }))
                }
                className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-white outline-none transition focus:border-cyan-300/40"
              >
                {orderOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-200">Tipos</p>
              <div className="flex flex-wrap gap-2">
                {typeOptions.map((type) => {
                  const active = formState.types.includes(type)

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        setFormState((current) => ({
                          ...current,
                          types: toggleValue(current.types, type),
                        }))
                      }
                      className={
                        active
                          ? 'rounded-full border border-cyan-300/40 bg-cyan-400/15 px-3 py-2 text-sm text-cyan-100'
                          : 'rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 transition hover:border-cyan-300/30'
                      }
                    >
                      {formatTypeLabel(type)}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-200">Estados</p>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((status) => {
                  const active = formState.statuses.includes(status)

                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() =>
                        setFormState((current) => ({
                          ...current,
                          statuses: toggleStatus(current.statuses, status),
                        }))
                      }
                      className={
                        active
                          ? 'rounded-full border border-orange-300/40 bg-orange-400/15 px-3 py-2 text-sm text-orange-100'
                          : 'rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 transition hover:border-orange-300/30'
                      }
                    >
                      {formatStatusLabel(status)}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-200">Generos</p>
              <div className="flex flex-wrap gap-2">
                {genreOptions.map((genre) => {
                  const active = formState.genres.includes(genre)

                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() =>
                        setFormState((current) => ({
                          ...current,
                          genres: toggleValue(current.genres, genre),
                        }))
                      }
                      className={
                        active
                          ? 'rounded-full border border-emerald-300/40 bg-emerald-400/15 px-3 py-2 text-sm text-emerald-100'
                          : 'rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 transition hover:border-emerald-300/30'
                      }
                    >
                      {formatGenreLabel(genre)}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Buscar
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormState({
                    query: '',
                    page: 1,
                    order: 'default',
                    genres: [],
                    statuses: [],
                    types: [],
                  })
                  setSearchParams(new URLSearchParams())
                }}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-slate-200 transition hover:border-white/20 hover:text-white"
              >
                Limpiar
              </button>
            </div>
          </form>
        </div>
      </aside>

      <section className="space-y-5">
        <div className="panel px-6 py-5">
          <p className="text-xs uppercase tracking-[0.32em] text-orange-200/70">Resultados</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Busqueda de anime</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            La API actual separa la busqueda por texto y los filtros avanzados. Cuando
            hay texto, los filtros se mantienen en la URL pero la consulta remota usa el
            endpoint de texto.
          </p>
        </div>

        {!hasCriteria ? (
          <StatePanel
            title="Todavia no hay consulta"
            message="Escribe un titulo o activa filtros para consultar el proveedor de anime."
          />
        ) : results.loading ? (
          <StatePanel
            title="Buscando anime"
            message="Estoy consultando el proveedor activo con los criterios seleccionados."
          />
        ) : results.error ? (
          <StatePanel title="La busqueda fallo" message={results.error} />
        ) : results.data && results.data.media.length === 0 ? (
          <StatePanel
            title="Sin resultados"
            message="Prueba con otro texto o cambia el conjunto de filtros."
          />
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-slate-300">
                {results.data?.media.length ?? 0} resultados en modo{' '}
                <span className="font-semibold text-white">{results.data?.mode}</span>
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => changePage(Math.max(1, criteria.page - 1))}
                  disabled={criteria.page === 1}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-300/30 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={() => changePage(criteria.page + 1)}
                  disabled={!results.data?.hasNextPage}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-300/30 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Siguiente
                </button>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {results.data?.media.map((anime) => (
                <PosterCard
                  key={anime.slug}
                  to={`/anime/${anime.slug}`}
                  title={anime.title}
                  image={anime.cover}
                  eyebrow={formatTypeLabel(anime.type)}
                  badge={anime.rating ? `${anime.rating} / 10` : undefined}
                  description={anime.synopsis}
                  footer="Abrir detalle"
                />
              ))}
            </div>

            <div className="panel flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <p className="text-sm text-slate-400">
                Pagina {results.data?.currentPage ?? 1}
                {results.data?.foundPages ? ` de ${results.data.foundPages}` : ''}
              </p>
              <Link to="/" className="text-sm text-cyan-200 transition hover:text-white">
                Volver al inicio
              </Link>
            </div>
          </>
        )}
      </section>
    </div>
  )
}

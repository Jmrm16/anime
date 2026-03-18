import { Link } from 'react-router-dom'
import { formatEpisodeLabel } from '../lib/format'

interface EpisodeSliderCardProps {
  to: string
  title: string
  image?: string
  episodeNumber: number
}

export function EpisodeSliderCard({
  to,
  title,
  image,
  episodeNumber,
}: EpisodeSliderCardProps) {
  return (
    <Link
      to={to}
      className="group block w-[260px] shrink-0 snap-start sm:w-[280px] lg:w-[300px]"
    >
      <article className="overflow-hidden rounded-[24px] border border-white/10 bg-[#101010] transition duration-200 hover:border-orange-400/25 hover:bg-[#131313]">
        <div className="relative aspect-video overflow-hidden bg-[#181818]">
          {image ? (
            <img
              src={image}
              alt={`Portada de ${title}`}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-5 text-center text-lg font-semibold text-slate-200">
              {title}
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

          <span className="absolute left-3 top-3 rounded-full bg-[#111827]/92 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-100">
            {formatEpisodeLabel(episodeNumber)}
          </span>
        </div>

        <div className="space-y-2 px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
            {formatEpisodeLabel(episodeNumber)}
          </p>
          <h3 className="line-clamp-2 text-base font-semibold leading-6 text-white transition group-hover:text-orange-200">
            {title}
          </h3>
          <p className="text-sm leading-6 text-slate-400">Abrir episodio</p>
        </div>
      </article>
    </Link>
  )
}

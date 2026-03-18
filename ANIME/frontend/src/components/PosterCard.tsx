import { Link } from 'react-router-dom'

interface PosterCardProps {
  to: string
  title: string
  image?: string
  eyebrow?: string
  description?: string
  badge?: string
  footer?: string
}

export function PosterCard({
  to,
  title,
  image,
  eyebrow,
  description,
  badge,
  footer,
}: PosterCardProps) {
  return (
    <Link
      to={to}
      className="group overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/55 shadow-glow transition duration-200 hover:border-cyan-300/25"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-950">
        {image ? (
          <img
            src={image}
            alt={`Portada de ${title}`}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,1))] px-6 text-center text-lg font-semibold text-slate-200">
            {title}
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

        {badge ? (
          <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-slate-950/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-cyan-100">
            {badge}
          </span>
        ) : null}
      </div>

      <div className="space-y-3 px-5 py-5">
        {eyebrow ? (
          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">{eyebrow}</p>
        ) : null}

        <div className="space-y-1.5">
          <h3 className="line-clamp-2 text-lg font-semibold leading-6 text-white">{title}</h3>
          {footer ? <p className="text-sm text-slate-400">{footer}</p> : null}
        </div>

        {description ? (
          <p className="line-clamp-3 text-sm leading-6 text-slate-300">{description}</p>
        ) : null}
      </div>
    </Link>
  )
}

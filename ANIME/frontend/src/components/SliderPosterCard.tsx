import { Link } from 'react-router-dom'

interface SliderPosterCardProps {
  to: string
  title: string
  image?: string
  eyebrow?: string
  badge?: string
  footer?: string
}

export function SliderPosterCard({
  to,
  title,
  image,
  eyebrow,
  badge,
  footer,
}: SliderPosterCardProps) {
  return (
    <Link
      to={to}
      className="group block w-[178px] shrink-0 snap-start sm:w-[190px] lg:w-[208px]"
    >
      <div className="relative aspect-[0.68] overflow-hidden rounded-[2px] bg-[#141414]">
        {image ? (
          <img
            src={image}
            alt={`Portada de ${title}`}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-5 text-center text-lg font-semibold text-slate-200">
            {title}
          </div>
        )}

        {badge ? (
          <span className="absolute left-3 top-3 rounded-full bg-[#111827]/92 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-100">
            {badge}
          </span>
        ) : null}
      </div>

      <div className="space-y-1.5 pt-3">
        <h3 className="line-clamp-2 text-[1.02rem] font-semibold leading-7 text-white transition group-hover:text-orange-200">
          {title}
        </h3>

        {footer ? (
          <p className="text-[0.98rem] leading-6 text-slate-400">{footer}</p>
        ) : eyebrow ? (
          <p className="text-[0.98rem] leading-6 text-slate-400">{eyebrow}</p>
        ) : null}
      </div>
    </Link>
  )
}

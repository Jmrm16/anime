import { type ReactNode, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

interface MediaSliderProps {
  eyebrow: string
  title: string
  actionLabel?: string
  actionTo?: string
  children: ReactNode
}

export function MediaSlider({
  eyebrow,
  title,
  actionLabel,
  actionTo,
  children,
}: MediaSliderProps) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    const track = trackRef.current

    if (!track) {
      return
    }

    const updateButtons = () => {
      setCanScrollLeft(track.scrollLeft > 8)
      setCanScrollRight(track.scrollLeft + track.clientWidth < track.scrollWidth - 8)
    }

    updateButtons()
    track.addEventListener('scroll', updateButtons, { passive: true })
    window.addEventListener('resize', updateButtons)

    return () => {
      track.removeEventListener('scroll', updateButtons)
      window.removeEventListener('resize', updateButtons)
    }
  }, [children])

  function scrollTrack(direction: 'left' | 'right') {
    const track = trackRef.current

    if (!track) {
      return
    }

    track.scrollBy({
      left: direction === 'left' ? -track.clientWidth * 0.82 : track.clientWidth * 0.82,
      behavior: 'smooth',
    })
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-slate-500">{eyebrow}</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">{title}</h2>
        </div>

        <div className="flex items-center gap-3">
          {actionLabel && actionTo ? (
            <Link
              to={actionTo}
              className="hidden text-sm font-medium text-orange-300 transition hover:text-white sm:inline-flex"
            >
              {actionLabel}
            </Link>
          ) : null}

          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              onClick={() => scrollTrack('left')}
              disabled={!canScrollLeft}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#141414] text-slate-200 transition hover:border-orange-400/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Desplazar a la izquierda"
            >
              <span className="text-lg">‹</span>
            </button>
            <button
              type="button"
              onClick={() => scrollTrack('right')}
              disabled={!canScrollRight}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#141414] text-slate-200 transition hover:border-orange-400/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Desplazar a la derecha"
            >
              <span className="text-lg">›</span>
            </button>
          </div>
        </div>
      </div>

      <div
        ref={trackRef}
        className="hide-scrollbar overflow-x-auto scroll-smooth pb-2"
      >
        <div className="flex snap-x snap-mandatory gap-5">{children}</div>
      </div>
    </section>
  )
}

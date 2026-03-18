interface PageLoaderProps {
  title: string
  message: string
  variant?: 'detail' | 'watch'
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`skeleton-shimmer ${className}`} />
}

export function PageLoader({
  title,
  message,
  variant = 'detail',
}: PageLoaderProps) {
  if (variant === 'watch') {
    return (
      <div className="space-y-8">
        <section className="overflow-hidden rounded-[32px] border border-white/10 bg-[#111111]">
          <div className="space-y-5 border-b border-white/10 px-6 py-6">
            <div className="space-y-3">
              <SkeletonBlock className="h-4 w-40 rounded-full" />
              <SkeletonBlock className="h-10 w-full max-w-2xl rounded-2xl" />
              <div className="flex flex-wrap gap-2">
                <SkeletonBlock className="h-9 w-24 rounded-full" />
                <SkeletonBlock className="h-9 w-28 rounded-full" />
              </div>
            </div>

            <div className="space-y-3">
              <SkeletonBlock className="h-3 w-28 rounded-full" />
              <div className="flex flex-wrap gap-3">
                <SkeletonBlock className="h-14 w-28 rounded-xl" />
                <SkeletonBlock className="h-14 w-28 rounded-xl" />
                <SkeletonBlock className="h-14 w-28 rounded-xl" />
              </div>
            </div>
          </div>

          <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="p-0">
              <SkeletonBlock className="aspect-video w-full rounded-none" />
            </div>
            <aside className="border-t border-white/10 bg-[#111111] px-3 py-3 xl:border-l xl:border-t-0">
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex gap-3 rounded-[22px] border border-white/10 bg-white/[0.03] p-2.5"
                  >
                    <SkeletonBlock className="h-[68px] w-[120px] shrink-0 rounded-[18px]" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <SkeletonBlock className="h-3 w-20 rounded-full" />
                      <SkeletonBlock className="h-6 w-full rounded-xl" />
                      <SkeletonBlock className="h-4 w-24 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          </div>

          <div className="space-y-3 border-t border-white/10 px-6 py-5">
            <p className="text-xs uppercase tracking-[0.3em] text-orange-300/80">Cargando</p>
            <h2 className="text-2xl font-semibold text-white">{title}</h2>
            <p className="max-w-2xl text-sm leading-7 text-slate-400">{message}</p>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <section className="relative min-h-[620px] overflow-hidden rounded-[36px] border border-white/10 bg-[#111111]">
        <SkeletonBlock className="absolute inset-0" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,8,0.94)_0%,rgba(8,8,8,0.66)_40%,rgba(8,8,8,0.2)_100%)]" />
        <div className="relative flex min-h-[620px] flex-col justify-end px-6 pb-8 pt-16 sm:px-8 lg:px-10">
          <div className="max-w-3xl space-y-5">
            <div className="flex flex-wrap gap-2">
              <SkeletonBlock className="h-8 w-24 rounded-full" />
              <SkeletonBlock className="h-8 w-28 rounded-full" />
              <SkeletonBlock className="h-8 w-24 rounded-full" />
            </div>

            <div className="space-y-3">
              <SkeletonBlock className="h-14 w-full max-w-2xl rounded-3xl" />
              <SkeletonBlock className="h-5 w-full max-w-xl rounded-full" />
            </div>

            <div className="space-y-2">
              <SkeletonBlock className="h-4 w-full max-w-2xl rounded-full" />
              <SkeletonBlock className="h-4 w-full max-w-xl rounded-full" />
              <SkeletonBlock className="h-4 w-full max-w-lg rounded-full" />
            </div>

            <div className="flex flex-wrap gap-2">
              <SkeletonBlock className="h-9 w-20 rounded-full" />
              <SkeletonBlock className="h-9 w-20 rounded-full" />
              <SkeletonBlock className="h-9 w-24 rounded-full" />
            </div>

            <div className="flex flex-wrap gap-3">
              <SkeletonBlock className="h-12 w-36 rounded-2xl" />
              <SkeletonBlock className="h-12 w-36 rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="space-y-2">
          <SkeletonBlock className="h-4 w-28 rounded-full" />
          <SkeletonBlock className="h-10 w-56 rounded-2xl" />
        </div>

        <div className="hide-scrollbar overflow-hidden">
          <div className="flex gap-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="w-[210px] shrink-0 space-y-3">
                <SkeletonBlock className="aspect-[2/3] w-full rounded-[24px]" />
                <SkeletonBlock className="h-6 w-full rounded-xl" />
                <SkeletonBlock className="h-4 w-24 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 rounded-[28px] border border-white/10 bg-white/[0.03] px-6 py-5">
          <p className="text-xs uppercase tracking-[0.3em] text-orange-300/80">Cargando</p>
          <h2 className="text-2xl font-semibold text-white">{title}</h2>
          <p className="max-w-2xl text-sm leading-7 text-slate-400">{message}</p>
        </div>
      </section>
    </div>
  )
}

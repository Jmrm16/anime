import { NavLink, Outlet } from 'react-router-dom'
import { animeClientConfig, animeProviderLabels } from '../config/anime'
import { getHostname } from '../lib/format'

function getNavClass(isActive: boolean): string {
  return isActive
    ? 'text-white'
    : 'text-slate-400 transition hover:text-slate-200'
}

export function AppLayout() {
  const baseUrlHost = getHostname(animeClientConfig.baseUrl)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-100">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#101010]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <NavLink to="/" className="flex items-center gap-2 text-[28px] font-semibold">
              <span className="text-orange-400">C</span>
              <span className="text-white">AnimeNow</span>
            </NavLink>

            <nav className="hidden items-center gap-8 text-[15px] md:flex">
              <NavLink to="/" end className={({ isActive }) => getNavClass(isActive)}>
                Inicio
              </NavLink>
              <NavLink to="/search" className={({ isActive }) => getNavClass(isActive)}>
                Explorar
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <NavLink
              to="/search"
              className="rounded-full border border-white/10 px-4 py-2 text-slate-300 transition hover:border-orange-400/30 hover:text-white"
            >
              Buscar
            </NavLink>
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-74px)] max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <footer className="border-t border-white/10 bg-[#0d0d0d]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-sm text-slate-400 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>
            Provider activo: {animeProviderLabels[animeClientConfig.provider]}{' '}
            {animeClientConfig.provider === 'demo' ? '(local)' : `(${baseUrlHost})`}
          </p>
          <p>
            Embeds externos: {animeClientConfig.allowExternalEmbeds ? 'habilitados' : 'bloqueados'}
          </p>
        </div>
      </footer>
    </div>
  )
}

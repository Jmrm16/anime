import { Link } from 'react-router-dom'
import { StatePanel } from '../components/StatePanel'

export function NotFoundPage() {
  return (
    <StatePanel
      title="Pagina no encontrada"
      message="La ruta que abriste no existe dentro de esta app. Regresa al inicio o vuelve a ejecutar una busqueda."
      action={
        <Link
          to="/"
          className="rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          Volver al inicio
        </Link>
      }
    />
  )
}

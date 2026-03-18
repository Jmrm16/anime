import type { ReactNode } from 'react'

interface StatePanelProps {
  title: string
  message: string
  action?: ReactNode
}

export function StatePanel({ title, message, action }: StatePanelProps) {
  return (
    <div className="panel px-6 py-10 text-center">
      <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Estado</p>
      <h2 className="mt-3 text-2xl font-semibold text-white">{title}</h2>
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300">{message}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  )
}

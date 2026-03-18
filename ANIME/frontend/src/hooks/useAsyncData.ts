import { DependencyList, useEffect, useState } from 'react'

interface AsyncState<T> {
  data: T | null
  error: string | null
  loading: boolean
}

interface AsyncOptions {
  enabled?: boolean
  resetOnLoad?: boolean
  minimumDelayMs?: number
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'No fue posible completar la solicitud.'
}

export function useAsyncData<T>(
  deps: DependencyList,
  load: (signal: AbortSignal) => Promise<T>,
  options?: AsyncOptions,
): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    loading: Boolean(options?.enabled ?? true),
  })

  useEffect(() => {
    if (options?.enabled === false) {
      setState({
        data: null,
        error: null,
        loading: false,
      })

      return
    }

    const controller = new AbortController()
    let cancelled = false
    const startedAt = Date.now()
    const minimumDelayMs = options?.minimumDelayMs ?? 0

    setState((current) => ({
      data: options?.resetOnLoad ? null : current.data,
      error: null,
      loading: true,
    }))

    const settle = (nextState: AsyncState<T>) => {
      const elapsed = Date.now() - startedAt
      const waitTime = Math.max(0, minimumDelayMs - elapsed)

      window.setTimeout(() => {
        if (cancelled || controller.signal.aborted) {
          return
        }

        setState(nextState)
      }, waitTime)
    }

    load(controller.signal)
      .then((data) => {
        if (cancelled || controller.signal.aborted) {
          return
        }

        settle({
          data,
          error: null,
          loading: false,
        })
      })
      .catch((error: unknown) => {
        if (cancelled || controller.signal.aborted) {
          return
        }

        settle({
          data: null,
          error: getErrorMessage(error),
          loading: false,
        })
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, deps)

  return state
}

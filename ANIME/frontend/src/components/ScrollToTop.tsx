import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

function forceScrollTop() {
  window.scrollTo(0, 0)
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
  document.querySelector('main')?.scrollTo(0, 0)
}

export function ScrollToTop() {
  const location = useLocation()

  useLayoutEffect(() => {
    forceScrollTop()

    const rafId = window.requestAnimationFrame(() => {
      forceScrollTop()
    })

    const timeoutId = window.setTimeout(() => {
      forceScrollTop()
    }, 80)

    return () => {
      window.cancelAnimationFrame(rafId)
      window.clearTimeout(timeoutId)
    }
  }, [location.key, location.pathname, location.search, location.hash])

  return null
}

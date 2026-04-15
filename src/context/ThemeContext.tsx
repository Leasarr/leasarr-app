'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark' | 'system'

const ThemeContext = createContext<{
  theme: Theme
  setTheme: (t: Theme) => void
}>({ theme: 'system', setTheme: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')

  useEffect(() => {
    const stored = localStorage.getItem('leasarr-theme') as Theme | null
    if (stored) setThemeState(stored)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    const applyDark = () => root.classList.add('dark')
    const applyLight = () => root.classList.remove('dark')

    if (theme === 'dark') {
      applyDark()
    } else if (theme === 'light') {
      applyLight()
    } else {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      mq.matches ? applyDark() : applyLight()
      const handler = (e: MediaQueryListEvent) => e.matches ? applyDark() : applyLight()
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [theme])

  const setTheme = (t: Theme) => {
    setThemeState(t)
    localStorage.setItem('leasarr-theme', t)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)

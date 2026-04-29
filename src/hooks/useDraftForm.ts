'use client'

import { useEffect, useRef, useState } from 'react'
import type { UseFormReturn, FieldValues } from 'react-hook-form'

/**
 * Persists react-hook-form draft state to sessionStorage.
 * Draft is restored on mount and cleared when clearDraft() is called (e.g. on submit).
 *
 * Usage:
 *   const form = useForm<MySchema>({ ... })
 *   const { clearDraft, hasDraft } = useDraftForm(form, 'create-lease')
 *   // In onSubmit: clearDraft()
 *   // In modal titleAction: hasDraft && <button onClick={clearDraft}>Start fresh</button>
 */
export function useDraftForm<T extends FieldValues>(
  form: UseFormReturn<T>,
  key: string
) {
  const storageKey = `draft:${key}`
  const restored = useRef(false)
  const [hasDraft, setHasDraft] = useState(() => {
    try { return !!sessionStorage.getItem(storageKey) } catch { return false }
  })

  useEffect(() => {
    if (restored.current) return
    restored.current = true
    try {
      const raw = sessionStorage.getItem(storageKey)
      if (raw) form.reset(JSON.parse(raw), { keepDefaultValues: true })
    } catch {}
  }, [])

  useEffect(() => {
    const sub = form.watch((values) => {
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(values))
        setHasDraft(true)
      } catch {}
    })
    return () => sub.unsubscribe()
  }, [form, storageKey])

  function clearDraft() {
    try { sessionStorage.removeItem(storageKey) } catch {}
    setHasDraft(false)
    form.reset()
  }

  return { clearDraft, hasDraft }
}

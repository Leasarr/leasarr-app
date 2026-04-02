import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // In mock auth mode the Supabase client is never actually called.
  // Return a typed stub so imports don't throw when env vars are empty.
  if (!url || !key) {
    return {} as ReturnType<typeof createBrowserClient>
  }

  return createBrowserClient(url, key)
}

export const supabase = createClient()

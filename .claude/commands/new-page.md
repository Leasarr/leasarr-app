Scaffold a new app page following Leasarr conventions.

## Arguments
`$ARGUMENTS` format: `<route> <PageTitle> <role>`
- `<route>` — the Next.js path, e.g. `/reports/analytics` or `/portal/documents`
- `<PageTitle>` — the human-readable title shown in the PageHeader, e.g. `Analytics`
- `<role>` — `manager` or `tenant` (determines which portal the page lives under)

Example: `/reports/analytics Analytics manager`

If any argument is missing, ask before proceeding.

## What to create

Create `src/app<route>/page.tsx` with this exact structure — do not deviate from it:

```tsx
'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { LoadingState } from '@/components/patterns/LoadingState'
import { EmptyState } from '@/components/patterns/EmptyState'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'

export default function <PageTitle>Page() {
  const { profile } = useAuth()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      // TODO: replace with real query
      setLoading(false)
    }
    load()
  }, [])

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <PageHeader title="<PageTitle>" />

        {loading ? (
          <LoadingState size="page" />
        ) : items.length === 0 ? (
          <EmptyState
            icon="inbox"
            title="Nothing here yet"
            size="page"
          />
        ) : (
          <div>
            {/* TODO: render items */}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
```

Substitute the actual page title and infer the type from the route. Use `EmptyState` icon that makes sense for the content (e.g. `description` for documents, `bar_chart` for analytics, `payment` for payments).

## After creating the file

1. Tell the user the file path.
2. Tell them what Supabase table/query they'll likely need (infer from the route name).
3. Remind them to add the route to the **Routes** table in `.claude/rules/architecture.md` if it's a new section.
4. Do NOT add the route to the architecture.md automatically — they may want to test it first.

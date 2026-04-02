# CLAUDE.md

Leasarr — property management SaaS. Next.js 14 App Router, TypeScript, Tailwind (Material You), Supabase.

Component rules in `.claude/rules/`:

| File | Loads | Covers |
|---|---|---|
| `commands.md` | always | npm scripts |
| `architecture.md` | always | routes, key files, current state |
| `conventions.md` | always | utilities, naming, page/form patterns |
| `design-system.md` | UI files | colors, fonts, icons, shadows, CSS utilities |
| `data-layer.md` | data/lib/supabase files | mock data, types, Supabase clients, env vars |
| `auth.md` | auth files | mock vs real auth, AuthContext, middleware rules |

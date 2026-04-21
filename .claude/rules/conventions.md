# Conventions

## Utilities (`src/lib/utils.ts`)

Always use these helpers — don't reimplement them:

| Function | Use |
|---|---|
| `cn(...classes)` | Conditional className composition (clsx + tailwind-merge). Use whenever merging Tailwind classes. |
| `formatCurrency(amount, compact?)` | `Intl.NumberFormat` currency display |
| `formatDate(date, fmt?)` | date-fns wrapper, default `'MMM d, yyyy'` |
| `formatRelative(date)` | Relative time string ("2 hours ago") |
| `getDaysUntil(date)` | Days between date and today |
| `getInitials(name)` | First two initials from full name |
| `getStatusColor(status)` | Returns `bg-* text-*` Tailwind classes for status chips |
| `getPriorityColor(priority)` | Returns `bg-* text-*` for priority badges |
| `getPriorityBorderColor(priority)` | Returns `border-l-*` for left-border priority accent |

## Naming

- Components: PascalCase (`AppLayout`)
- Utilities/functions: camelCase (`formatCurrency`)
- Types/Interfaces: PascalCase (`Property`, `Tenant`)
- CSS utilities: kebab-case (`btn-primary`, `input-base`)
- Constants: SCREAMING_SNAKE_CASE (`MANAGER_NAV_ITEMS`)

## Page structure

- Mark pages `'use client'` (all pages are client-rendered)
- Wrap page content in `<AppLayout>`
- Local UI state: `useState`. No global state needed yet (zustand is installed but unused).
- Client-side filtering: `useState` + `.filter()` — no server calls for search/filter yet

## Forms

- Currently: plain `useState` + controlled inputs; submit via `onSubmit` + `e.preventDefault()`; inline error state via `useState`
- **Pre-MVP plan**: migrate all forms to `react-hook-form` + `zod` validation (both packages are installed)
- Inputs use `.input-base` class; no icons inside input fields
- Labels above inputs; error messages below

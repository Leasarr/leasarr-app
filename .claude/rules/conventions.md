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

## Mobile patterns

- **Tab bars**: use `grid grid-cols-N` — never `flex overflow-x-auto` with `flex-1` children (causes page-level overflow). Use `whitespace-nowrap` on tab buttons.
- **Master-detail on mobile**: when a detail panel is open alongside a list (e.g. `lg:grid-cols-12`), hide the list on mobile with `hidden lg:block` and show a `lg:hidden` back button in the detail panel. See `/people` Tenants tab.
- **Row text**: prefer wrapping over truncating — use `flex-wrap` on badge rows, no `truncate` on name/body text. Keep `flex-shrink-0` on avatars, badges, and chevrons.
- **Never hardcode `bg-white`** for cards — use `bg-surface-container-lowest` so dark mode works.

## Component library

A shared component library lives under `src/components/`. Always use these — don't re-implement the pattern inline.

### `src/components/ui/` — primitives

| Component | Import | When to use |
|---|---|---|
| `<Button>` | `@/components/ui/Button` | All interactive buttons. Variants: `primary` (default), `secondary`, `ghost`, `chip`, `destructive`. Sizes: `sm`, `md` (default), `lg`. Non-chip variants enforce `min-h-[44px]` WCAG touch target. |
| `<Badge>` | `@/components/ui/Badge` | Status/label pills. Variants: `primary`, `secondary`, `tertiary`, `neutral`, `success`, `warning`, `error`. |
| `<SegmentedControl>` | `@/components/ui/SegmentedControl` | In-page view toggles (e.g. Active/History, Units/Applications). Props: `options` (`{ key, label, icon? }[]`), `value`, `onChange`, `className?`. |
| `<TabBar>` | `@/components/ui/TabBar` | Page-level navigation tabs with underline indicator. Props: `tabs` (`{ key, label, count? }[]`), `value`, `onChange`, `className?`. |
| `<StatusDot>` | `@/components/ui/StatusDot` | Semantic status indicator dot using design tokens. Props: `status` (`'occupied' \| 'vacant' \| 'maintenance'`), `className?`. |
| `<ConfirmModal>` | `@/components/ui/ConfirmModal` | Confirmation dialog for destructive actions. Props: `open`, `onClose`, `title`, `body?`, `confirmLabel?`, `onConfirm`, `loading?`, `destructive?`. |
| `<Card>` | `@/components/ui/Card` | Surface container. Props: `padding` (`sm`=p-4, `md`=p-6 default, `lg`=p-8), `radius` (`sm`=rounded-xl default, `md`=rounded-2xl), `surface` (`lowest` default, `low`), `shadow` (default true). |

### `src/components/patterns/` — molecules

| Component | Import | When to use |
|---|---|---|
| `<EmptyState>` | `@/components/patterns/EmptyState` | No-data states. Props: `icon` (Material Symbol name), `title`, `description?`, `action?` (JSX), `size` (`page` = min-h-[60vh], `panel` = min-h-[40vh], `inline` = py-12). |
| `<LoadingState>` | `@/components/patterns/LoadingState` | Data-loading placeholder. Props: `label?`, `size` (`page` default, `panel`). Uses `progress_activity` + `animate-spin`. |
| `<FormField>` | `@/components/patterns/FormField` | Label + input/select/textarea wrapper. Props: `label`, `hint?`, `error?`, `optional?`, `className?`, `children`. Pass `className="col-span-2"` for full-width grid fields. |
| `<StatCard>` | `@/components/patterns/StatCard` | KPI metric card. Props: `icon`, `iconColor?`, `label`, `value`, `valueColor?`, `badge?`, `subtitle?`, `progress?` (`{ value, color? }`). |
| `<ListRow>` | `@/components/patterns/ListRow` | Avatar + title + subtitle row button. Props: `avatar` (JSX), `title`, `subtitle?`, `meta?` (JSX for third line), `titleBadges?` (JSX), `trailing?` (JSX), `selected?`, `onClick?`, `padding?` (`sm`=px-4 py-4, `md`=p-5 default). |

### `src/components/layout/` — organisms

| Component | Import | When to use |
|---|---|---|
| `<PageHeader>` | `@/components/layout/PageHeader` | Page-level titles. Props: `title`, `eyebrow?`, `subtitle?`, `action?` (JSX for right-side button/control). |
| `<SectionHeader>` | `@/components/layout/SectionHeader` | Section-level title with optional right action. Props: `title`, `action?` (JSX), `className?`. |
| `<MasterDetail>` | `@/components/layout/MasterDetail` | Two-panel `lg:grid-cols-12` split (5/7). Props: `list` (JSX), `detail?` (JSX), `mobileBackLabel?` (activates mobile hide + back button), `onBack?`, `align?` (`stretch` default, `start`). |

### Shared constants

| File | Export | Use |
|---|---|---|
| `src/lib/notificationMeta.ts` | `NOTIFICATION_TYPE_META` | Notification icon/color metadata. Keys: `managerHref`, `portalHref`. Import here — never redefine locally. |

## Forms

- Currently: plain `useState` + controlled inputs; submit via `onSubmit` + `e.preventDefault()`; inline error state via `useState`
- **Pre-MVP plan**: migrate all forms to `react-hook-form` + `zod` validation (both packages are installed)
- Inputs use `.input-base` class; no icons inside input fields
- Labels use `.label-base` class (`text-sm font-semibold text-on-surface mb-1.5`); error messages below
- For destructive actions (delete, irreversible operations), always use `<ConfirmModal>` — never inline confirm/cancel buttons

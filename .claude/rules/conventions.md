# Conventions

## Utilities (`src/lib/utils.ts`)

| Function | Use |
|---|---|
| `cn(...classes)` | className composition (clsx + tailwind-merge) |
| `formatCurrency(amount, compact?)` | Currency display |
| `formatDate(date, fmt?)` | date-fns, default `'MMM d, yyyy'` |
| `formatRelative(date)` | "2 hours ago" |
| `getDaysUntil(date)` | Days until date |
| `getInitials(name)` | Two initials |
| `getStatusColor(status)` | `bg-* text-*` for status chips |
| `getPriorityColor(priority)` | `bg-* text-*` for priority badges |
| `getPriorityBorderColor(priority)` | `border-l-*` for priority accent |

## Naming

Components/Types: PascalCase · Functions: camelCase · CSS utilities: kebab-case · Constants: SCREAMING_SNAKE_CASE

## Page structure

- All pages: `'use client'`, wrapped in `<AppLayout>`
- State: `useState`. Filtering: `useState` + `.filter()` (no server calls).

## Mobile patterns

- **Tab bars**: `grid grid-cols-N` — never `flex overflow-x-auto` with `flex-1` children.
- **Master-detail**: hide list with `hidden lg:block`; show `lg:hidden` back button in detail panel.
- **Row text**: wrap don't truncate — `flex-wrap` on badge rows; `flex-shrink-0` on avatars/badges/chevrons.
- **Cards**: never `bg-white` — use `bg-surface-container-lowest`.

## Components (`src/components/`)

Always use — don't reimplement inline.

### UI primitives

| Component | Variants / Props |
|---|---|
| `<Button>` (`ui/Button`) | variants: `primary` `secondary` `ghost` `chip` `destructive`; sizes: `sm` `md` `lg`; non-chip: `min-h-[44px]` |
| `<Badge>` (`ui/Badge`) | variants: `primary` `secondary` `tertiary` `neutral` `success` `warning` `error` |
| `<Card>` (`ui/Card`) | `padding` sm/md/lg; `radius` sm/md; `surface` lowest/low; `shadow` |
| `<SegmentedControl>` (`ui/SegmentedControl`) | In-page view toggle; `options` (`{key,label,icon?}[]`), `value`, `onChange` |
| `<TabBar>` (`ui/TabBar`) | Page-level tabs + underline; `tabs` (`{key,label,count?}[]`), `value`, `onChange` |
| `<StatusDot>` (`ui/StatusDot`) | `status`: `occupied` `vacant` `maintenance` |
| `<ConfirmModal>` (`ui/ConfirmModal`) | `open`, `onClose`, `title`, `body?`, `confirmLabel?`, `onConfirm`, `loading?`, `destructive?` |
| `<ImageUpload>` (`ui/ImageUpload`) | Single image upload; `value`, `onChange(url\|null)`, `bucket`, `path`, `shape`: square/circle, `height`, `className`; compresses to 1200px JPEG; mock-safe |
| `<ImageUploadMultiple>` (`ui/ImageUploadMultiple`) | Multi-image upload grid; `value: string[]`, `onChange(urls)`, `bucket`, `path`, `max` (default 5); compresses each; mock-safe |

### Patterns

| Component | Props |
|---|---|
| `<EmptyState>` (`patterns/EmptyState`) | `icon`, `title`, `description?`, `action?`, `size`: page/panel/inline |
| `<LoadingState>` (`patterns/LoadingState`) | `label?`, `size`: page/panel |
| `<FormField>` (`patterns/FormField`) | `label`, `hint?`, `error?`, `optional?`; layout wrapper only |
| `<StatCard>` (`patterns/StatCard`) | `icon`, `iconColor?`, `label`, `value`, `valueColor?`, `badge?`, `subtitle?`, `progress?` |
| `<ListRow>` (`patterns/ListRow`) | `avatar`, `title`, `subtitle?`, `meta?`, `titleBadges?`, `trailing?`, `selected?`, `onClick?`, `padding?` |

### Layout

| Component | Props |
|---|---|
| `<PageHeader>` (`layout/PageHeader`) | `title`, `eyebrow?`, `subtitle?`, `action?` |
| `<SectionHeader>` (`layout/SectionHeader`) | `title`, `action?`, `className?` |
| `<MasterDetail>` (`layout/MasterDetail`) | `list`, `detail?`, `mobileBackLabel?`, `onBack?`, `align?` |

## Forms

- Plain `useState` + controlled inputs. Pre-MVP: migrate to `react-hook-form` + `zod` (both installed).
- Inputs: `.input-base`; labels: `.label-base`. Destructive actions: always `<ConfirmModal>`.

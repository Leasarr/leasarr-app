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

All forms use `react-hook-form` + `zod`. Migration is complete across all pages.

### Schema files (`src/lib/schemas/`)

One file per domain. Always import the schema and its inferred type together:

| File | Exports |
|---|---|
| `auth.ts` | `loginSchema`, `registerSchema`, `resetPasswordSchema`, `updatePasswordSchema` |
| `people.ts` | `teamMemberSchema`, `vendorSchema`, `tenantSchema`, `editTenantSchema` |
| `property.ts` | `unitSchema`, `propertySchema` |
| `payment.ts` | `editPaymentSchema`, `recordPaymentSchema` |
| `maintenance.ts` | `tenantMaintenanceSchema`, `managerMaintenanceSchema` |
| `lease.ts` | `createLeaseSchema`, `editLeaseSchema` |

### Standard form pattern

```tsx
const form = useForm<MyForm>({
  resolver: zodResolver(mySchema),
  defaultValues: { field: '' },
})

// Field errors
<input {...form.register('field')} className="input-base" />
{form.formState.errors.field && <p className="text-error text-xs mt-1">{form.formState.errors.field.message}</p>}

// Submit button
<Button type="submit" disabled={form.formState.isSubmitting}>
  {form.formState.isSubmitting ? 'Saving...' : 'Save'}
</Button>

// Server/DB errors — keep as separate useState, distinct from field errors
const [serverError, setServerError] = useState('')
```

### Edit modals — pre-populate on open

```tsx
function openEdit(record: Row) {
  form.reset({ field: record.field, ... })
  setShowEdit(true)
}
// Modal onClose:
form.reset()
```

### Non-native inputs (`ImageUpload`, `ImageUploadMultiple`, button toggles)

Use `Controller` for components that aren't `<input>` elements:

```tsx
<Controller
  control={form.control}
  name="image_url"
  render={({ field }) => (
    <ImageUpload value={field.value ?? null} onChange={field.onChange} ... />
  )}
/>
```

For button-group selects (category, priority): use `watch` + `setValue` — no `register`:

```tsx
const category = form.watch('category')
<button onClick={() => form.setValue('category', cat)} ...>{cat}</button>
```

### Cascading dropdowns

For selects that update multiple fields on change (e.g. tenant → property → unit → rent), use `watch` to read the current value for rendering and call `setValue` for all updates. Do not use `register` on these selects:

```tsx
const tenantId = form.watch('tenant_id')

function handleTenantChange(id: string) {
  form.setValue('tenant_id', id)
  form.setValue('property_id', tenant?.property_id ?? '')
  form.setValue('unit_id', tenant?.unit_id ?? '')
}
```

### Sub-components that own a form

When a modal sub-component needs to work for both Add and Edit (e.g. `AddPropertyModal`), move `useForm` inside the component. Accept `defaultValues?` and `onSubmit(data) => Promise<string | null>` as props. Reset on open via `useEffect`:

```tsx
useEffect(() => {
  if (open) form.reset(defaultValues ?? EMPTY_DEFAULTS)
}, [open])
```

The `onSubmit` callback returns `null` on success or an error string on failure — the modal shows it as `serverError`.

### Other rules
- Inputs: `.input-base`. Destructive actions: always `<ConfirmModal>`.
- Numeric fields use `z.string()` in schemas and are parsed (`parseFloat`/`parseInt`) in `onSubmit`.
- Multiple forms on one page: use named instances (`addUnitForm`, `editUnitForm`) rather than destructuring.

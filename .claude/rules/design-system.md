---
paths:
  - "src/app/**/*.tsx"
  - "src/components/**/*.tsx"
  - "src/app/globals.css"
  - "tailwind.config.ts"
---

# Design System

Material You design tokens via Tailwind. See `tailwind.config.ts`.

## Fonts

- **Manrope** — headings, CSS var `--font-manrope`, Tailwind class `font-headline`
- **Inter** — body/labels, CSS var `--font-inter`, Tailwind class `font-body`

## Color tokens

- Primary: `primary` (#003d9b), `on-primary`, `primary-container`, `on-primary-container`
- Secondary: `secondary` (#525f73), with container variants
- Tertiary: `tertiary` (#7b2600), with container variants
- Error: `error` (#ba1a1a), `error-container`
- Surface: `surface` (#f8f9fa), `surface-container-lowest/low/DEFAULT/high/highest`
- Outline: `outline`, `outline-variant`

## Border radius

Cards/modals favor `rounded-xl` (1rem) and `rounded-2xl` (1.25rem). Tokens go up to `rounded-4xl` (2rem).

## Shadows

Use custom shadow tokens instead of Tailwind defaults:
- `shadow-card` — cards and list items
- `shadow-modal` — modals and popovers
- `shadow-nav` — mobile bottom nav
- `shadow-fab` — FABs
- `shadow-primary` — primary-colored elevated elements

## Icons

Use **Material Symbols** — loaded from Google Fonts, not a package.

```tsx
// Outlined (default):
<span className="material-symbols-outlined">home</span>

// Filled (active states):
<span className="material-symbols-filled">home</span>
```

Icon names are snake_case strings from the Material Symbols library. Do NOT use lucide-react or other icon packages for UI icons.

## Global CSS utilities (`globals.css`)

Use these classes rather than re-implementing them with Tailwind:

| Class | Use |
|---|---|
| `.btn-primary` | Primary CTA button (uses `primary-gradient`) |
| `.btn-secondary` | Secondary/ghost button |
| `.input-base` | All text inputs and selects |
| `.badge` | Status/label pills |
| `.glass` / `.glass-dark` | Backdrop-blur card effects |
| `.no-scrollbar` | Hide scrollbar on overflow containers |
| `.primary-gradient` | `linear-gradient(135deg, #003d9b → #0052cc)` |

## Layout patterns

- Pages use `max-w-5xl` or `max-w-7xl` centered with `mx-auto`
- Consistent padding: `px-4 md:px-8`, `py-8`
- Asymmetric grids: `lg:grid-cols-12` with e.g. `lg:col-span-5` / `lg:col-span-7`
- Mobile-first: vertical stack → grid at `lg:`

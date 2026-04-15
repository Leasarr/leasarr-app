---
paths:
  - "src/app/**/*.tsx"
  - "src/components/**/*.tsx"
  - "src/app/globals.css"
  - "tailwind.config.ts"
---

# Design System

Material You design tokens via Tailwind. See `tailwind.config.ts`.

## Dark mode

The app supports `light`, `dark`, and `system` themes via `ThemeContext`. The `dark` class on `<html>` activates dark mode.

All Tailwind color tokens are driven by CSS variables defined in `globals.css`:
- `:root` — light mode values
- `.dark` — dark mode values

**Never hardcode hex colors** for anything using a design token. Use Tailwind utilities (`bg-surface`, `text-primary`, etc.) and let the CSS variables do the switching.

### Active state rule

When placing text on a `bg-primary-fixed` surface (e.g. active nav items, selected filter pills), always use `text-on-primary-fixed` — **not** `text-primary`. In dark mode `primary` becomes light blue, creating near-zero contrast on the also-light `primary-fixed` background. `on-primary-fixed` is guaranteed dark in both modes.

```tsx
// Correct
isActive ? 'bg-primary-fixed text-on-primary-fixed' : 'text-on-surface-variant hover:bg-surface-container'

// Wrong — text-primary is invisible in dark mode on primary-fixed
isActive ? 'bg-primary-fixed text-primary' : ...
```

## Fonts

- **Manrope** — headings, CSS var `--font-manrope`, Tailwind class `font-headline`
- **Inter** — body/labels, CSS var `--font-inter`, Tailwind class `font-body`

## Color tokens

- Primary: `primary`, `on-primary`, `primary-container`, `on-primary-container`
- Primary fixed: `primary-fixed`, `primary-fixed-dim`, `on-primary-fixed`, `on-primary-fixed-variant`
- Secondary: `secondary`, `on-secondary`, `secondary-container`, `on-secondary-container`
- Tertiary: `tertiary`, `on-tertiary`, `tertiary-container`, `on-tertiary-container`
- Error: `error`, `on-error`, `error-container`, `on-error-container`
- Surface: `surface`, `surface-container-lowest/low/DEFAULT/high/highest`, `on-surface`, `on-surface-variant`
- Outline: `outline`, `outline-variant`

Light mode values are listed in `tailwind.config.ts` comments; dark values are in `globals.css` under `.dark`.

## Border radius

Cards/modals favor `rounded-xl` (1rem) and `rounded-2xl` (1.25rem). Tokens go up to `rounded-4xl` (2rem).

## Shadows

Use custom shadow tokens instead of Tailwind defaults:
- `shadow-card` — cards and list items
- `shadow-modal` — modals and popovers
- `shadow-nav` — mobile bottom nav
- `shadow-fab` — FABs
- `shadow-primary` — primary-colored elevated elements (adapts color in dark mode via CSS variable)

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
| `.glass` / `.glass-dark` | Backdrop-blur card effects (dark variants included) |
| `.no-scrollbar` | Hide scrollbar on overflow containers |
| `.primary-gradient` | Gradient using primary CSS variables — adapts in dark mode |

## Layout patterns

- Pages use `max-w-5xl` or `max-w-7xl` centered with `mx-auto`
- Consistent padding: `px-4 md:px-8`, `py-8`
- Asymmetric grids: `lg:grid-cols-12` with e.g. `lg:col-span-5` / `lg:col-span-7`
- Mobile-first: vertical stack → grid at `lg:`

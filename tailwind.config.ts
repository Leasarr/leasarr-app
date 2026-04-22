import type { Config } from 'tailwindcss'

const v = (name: string) => `rgb(var(--color-${name}) / <alpha-value>)`

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Material You tokens — driven by CSS variables in globals.css
        primary: v('primary'),
        'on-primary': v('on-primary'),
        'primary-container': v('primary-container'),
        'on-primary-container': v('on-primary-container'),
        'primary-fixed': v('primary-fixed'),
        'primary-fixed-dim': v('primary-fixed-dim'),
        'on-primary-fixed': v('on-primary-fixed'),
        'on-primary-fixed-variant': v('on-primary-fixed-variant'),
        'inverse-primary': v('inverse-primary'),

        secondary: v('secondary'),
        'on-secondary': v('on-secondary'),
        'secondary-container': v('secondary-container'),
        'on-secondary-container': v('on-secondary-container'),
        'secondary-fixed': v('secondary-fixed'),
        'secondary-fixed-dim': v('secondary-fixed-dim'),
        'on-secondary-fixed': v('on-secondary-fixed'),
        'on-secondary-fixed-variant': v('on-secondary-fixed-variant'),

        tertiary: v('tertiary'),
        'on-tertiary': v('on-tertiary'),
        'tertiary-container': v('tertiary-container'),
        'on-tertiary-container': v('on-tertiary-container'),
        'tertiary-fixed': v('tertiary-fixed'),
        'tertiary-fixed-dim': v('tertiary-fixed-dim'),
        'on-tertiary-fixed': v('on-tertiary-fixed'),
        'on-tertiary-fixed-variant': v('on-tertiary-fixed-variant'),

        error: v('error'),
        'on-error': v('on-error'),
        'error-container': v('error-container'),
        'on-error-container': v('on-error-container'),

        success: v('success'),
        'on-success': v('on-success'),
        'success-container': v('success-container'),
        'on-success-container': v('on-success-container'),

        warning: v('warning'),
        'on-warning': v('on-warning'),
        'warning-container': v('warning-container'),
        'on-warning-container': v('on-warning-container'),

        background: v('background'),
        'on-background': v('on-background'),
        surface: v('surface'),
        'on-surface': v('on-surface'),
        'surface-variant': v('surface-variant'),
        'on-surface-variant': v('on-surface-variant'),
        'surface-dim': v('surface-dim'),
        'surface-bright': v('surface-bright'),
        'surface-container-lowest': v('surface-container-lowest'),
        'surface-container-low': v('surface-container-low'),
        'surface-container': v('surface-container'),
        'surface-container-high': v('surface-container-high'),
        'surface-container-highest': v('surface-container-highest'),
        'surface-tint': v('surface-tint'),
        'inverse-surface': v('inverse-surface'),
        'inverse-on-surface': v('inverse-on-surface'),

        outline: v('outline'),
        'outline-variant': v('outline-variant'),
      },
      fontFamily: {
        headline: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        label: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        full: '9999px',
      },
      boxShadow: {
        card: '0 2px 12px rgba(25,28,29,0.06)',
        modal: '0 8px 32px rgba(25,28,29,0.12)',
        nav: '0 -8px 24px rgba(25,28,29,0.06)',
        fab: 'var(--shadow-fab)',
        primary: 'var(--shadow-primary)',
      },
      animation: {
        'bounce-dot': 'bounce 1s infinite',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { transform: 'translateY(8px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

export default config

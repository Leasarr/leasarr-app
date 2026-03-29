import type { Config } from 'tailwindcss'

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
        // Material You tokens — exact from designs
        primary: '#003d9b',
        'on-primary': '#ffffff',
        'primary-container': '#0052cc',
        'on-primary-container': '#c4d2ff',
        'primary-fixed': '#dae2ff',
        'primary-fixed-dim': '#b2c5ff',
        'on-primary-fixed': '#001848',
        'on-primary-fixed-variant': '#0040a2',
        'inverse-primary': '#b2c5ff',

        secondary: '#525f73',
        'on-secondary': '#ffffff',
        'secondary-container': '#d6e3fb',
        'on-secondary-container': '#586579',
        'secondary-fixed': '#d6e3fb',
        'secondary-fixed-dim': '#bac7de',
        'on-secondary-fixed': '#0f1c2d',
        'on-secondary-fixed-variant': '#3b485a',

        tertiary: '#7b2600',
        'on-tertiary': '#ffffff',
        'tertiary-container': '#a33500',
        'on-tertiary-container': '#ffc6b2',
        'tertiary-fixed': '#ffdbcf',
        'tertiary-fixed-dim': '#ffb59b',
        'on-tertiary-fixed': '#380d00',
        'on-tertiary-fixed-variant': '#812800',

        error: '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',

        background: '#f8f9fa',
        'on-background': '#191c1d',
        surface: '#f8f9fa',
        'on-surface': '#191c1d',
        'surface-variant': '#e1e3e4',
        'on-surface-variant': '#434654',
        'surface-dim': '#d9dadb',
        'surface-bright': '#f8f9fa',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f3f4f5',
        'surface-container': '#edeeef',
        'surface-container-high': '#e7e8e9',
        'surface-container-highest': '#e1e3e4',
        'surface-tint': '#0c56d0',
        'inverse-surface': '#2e3132',
        'inverse-on-surface': '#f0f1f2',

        outline: '#737685',
        'outline-variant': '#c3c6d6',
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
        fab: '0 8px 24px rgba(0,61,155,0.25)',
        primary: '0 8px 24px rgba(0,61,155,0.2)',
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

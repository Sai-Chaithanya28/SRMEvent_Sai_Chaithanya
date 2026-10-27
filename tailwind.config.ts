/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: 'var(--color-brand-50, #eff6ff)',
          100: 'var(--color-brand-100, #dbeafe)',
          200: 'var(--color-brand-200, #bfdbfe)',
          300: 'var(--color-brand-300, #93c5fd)',
          400: 'var(--color-brand-400, #60a5fa)',
          500: 'var(--color-brand-500, #3b82f6)',
          600: 'var(--color-brand-600, #2563eb)',
          700: 'var(--color-brand-700, #1d4ed8)',
          800: 'var(--color-brand-800, #1e40af)',
          900: 'var(--color-brand-900, #1e3a8a)',
        },
        success: 'var(--color-success, #16a34a)',
        warning: 'var(--color-warning, #d97706)',
        danger: 'var(--color-danger, #dc2626)',
        surface: {
          DEFAULT: 'var(--color-surface, #ffffff)',
          muted: 'var(--color-surface-muted, #f1f5f9)',
          raised: 'var(--color-surface-raised, #ffffff)',
        },
      },
      fontFamily: {
        sans: ['var(--font-family, "Inter", system-ui, sans-serif)'],
      },
      borderRadius: {
        token: 'var(--radius, 0.5rem)',
      },
      boxShadow: {
        token: 'var(--shadow, 0 1px 3px 0 rgb(0 0 0 / 0.1))',
        'token-lg': 'var(--shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.1))',
      },
      spacing: {
        'target': '2.75rem', /* 44px */
      },
      screens: {
        'xs': '360px',
      },
    },
  },
  plugins: [],
};

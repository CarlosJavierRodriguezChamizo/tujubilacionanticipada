/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Navy sobrio y editorial (tomado de las ilustraciones de portada).
        // Es a la vez el color estructural y la acción principal.
        brand: {
          50: '#eef1f6',
          100: '#d5dae7',
          200: '#aab5cd',
          300: '#7d8caf',
          400: '#4f608a',
          500: '#364a78',
          600: '#26324e', // acción / navy principal
          700: '#20293f',
          800: '#1a2133',
          900: '#141826',
        },
        // Terracota / arcilla: el acento cálido de las ilustraciones.
        clay: {
          50: '#fbf1eb',
          100: '#f5ddd0',
          200: '#e9bca4',
          300: '#dd9a78',
          400: '#cf7b53',
          500: '#bb6038',
          600: '#a8542f', // acento principal
          700: '#8a4527',
          800: '#6f3821',
          900: '#5c301d',
        },
        // Papel / crema: fondos cálidos que evitan el blanco puro de "SaaS".
        paper: {
          DEFAULT: '#f6efe1',
          50: '#fdfbf6',
          100: '#f8f2e6',
          200: '#efe6d2',
          300: '#e3d6bb',
          400: '#d3c19c',
        },
        ink: {
          DEFAULT: '#20242c', // negro cálido
          soft: '#454b57',
          muted: '#6c7480',
        },
      },
      fontFamily: {
        // UI y cuerpo
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        // Títulos editoriales
        serif: ['Fraunces', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
      maxWidth: {
        prose: '68ch',
      },
      boxShadow: {
        // Sombras cálidas y suaves (no el gris azulado por defecto).
        card: '0 1px 2px rgba(38, 50, 78, 0.04), 0 8px 24px -12px rgba(38, 50, 78, 0.18)',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.ink.soft'),
            '--tw-prose-headings': theme('colors.ink.DEFAULT'),
            '--tw-prose-links': theme('colors.clay.700'),
            '--tw-prose-bold': theme('colors.ink.DEFAULT'),
            '--tw-prose-quotes': theme('colors.ink.soft'),
            '--tw-prose-quote-borders': theme('colors.clay.300'),
            '--tw-prose-counters': theme('colors.clay.600'),
            '--tw-prose-bullets': theme('colors.clay.300'),
            '--tw-prose-hr': theme('colors.paper.300'),
            maxWidth: '68ch',
            'h1, h2, h3, h4': {
              fontFamily: theme('fontFamily.serif').join(', '),
              fontWeight: '600',
              letterSpacing: '-0.01em',
            },
          },
        },
      }),
    },
  },
  plugins: [typography],
};

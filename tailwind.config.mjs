/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Azul sobrio de acción
        brand: {
          50: '#eef4fb',
          100: '#d8e6f6',
          200: '#b3cdec',
          300: '#84acdd',
          400: '#5587ca',
          500: '#3568b4',
          600: '#2a5396', // acción principal
          700: '#244781',
          800: '#1f3b69',
          900: '#1c3257',
        },
        ink: {
          DEFAULT: '#1a1d21',
          soft: '#3f454d',
          muted: '#6b7280',
        },
      },
      fontFamily: {
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
      },
      maxWidth: {
        prose: '68ch',
      },
      typography: () => ({
        DEFAULT: {
          css: {
            '--tw-prose-links': '#2a5396',
            maxWidth: '68ch',
          },
        },
      }),
    },
  },
  plugins: [typography],
};

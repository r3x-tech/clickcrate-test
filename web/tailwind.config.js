// const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
// const { join } = require('path');

// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [
//     join(
//       __dirname,
//       '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
//     ),
//     ...createGlobPatternsForDependencies(__dirname),
//   ],
//   theme: {
//     extend: {},
//   },
//   plugins: [require('daisyui')],
// };

const { join } = require('path');

module.exports = {
  content: [
    join(__dirname, 'src/**/*.{js,jsx,ts,tsx}'),
    join(__dirname, 'pages/**/*.{js,jsx,ts,tsx}'),
    join(__dirname, 'components/**/*.{js,jsx,ts,tsx}'),
    join(__dirname, 'app/**/*.{js,jsx,ts,tsx}'),
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0A5CFF',
        secondary: '#1F6AFF',
        tertiary: '#141414',
        quaternary: '#1C1C1C',
        black: '#000000',
        white: '#FFFFFF',
        gray: '#A0A0A0',
        lightGray: '#9ba3af',
        darkerGray: '#86868B',
        green: '00BF63',
        red: 'FF3131',
        input: '#1B1B1F',
        background: '#000000',
        blacks: {
          400: '#2D2D2D',
          500: '#1B1A1A',
          600: '#151414',
          700: '#0D0D0D',
        },
      },
      fontFamily: {
        sans: ['var(--font-montserrat)', 'sans-serif'],
        body: ['var(--font-montserrat)', 'sans-serif'],
        heading: ['var(--font-anton)', 'sans-serif'],
        code: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: '#0A5CFF',
          secondary: '#1F6AFF',
          tertiary: '#141414',
          quaternary: '#1C1C1C',
          black: '#000000',
          white: '#F5F7FB',
          gray: '#A0A0A0',
          lightGray: '#9ba3af',
          darkerGray: '#86868B',
          green: '00BF63',
          red: 'FF3131',
          input: '#1B1B1F',
          background: '#000000',
          'base-100': '#000000',
          'base-200': '#151414',
          'base-300': '#1B1A1A',
          'base-content': '#FFFFFF',
          '--rounded-btn': '9999px',
          '--btn-text-case': 'normal',
          '--btn-font-family': 'Montserrat, sans-serif',
          '--btn-text-size': '14px',
          '--btn-tracking': '0.05em',
          '--font-family': 'Montserrat, sans-serif',
        },
      },
    ],
    styled: true,
    base: true,
    utils: true,
    logs: true,
    rtl: false,
    prefix: '',
    darkTheme: 'dark',
  },
};

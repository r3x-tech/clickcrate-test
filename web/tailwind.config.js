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
    extend: {},
  },
  plugins: [require('daisyui')],
};

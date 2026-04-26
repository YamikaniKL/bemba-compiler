/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: 'tw-',
  content: [
    './amapeji/**/*.bemba',
    './ifikopo/**/*.bemba',
    './mafungulo/**/*.bemba',
    './imikalile/**/*.{css,bemba}',
    './src/**/*.{js,jsx,ts,tsx,bsx}'
  ],
  theme: {
    extend: {}
  },
  plugins: []
};

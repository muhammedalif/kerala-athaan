/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          DEFAULT: '#0B6E4F',
          50: '#E8F5F0',
          100: '#C6E8DB',
          200: '#94D4BD',
          300: '#5FBFA0',
          400: '#2EAA84',
          500: '#0B6E4F',
          600: '#095B41',
          700: '#074834',
          800: '#053627',
          900: '#03231A',
        },
        navy: {
          DEFAULT: '#0B1F3A',
          50: '#E9EEF5',
          100: '#C8D5E7',
          200: '#97AFD2',
          300: '#6589BE',
          400: '#3D68A7',
          500: '#0B1F3A',
          600: '#091A30',
          700: '#071426',
          800: '#050E1A',
          900: '#02070D',
        },
        ivory: {
          DEFAULT: '#FAF7F0',
          light: '#FFFFFF',
          dark: '#F3EFE4',
        },
        sand: {
          DEFAULT: '#EFE7D6',
          50: '#FAF7F0',
          100: '#F4EEDF',
          200: '#EFE7D6',
          300: '#DFD2B7',
          400: '#CFBC98',
          500: '#BFA679',
          600: '#9B8155',
          700: '#755E39',
        },
        gold: {
          DEFAULT: '#C9A24B',
          50: '#FBF7EE',
          100: '#F5ECDA',
          200: '#EBD9B1',
          300: '#DFC486',
          400: '#D5B45F',
          500: '#C9A24B',
          600: '#AA8535',
          700: '#866526',
          800: '#634718',
          900: '#402C0D',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans Malayalam"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      minHeight: {
        touch: '44px',
      },
      minWidth: {
        touch: '44px',
      },
    },
  },
  plugins: [],
};

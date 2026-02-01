/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Isso permite usar 'bg-indigo-500' com a cor exata do seu protótipo
        indigo: {
          500: '#6165D7',
        },
        slate: {
          950: '#020617',
        }
      },
      maxWidth: {
        '50': '12.5rem', // Resolve o aviso (suggestCanonicalClasses) da Dashboard
      },
      fontFamily: {
        prosto: ['Prosto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
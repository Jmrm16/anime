/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 18px 50px rgba(2, 6, 23, 0.22)',
      },
      backgroundImage: {
        grid: 'radial-gradient(circle at center, rgba(15, 23, 42, 0.08) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
}

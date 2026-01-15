/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Aeria brand colors
        aeria: {
          navy: '#1E3A5F',
          blue: '#2E5C8A',
          'light-blue': '#4A90D9',
          sky: '#E8F1F8',
        },
        // Risk matrix colors
        risk: {
          critical: '#991B1B',
          high: '#DC2626',
          medium: '#F59E0B',
          low: '#22C55E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

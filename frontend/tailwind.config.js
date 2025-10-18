/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Mockup-specific color palette
        'primary': '#ea2a33',
        'background-light': '#F8F5E9',
        'background-dark': '#0D0D0D',
        'surface-light': '#FFFFFF',
        'surface-dark': '#1C1C1C',
        'text-light': '#0D0D0D',
        'text-dark': '#F8F5E9',
        'text-muted-light': '#6B7280',
        'text-muted-dark': '#9CA3AF',
        'accent': '#D4AF37',
        
        // Keep original Kenyan colors for compatibility
        'kenyan-black': '#0D0D0D',
        'kenyan-red': '#ea2a33',
        'kenyan-green': '#1C4B2B',
        'kenyan-cream': '#F8F5E9',
        'kenyan-gold': '#D4AF37',
      },
      fontFamily: {
        'display': ['Inter', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      animation: {
        'flag-wave': 'flagWave 15s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'flagWave': 'flagWave 15s ease infinite',
      },
      keyframes: {
        flagWave: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(1rem)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{html,ts}",
    ],
    theme: {
      extend: {
        animation: {
          'pulse': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        },
        keyframes: {
          pulse: {
            '0%, 100%': { opacity: 1, transform: 'scale(1)' },
            '50%': { opacity: 0.8, transform: 'scale(1.05)' },
          }
        }
      },
    },
    plugins: [],
  }
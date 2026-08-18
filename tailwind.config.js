/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0f172a',
          alt: '#1e293b',
          hover: '#334155',
        },
        border: {
          DEFAULT: '#334155',
          light: '#475569',
        },
        accent: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
          muted: '#1d4ed8',
        },
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        text: {
          primary: '#f1f5f9',
          secondary: '#94a3b8',
          muted: '#64748b',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'step-highlight': 'pulse 0.5s ease-in-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
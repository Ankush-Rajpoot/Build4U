/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light theme colors
        light: {
          primary: '#2563eb',
          secondary: '#64748b',
          accent: '#06b6d4',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          background: '#ffffff',
          surface: '#f8fafc',
          text: '#1f2937',
          'text-secondary': '#6b7280',
          border: '#e5e7eb',
        },
        // Dark theme colors
        dark: {
          primary: '#3b82f6',
          secondary: '#94a3b8',
          accent: '#22d3ee',
          success: '#34d399',
          warning: '#fbbf24',
          error: '#f87171',
          background: '#0f172a',
          surface: '#1e293b',
          'surface-secondary': '#334155',
          text: '#f1f5f9',
          'text-secondary': '#cbd5e1',
          border: '#475569',
        }
      }
    },
  },
  plugins: [],
};

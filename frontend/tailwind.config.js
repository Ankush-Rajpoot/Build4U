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
        // Dark theme colors - Ultra dark palette
        dark: {
          primary: '#3b82f6',
          secondary: '#94a3b8',
          accent: '#22d3ee',
          success: '#34d399',
          warning: '#fbbf24',
          error: '#f87171',
          background: '#000000',        // Pure black background
          surface: '#0A0A0A',          // Very dark surface
          'surface-secondary': '#171717', // Dark secondary surface
          'surface-tertiary': '#262626',   // Medium dark surface
          'surface-hover': '#404040',      // Hover state surface
          text: '#A3A3A3',             // Light gray text
          'text-primary': '#f1f5f9',   // Primary text (kept bright for readability)
          'text-secondary': '#737373', // Secondary text
          'text-muted': '#525252',     // Muted text
          border: '#262626',           // Dark border
          'border-light': '#404040',   // Lighter border for subtle divisions
        }
      }
    },
  },
  plugins: [],
};

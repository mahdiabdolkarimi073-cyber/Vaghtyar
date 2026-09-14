import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        vazirmatn: ['Vazirmatn', 'Inter', 'sans-serif'],
      },
      colors: {
        background: '#F8FAFC',
        foreground: '#1E293B',
        surface: '#FFFFFF',
        primary: {
          DEFAULT: '#0D7377',
          light: '#14A8AD',
          dark: '#095C60',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#4CAF82',
          foreground: '#FFFFFF',
        },
        warning: {
          DEFAULT: '#F59E0B',
          foreground: '#FFFFFF',
        },
        error: {
          DEFAULT: '#EF4444',
          foreground: '#FFFFFF',
        },
        success: {
          DEFAULT: '#4CAF82',
          foreground: '#FFFFFF',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#1E293B',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#1E293B',
        },
        muted: {
          DEFAULT: '#F1F5F9',
          foreground: '#94A3B8',
        },
        accent: {
          DEFAULT: '#0D7377',
          foreground: '#FFFFFF',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#FFFFFF',
        },
        border: '#E2E8F0',
        input: '#E2E8F0',
        ring: '#0D7377',
        text: {
          primary: '#1E293B',
          secondary: '#64748B',
          muted: '#94A3B8',
        },
        chart: {
          '1': '#0D7377',
          '2': '#14A8AD',
          '3': '#4CAF82',
          '4': '#F59E0B',
          '5': '#EF4444',
        },
      },
      borderRadius: {
        xl: '12px',
        lg: '16px',
        md: '12px',
        sm: '8px',
      },
      boxShadow: {
        soft: '0 2px 8px rgba(13, 115, 119, 0.08)',
        card: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 10px 30px rgba(13, 115, 119, 0.12)',
        primary: '0 4px 14px rgba(13, 115, 119, 0.25)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(30px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'count-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-in-right': 'slide-in-right 0.4s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'count-up': 'count-up 0.6s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;

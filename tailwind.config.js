/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './index.tsx',
    './App.tsx',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        brand: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        kinetic: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          900: '#0F172A',
          accent: '#10B981',
        },
        accent: {
          DEFAULT: '#5E6AD2',  // primary buttons, active nav icon, progress fills
          hover: '#5158BE',
          text: '#4A55C4',     // accent-colored text/labels
          deep: '#3F4AB8',     // active nav label
          strong: '#343E9E',   // credits numeral in sidebar widget
          soft: '#8891E0',     // condition bars
          tint: '#ECEEFB',     // active nav bg, chips
          tint2: '#F4F5FD',    // secondary button / credits widget bg
          line: '#CED3F2',     // secondary button border
          line2: '#DFE2F6',    // credits widget border
        },
        ink: { DEFAULT: '#18181B', 2: '#3F3F46', 3: '#52525B', 4: '#71717A', 5: '#A1A1AA', 6: '#C0C0C4' },
        line: { DEFAULT: '#E8E8EC', soft: '#F0F0F2', softer: '#F4F4F6' },
        surface: { page: '#FCFCFC', sidebar: '#F7F7F8', card: '#FFFFFF' },
        positive: { DEFAULT: '#10B981', text: '#059669', deep: '#047857', tint: '#E6F6F0' }, // credit-gain + live status ONLY
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      keyframes: {
        'page-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'toast-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'page-in': 'page-in 180ms ease both',
        'toast-in': 'toast-in 200ms cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
};

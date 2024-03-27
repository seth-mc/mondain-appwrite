/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      
      },
    },
    extend: {
      colors: {
          border: "hsl(var(--border))",
          input: "hsl(var(--input))",
          ring: "hsl(var(--ring))",
          background: "hsl(var(--background))",
          foreground: "hsl(var(--foreground))",
          primary: {
            DEFAULT: "hsl(var(--primary))",
            foreground: "hsl(var(--primary-foreground))",
          },
          secondary: {
            DEFAULT: "hsl(var(--secondary))",
            foreground: "hsl(var(--secondary-foreground))",
          },
          destructive: {
            DEFAULT: "hsl(var(--destructive))",
            foreground: "hsl(var(--destructive-foreground))",
          },
          muted: {
            DEFAULT: "hsl(var(--muted))",
            foreground: "hsl(var(--muted-foreground))",
          },
          accent: {
            DEFAULT: "hsl(var(--accent))",
            foreground: "hsl(var(--accent-foreground))",
          },
          popover: {
            DEFAULT: "hsl(var(--popover))",
            foreground: "hsl(var(--popover-foreground))",
          },
          card: {
            DEFAULT: "hsl(var(--card))",
            foreground: "hsl(var(--card-foreground))",
          },
        'primary-500': 'var(--primary-500)',
        'primary-600': 'var(--primary-600)',
        'secondary-500': 'var(--secondary-500)',
        'off-white': 'var(--off-white)',
        'red': 'var(--red)',
        'dark-1': 'var(--dark-1)',
        'dark-2': 'var(--dark-2)',
        'dark-3': 'var(--dark-3)',
        'dark-4': 'var(--dark-4)',
        'light-1': 'var(--light-1)',
        'light-2': 'var(--light-2)',
        'light-3': 'var(--light-3)',
        'light-4': 'var(--light-4)',
        
      },
      screens: {
        'xs': '480px',
      
      },
      width: {
        '420': '420px',
        '465': '465px',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        spacemono: ['"Space Mono"', ...defaultTheme.fontFamily.sans],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-in-out',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      transitionProperty: {
        'scroll-transition-fade': 'transform, opacity',
      },
      transitionDuration: {
        'scroll-transition-fade': '1s, 0.8s',
      },
      transitionTimingFunction: {
        'scroll-transition-fade': 'ease-in-out',
      },
      backgroundImage: {
        'radial-gray': 'radial-gradient(at center, #FFFFFF, #DDDDDD)',
        'radial-green': 'radial-gradient(at center, #D9FFC6, #67FF80)',
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ['dark'], 
      textColor: ['dark'], 
    },
  },
  plugins: [require('tailwindcss-animate')],
};
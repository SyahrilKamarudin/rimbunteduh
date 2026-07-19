/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#1E3A2B',
          dark: '#1B3324',
        },
        gold: {
          DEFAULT: '#C89A44',
          dark: '#B08429',
        },
        cream: {
          DEFAULT: '#F6F1E7',
          dark: '#EFE9DA',
        },
        ink: '#26301F',
        muted: '#71705f',
        'muted-2': '#8a8570',
        'footer-heading': '#EDE7D8',
        'footer-body': '#D9DFCF',
        'footer-body-2': '#B9C4B4',
        'footer-muted': '#9CB09E',
        status: {
          'confirmed-bg': '#E4EFE2',
          'confirmed-text': '#1E3A2B',
          'pending-bg': '#F7EBD3',
          'pending-text': '#93691C',
          'cancelled-bg': '#F5E4E1',
          'cancelled-text': '#a8402f',
        },
      },
      fontFamily: {
        serif: ['Lora', 'serif'],
        sans: ['"Work Sans"', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
        'card-lg': '16px',
      },
      boxShadow: {
        card: '0 6px 20px rgba(30,40,25,0.08)',
        elevated: '0 20px 50px rgba(30,40,25,0.18)',
      },
      maxWidth: {
        content: '1200px',
        'content-lg': '1300px',
      },
    },
  },
  plugins: [],
};

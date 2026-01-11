/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}', './src/**/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ff9f43', // --point-orange
        },
        background: {
          DEFAULT: '#f3f0ea', // --bg-cream
          card: '#ffffff', // --white
        },
        text: {
          DEFAULT: '#3d2c42', // --text-purple
          sub: '#746279', // --text-secondary
          muted: 'rgba(116, 98, 121, 0.5)', // --text-muted
        },
        white: '#ffffff',
      },
      fontFamily: {
        'one-mobile': ['"ONE Mobile POP"', 'Pretendard', 'sans-serif'],
      },
      borderRadius: {
        lg: '16px', // --radius-lg
        md: '10px', // --radius-md
        sm: '6px', // --radius-sm
      },
      boxShadow: {
        glass: '0 8px 32px rgba(104, 84, 102, 0.08)', // --glass-shadow
        card: '0 4px 20px rgba(104, 84, 102, 0.06)', // .section box-shadow
      },
    },
  },
  plugins: [],
};

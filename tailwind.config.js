/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    'font-[550]',
  ],
  theme: {
    extend: {
      animation: {
        "fade-in": "fadeIn 2s ease-in-out",
        "fade-in-delay": "fadeIn 3s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      fontFamily: {
        nexon: ["'NEXON Lv1 Gothic'", "sans-serif"],
        sans: ['Pretendard', 'sans-serif']
      },
    },
  },
  plugins: [],
};

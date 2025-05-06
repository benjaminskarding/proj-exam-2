/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // default body / UI font
        sans: ["Montserrat", "ui-sans-serif", "system-ui"],
        // special utility for the logo
        logo: ["Ancorli", "sans-serif"],
      },
    },
  },
  plugins: [],
};

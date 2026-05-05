/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        zhelta: { gold: "#C4A45C", goldDeep: "#A88A4A" },
      },
    },
  },
  plugins: [],
};

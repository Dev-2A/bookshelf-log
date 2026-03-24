/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#fdf8f0",
        warm: {
          50: "#fefcf8",
          100: "#fdf6e9",
          200: "#fbe9c7",
          300: "#f7d89e",
          400: "#f0bf63",
          500: "#e6a532",
          600: "#d48a1e",
          700: "#b06c18",
          800: "#8f551b",
          900: "#754619",
        },
        wood: {
          50: "#faf7f2",
          100: "#f2ebe0",
          200: "#e4d5bf",
          300: "#d3b997",
          400: "#c19d72",
          500: "#b48859",
          600: "#a7754d",
          700: "#8b5e41",
          800: "#724d39",
          900: "#5e4031",
        },
      },
    },
  },
  plugins: [],
};

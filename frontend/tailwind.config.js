/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#06111F",
          900: "#0B1F3A",
          800: "#12263F",
          700: "#1B365D",
          600: "#254A7A",
        },
        gold: {
          500: "#C6A15B",
          400: "#D4B56E",
          300: "#E2C98A",
        },
        mist: "#F5F7FB",
      },
      fontFamily: {
        display: ['"Fraunces"', "Georgia", "serif"],
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 18px 50px -24px rgba(11, 31, 58, 0.35)",
        glass: "0 8px 32px rgba(11, 31, 58, 0.08)",
      },
    },
  },
  plugins: [],
};

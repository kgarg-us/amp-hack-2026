/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#18202f",
        mist: "#f6f8fb",
        ocean: "#2563eb",
        teal: "#0f766e",
      },
      boxShadow: {
        soft: "0 18px 60px rgba(24, 32, 47, 0.10)",
        card: "0 10px 30px rgba(24, 32, 47, 0.08)",
      },
    },
  },
  plugins: [],
};

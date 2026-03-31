module.exports = {
  // ✅ ADD THIS LINE — enables dark: prefix classes
  darkMode: "class",
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      animation: {
        marquee: "tickerMove 35s linear infinite",
      },
    },
  },
  plugins: [],
}
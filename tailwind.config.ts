import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#fbf7f1",
          100: "#f5efe4",
          200: "#ebe2d1",
          300: "#ddd0b7",
        },
        rust: {
          400: "#d68b63",
          500: "#c36a42",
          600: "#a84f2c",
          700: "#843e22",
        },
        sage: {
          400: "#9bac8f",
          500: "#7a8e6e",
          600: "#5e7254",
        },
        ink: {
          DEFAULT: "#2a241d",
          muted: "#5b5248",
          light: "#8a8073",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.9", transform: "scale(1.02)" },
        },
        "confetti-fall": {
          "0%": { transform: "translateY(-10vh) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(110vh) rotate(720deg)", opacity: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out forwards",
        "fade-in": "fade-in 0.4s ease-out forwards",
        "pulse-soft": "pulse-soft 2.4s ease-in-out infinite",
        "confetti-fall": "confetti-fall 2.5s ease-in forwards",
      },
      boxShadow: {
        "soft": "0 2px 20px -6px rgba(42, 36, 29, 0.08)",
        "lift": "0 8px 28px -12px rgba(42, 36, 29, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;

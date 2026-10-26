import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Safelist pour les classes générées dynamiquement (badges de correction)
  safelist: [
    "bg-blue-50", "border-blue-100", "text-blue-600",
    "bg-violet-50", "border-violet-100", "text-violet-600",
    "bg-emerald-50", "border-emerald-100", "text-emerald-600",
    "bg-terracotta-50", "border-terracotta-100", "text-terracotta-600",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50:  "#fdf8f3",
          100: "#faf2e8",
          200: "#f5e4d0",
          300: "#edd5b8",
        },
        brown: {
          50:  "#f5ede6",
          100: "#e8d5c4",
          200: "#c9a98a",
          300: "#a67c5b",
          400: "#7d5a3c",
          500: "#5c3d2e",
          600: "#3d2415",
          700: "#2a1a0f",
        },
        terracotta: {
          50:  "#fdf1ed",
          100: "#fae0d6",
          200: "#f4bfac",
          300: "#e89880",
          400: "#d97052",
          500: "#c4512e",
          600: "#a83d20",
          700: "#892e18",
        },
        sage: {
          100: "#e8ede8",
          200: "#c5d4c5",
          300: "#9db89d",
        },
      },
      fontFamily: {
        sans:  ["'Plus Jakarta Sans'", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        serif: ["'Plus Jakarta Sans'", "system-ui", "-apple-system", "sans-serif"],
        mono:  ["Courier New", "Courier", "monospace"],
      },


      borderRadius: {
        sm:      "4px",
        DEFAULT: "6px",
        md:      "8px",
        lg:      "12px",
        xl:      "16px",
        "2xl":   "20px",
      },
      boxShadow: {
        subtle:  "0 1px 3px rgba(44, 26, 14, 0.05)",
        card:    "0 2px 8px rgba(44, 26, 14, 0.08)",
        lift:    "0 4px 16px rgba(44, 26, 14, 0.10)",
        mic:     "0 4px 16px rgba(184, 74, 39, 0.30)",
      },
      spacing: {
        "4.5": "1.125rem",
        "13":  "3.25rem",
        "18":  "4.5rem",
      },
      letterSpacing: {
        widest: "0.12em",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;

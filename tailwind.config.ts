import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: {
          50: "var(--surface-50)",
          100: "var(--surface-100)",
          200: "var(--surface-200)",
          300: "var(--surface-300)",
          elevated: "var(--surface-elevated)",
        },
        border: "var(--border-color)",
        electric: {
          50: "#ECFDFF",
          100: "#CFF9FE",
          400: "#22D3EE",
          500: "#00D2FF",
          600: "#0891B2",
          DEFAULT: "#00D2FF",
        },
        eco: {
          500: "#10B981",
          DEFAULT: "#10B981",
        },
        amber: {
          500: "#F59E0B",
          DEFAULT: "#F59E0B",
        },
        danger: {
          500: "#EF4444",
          DEFAULT: "#EF4444",
        },
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "32px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        soft: "0 8px 30px rgba(0, 0, 0, 0.12)",
        "soft-lg": "0 14px 40px rgba(0, 0, 0, 0.18)",
        glow: "0 0 35px -5px rgba(0, 210, 255, 0.25)",
        "glow-green": "0 0 30px -5px rgba(16, 185, 129, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;

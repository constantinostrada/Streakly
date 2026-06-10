import type { Config } from "tailwindcss";

/**
 * Tailwind is scoped to the app/components sources. Semantic colors are mapped
 * to the CSS variables already defined in globals.css so Tailwind-styled
 * components stay visually consistent with the existing inline-styled UI.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        border: "var(--color-border)",
        text: "var(--color-text)",
        muted: "var(--color-muted)",
        primary: "var(--color-primary)",
        "primary-hover": "var(--color-primary-hover)",
        success: "var(--color-success)",
        danger: "var(--color-danger)",
        "danger-hover": "var(--color-danger-hover)",
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
      },
    },
  },
  plugins: [],
};

export default config;

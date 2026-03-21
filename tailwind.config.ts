import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
      },
      colors: {
        brand: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          900: "#0c4a6e",
        },
        // Theme-aware utilities — resolve via CSS custom properties set by data-theme
        theme: {
          bg:      "var(--color-bg)",
          surface: "var(--color-surface)",
          primary: "var(--color-primary)",
          accent:  "var(--color-accent)",
          border:  "var(--color-border)",
          text:    "var(--color-text)",
        },
      },
      fontFamily: {
        heading: "var(--font-heading)",
        body:    "var(--font-body)",
      },
    },
  },
  plugins: [],
};

export default config;

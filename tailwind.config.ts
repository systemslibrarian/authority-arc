import type { Config } from "tailwindcss";

/**
 * Authority Arc — design tokens
 *
 * The palette is a deliberate inversion of the modern "AI demo dark mode" default.
 * This is a museum. Warm paper, deep ink, oxblood and indigo accents.
 * Every token here is referenced in components/ and app/ as `bg-paper`, `text-ink`,
 * `border-rule`, etc. Add new tokens here, not as one-off hex values inline.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper:       "#f3eee4",
        "paper-deep":"#ebe4d4",
        "paper-edge":"#d8cfba",
        ink:         "#1a1a24",
        "ink-soft":  "#3a3a48",
        "ink-faint": "#5a5a68",
        rule:        "#c9bfa5",
        oxblood:     "#6e1f1f",
        "oxblood-deep":"#4a1414",
        indigo:      "#1f3a6e",
        "indigo-deep":"#122249",
        ochre:       "#a8762a",
        "ochre-deep":"#7a5215",
      },
      fontFamily: {
        // Display: Fraunces, an opinionated serif with optical sizing + SOFT/WONK axes
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        // Body sans, used sparingly (UI chrome, tables, captions)
        sans:    ["var(--font-inter)", "system-ui", "sans-serif"],
        // Code / data / curators / identifiers — anywhere a wire shape is visible
        mono:    ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        paper: "0 1px 0 rgba(0,0,0,.04), 0 18px 40px -28px rgba(26,26,36,.25)",
      },
      backgroundImage: {
        "paper-warmth":
          "radial-gradient(ellipse at top, rgba(168, 118, 42, .07), transparent 60%), radial-gradient(ellipse at bottom right, rgba(110, 31, 31, .04), transparent 50%)",
      },
      letterSpacing: {
        eyebrow: "0.22em",
        strip:   "0.14em",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "none" },
        },
        "chit-in": {
          from: { opacity: "0", transform: "scale(.85)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
        spin60: {
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-up": "fade-up .5s ease-out",
        "chit-in": "chit-in 1s cubic-bezier(.2,.7,.2,1) forwards",
        "spin-60s": "spin60 60s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // الهوية البصرية لـ "مدى الإنسان"
        navy: {
          DEFAULT: "#0E1B2A",
          light: "#162436",
          dark: "#0a1520",
        },
        ivory: {
          DEFAULT: "#F5EFE3",
          light: "#FAF6EF",
          dark: "#EDE5D4",
        },
        gold: {
          DEFAULT: "#C99A3E",
          light: "#D4AD5A",
          dark: "#A87E2E",
        },
        hope: {
          DEFAULT: "#2F8F6B",
          light: "#3AA87E",
          dark: "#247558",
        },
        teal: {
          DEFAULT: "#0F766E",
          light: "#14948A",
          dark: "#0a5e57",
        },
        urgent: {
          DEFAULT: "#B84C4C",
          light: "#C96060",
          dark: "#9A3A3A",
        },
        text: {
          DEFAULT: "#3E4652",
          light: "#5A6475",
          muted: "#8A95A3",
        },
      },
      fontFamily: {
        kufi: ["var(--font-kufi)", "sans-serif"],
        cairo: ["var(--font-cairo)", "sans-serif"],
        tajawal: ["var(--font-tajawal)", "sans-serif"],
        sans: ["var(--font-tajawal)", "var(--font-cairo)", "sans-serif"],
      },
      animation: {
        "ticker": "ticker 40s linear infinite",
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "float": "float 3s ease-in-out infinite",
      },
      keyframes: {
        ticker: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      boxShadow: {
        card: "0 2px 20px rgba(14,27,42,0.08)",
        "card-hover": "0 8px 40px rgba(14,27,42,0.15)",
        gold: "0 4px 20px rgba(201,154,62,0.25)",
      },
      backgroundImage: {
        "hero-pattern": "radial-gradient(ellipse at 20% 50%, rgba(47,143,107,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(201,154,62,0.06) 0%, transparent 50%)",
        "card-gradient": "linear-gradient(135deg, #ffffff 0%, #FAF6EF 100%)",
      },
    },
  },
  plugins: [],
};
export default config;

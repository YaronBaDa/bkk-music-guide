import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        surface: "#F5F5F5",
        elevated: "#EEEEEE",
        border: "#E5E5E5",
        "text-primary": "#0A0A0A",
        "text-secondary": "#666666",
        "text-tertiary": "#999999",
        accent: "#FF0000",
        "accent-hover": "#CC0000",
        success: "#000000",
        warning: "#000000",
        danger: "#FF0000",
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "Helvetica", "Arial", "system-ui", "sans-serif"],
        display: ['var(--font-jakarta)', '"Plus Jakarta Sans"', "Helvetica", "Arial", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      borderRadius: {
        none: "0",
        sm: "0",
        DEFAULT: "0",
        md: "0",
        lg: "0",
        xl: "0",
        "2xl": "0",
        "3xl": "0",
      },
    },
  },
  plugins: [],
};
export default config;

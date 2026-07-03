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
        background: "#0A0A0F",
        surface: "#14141A",
        elevated: "#1E1E26",
        border: "#2A2A35",
        "text-primary": "#F0F0F5",
        "text-secondary": "#8A8A99",
        "text-tertiary": "#5A5A6A",
        accent: "#FF3366",
        "accent-hover": "#FF5588",
        success: "#00E676",
        warning: "#FFAA00",
        danger: "#FF4444",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;

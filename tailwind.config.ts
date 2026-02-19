import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#ef4444", // Red-500
          dark: "#b91c1c",    // Red-700
          light: "#fca5a5",   // Red-300
        },
        secondary: {
          DEFAULT: "#1f2937", // Gray-800
          dark: "#111827",    // Gray-900
          light: "#374151",   // Gray-700
        },
        accent: {
          DEFAULT: "#dc2626", // Red-600
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;

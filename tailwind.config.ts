import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
    "./src/hooks/**/*.{ts,tsx}",
    "./src/context/**/*.{ts,tsx}",
    "./src/projects/**/*.{ts,tsx}",
    "./scripts/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        zinc: {
          250: "#dedde2", // your custom zinc-250 value
        },
      },
      keyframes: {
        blink: {
          "0%, 49%": { opacity: "1", color: "red" },
          "50%, 100%": { opacity: "0" },
        },
      },
      animation: {
        blink: "blink 1s step-start infinite",
      },
    },
  },
  plugins: [],
};

export default config;

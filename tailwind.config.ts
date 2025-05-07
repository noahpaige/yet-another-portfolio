import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        zinc: {
          250: "#dedde2", // your custom zinc-250 value
        },
      },
    },
  },
  plugins: [],
};

export default config;

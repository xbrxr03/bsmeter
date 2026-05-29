import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{tsx,ts}", "./src/web/**/*.{tsx,ts}"],
  darkMode: "class",
  theme: { extend: {} },
  plugins: [],
};

export default config;

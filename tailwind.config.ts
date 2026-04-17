import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-outfit)', 'sans-serif'],
        syn: ['var(--font-outfit)', 'sans-serif'],
      },
      colors: {
        background: "var(--bg)",
        surface: "var(--surface)",
        surface2: "var(--surface2)",
        surface3: "var(--surface3)",
        border1: "var(--border)",
        border2: "var(--border2)",
        text1: "var(--text)",
        text2: "var(--text2)",
        text3: "var(--text3)",
        accent: "var(--accent)",
        pinGated: "var(--pin-gated)",
        pinNogated: "var(--pin-nogated)",
        purple: "var(--purple)",
        green: "var(--green)",
        pink: "var(--pink)",
        yellow: "var(--yellow)",
        teal: "var(--teal)",
      },
      transitionTimingFunction: {
        DEFAULT: 'ease',
      },
      transitionDuration: {
        DEFAULT: '120ms',
      },
      backdropBlur: {
        glass: '16px',
      }
    },
  },
  plugins: [],
};
export default config;

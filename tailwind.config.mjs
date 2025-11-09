// tailwind.config.mjs

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    // REQUIRED: Scans the core 'app' directory (where page.js and layout.js live)
    './app/**/*.{js,ts,jsx,tsx,mdx}', 
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    // REQUIRED: Scans the 'components' directory
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Ensures the Inter font is used by default
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
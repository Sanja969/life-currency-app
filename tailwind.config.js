/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],

  theme: {
    extend: {
      colors: {
        // Brand
        primary: "#2E7D32",
        primaryDark: "#1B5E20",
        primaryLight: "#4CAF50",
        primarySoft: "#E8F5E9",
        accent: "#81C784",

        // Backgrounds
        background: "#F8FFF8",
        surface: "#FFFFFF",

        // Text
        textPrimary: "#1B1B1B",
        textSecondary: "#616161",

        // Feedback
        success: "#43A047",
        warning: "#FB8C00",

        // UI
        border: "#E8E8E8",
      },

      spacing: {
        // Generic spacing
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,

        // Semantic spacing
        screen: 16,
        card: 20,
        section: 24,
        hero: 32,
      },

      borderRadius: {
        card: 20,
        hero: 28,
        pill: 9999,
      },

      fontSize: {
        hero: ["48px", "56px"],
        h1: ["32px", "40px"],
        h2: ["24px", "32px"],
        title: ["20px", "28px"],
        body: ["16px", "24px"],
        caption: ["13px", "18px"],
      },
    },
  },

  plugins: [],
};
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#FF6B6B", // Coral Red (Sunset Glow Primary)
          light: "#EE5A6F", // Rose Pink (Sunset Glow Secondary)
          dark: "#C44569", // Deep Rose
          glow: "#F06595", // Hot Pink (Accent)
        },
        dark: {
          DEFAULT: "#1A1A2E", // Deep Navy (Sunset Glow Dark)
          lighter: "#16213E", // Navy Blue (Surface)
          border: "#2C3E50", // Slightly lighter navy
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Outfit", "sans-serif"],
        logo: ["Space Grotesk", "Outfit", "sans-serif"], // New font for logo
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        glow: "0 0 20px rgba(255, 107, 107, 0.5)", // Coral glow
        "glow-sm": "0 0 10px rgba(255, 107, 107, 0.3)", // Subtle coral glow
        "glow-lg": "0 0 30px rgba(255, 107, 107, 0.6)", // Large coral glow
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
        bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        elastic: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },
      animation: {
        fadeIn: "fadeIn 0.3s ease-smooth",
        slideInUp: "slideInUp 0.4s ease-smooth",
        slideInDown: "slideInDown 0.4s ease-smooth",
        scaleIn: "scaleIn 0.2s ease-smooth",
        shimmer: "shimmer 2s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInDown: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        "pulse-glow": {
          "0%, 100%": {
            opacity: "0.5",
            boxShadow: "0 0 20px rgba(255, 107, 107, 0.3)",
          },
          "50%": {
            opacity: "1",
            boxShadow: "0 0 40px rgba(255, 107, 107, 0.6)",
          },
        },
      },
    },
  },
  darkMode: "class", // Preserving dark mode preference likely used in the app
  plugins: [],
};

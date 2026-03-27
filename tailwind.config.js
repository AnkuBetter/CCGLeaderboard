module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', "sans-serif"],
        mono: ['"IBM Plex Mono"', "monospace"],
      },
      colors: {
        primary: {
          DEFAULT: "hsl(45, 100%, 47%)",
          foreground: "hsl(0, 0%, 100%)",
        },
        secondary: {
          DEFAULT: "hsl(35, 37%, 35%)",
          foreground: "hsl(0, 0%, 100%)",
        },
        tertiary: {
          DEFAULT: "hsl(180, 85%, 55%)",
          foreground: "hsl(0, 0%, 5%)",
        },
        neutral: {
          DEFAULT: "hsl(0, 0%, 10%)",
          foreground: "hsl(0, 0%, 90%)",
          50: "hsl(0, 0%, 96%)",
          100: "hsl(0, 0%, 90%)",
          200: "hsl(0, 0%, 75%)",
          300: "hsl(0, 0%, 60%)",
          400: "hsl(0, 0%, 45%)",
          500: "hsl(0, 0%, 35%)",
          600: "hsl(0, 0%, 25%)",
          700: "hsl(0, 0%, 15%)",
          800: "hsl(0, 0%, 10%)",
          900: "hsl(0, 0%, 4%)",
        },
        success: "hsl(120, 65%, 55%)",
        warning: "hsl(45, 100%, 47%)",
        "cta-primary": "hsl(260, 85%, 45%)",
        "cta-primary-foreground": "hsl(0, 0%, 100%)",
        "hero-text": "hsl(0, 0%, 100%)",
        "navbar-text": "hsl(0, 0%, 85%)",
        border: "hsl(0, 0%, 25%)",
        background: "hsl(0, 0%, 4%)",
        foreground: "hsl(0, 0%, 90%)",
      },
      borderRadius: {
        DEFAULT: "0.75rem",
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
      spacing: {
        4: "1rem",
        8: "2rem",
        12: "3rem",
        16: "4rem",
        24: "6rem",
        32: "8rem",
        48: "12rem",
        64: "16rem",
      },
      backgroundImage: {
        "gradient-1":
          "linear-gradient(135deg, hsl(250, 85%, 20%), hsl(290, 65%, 30%), hsl(260, 85%, 35%))",
        "gradient-2":
          "linear-gradient(120deg, hsl(210, 65%, 25%), hsl(280, 60%, 35%))",
        "button-border-gradient":
          "linear-gradient(90deg, hsla(250, 85%, 60%, 0.7), hsla(180, 100%, 60%, 0.7))",
        "aurora-text":
          "linear-gradient(90deg, hsl(45, 100%, 60%), hsl(180, 85%, 55%), hsl(260, 85%, 65%), hsl(45, 100%, 60%))",
      },
      keyframes: {
        aurora: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        aurora: "aurora 4s ease-in-out infinite",
        "fade-in": "fade-in 1.5s ease-in forwards",
        "slide-up": "slide-up 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

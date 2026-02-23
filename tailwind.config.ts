import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          'primary-foreground': "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          'accent-foreground': "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))"
        },
        navy: {
          DEFAULT: "hsl(210 63% 11%)",
          light: "hsl(210 55% 18%)",
          dark: "hsl(210 63% 7%)",
          deeper: "hsl(210 60% 4%)",
        },
        cyan: {
          DEFAULT: "hsl(190 90% 50%)",
          light: "hsl(190 80% 65%)",
          dark: "hsl(190 90% 40%)",
          glow: "hsl(190 100% 60%)",
        },
        mint: {
          DEFAULT: "hsl(160 60% 60%)",
          light: "hsl(160 50% 75%)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "fade-in-right": {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" }
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" }
        },
        "float": {
          "0%, 100%": { transform: "translateY(0) translateX(0)" },
          "25%": { transform: "translateY(-20px) translateX(10px)" },
          "50%": { transform: "translateY(-10px) translateX(-10px)" },
          "75%": { transform: "translateY(-30px) translateX(5px)" }
        },
        "scan-down": {
          "0%": { top: "-10%", opacity: "1" },
          "100%": { top: "110%", opacity: "0.3" }
        },
        "scan-line": {
          "0%": { top: "-10%" },
          "100%": { top: "110%" }
        },
        "confetti": {
          "0%": { opacity: "1", transform: "scale(0) translateY(0)" },
          "50%": { opacity: "1", transform: "scale(1) translateY(-20px)" },
          "100%": { opacity: "0", transform: "scale(0.5) translateY(20px)" }
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.5)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(190 90% 50% / 0.2)" },
          "50%": { boxShadow: "0 0 40px hsl(190 90% 50% / 0.4), 0 0 80px hsl(190 90% 50% / 0.1)" }
        },
        "rotate-text": {
          "0%, 18%": { transform: "translateY(0%)" },
          "20%, 38%": { transform: "translateY(-100%)" },
          "40%, 58%": { transform: "translateY(-200%)" },
          "60%, 78%": { transform: "translateY(-300%)" },
          "80%, 100%": { transform: "translateY(0%)" }
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "count-up-glow": {
          "0%": { textShadow: "0 0 0 transparent" },
          "50%": { textShadow: "0 0 20px hsl(190 90% 50% / 0.5)" },
          "100%": { textShadow: "0 0 0 transparent" }
        },
        "mesh-rotate": {
          "0%": { transform: "rotateY(0deg) rotateX(0deg)" },
          "50%": { transform: "rotateY(15deg) rotateX(5deg)" },
          "100%": { transform: "rotateY(0deg) rotateX(0deg)" }
        },
        "orbit": {
          "0%": { transform: "rotate(0deg) translateX(120px) rotate(0deg)" },
          "100%": { transform: "rotate(360deg) translateX(120px) rotate(-360deg)" }
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "fade-in-right": "fade-in-right 0.5s ease-out forwards",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "float": "float 8s ease-in-out infinite",
        "scan-down": "scan-down 1.5s ease-in-out infinite",
        "scan-line": "scan-line 3s linear infinite",
        "confetti": "confetti 0.8s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "rotate-text": "rotate-text 10s ease-in-out infinite",
        "slide-up": "slide-up 0.6s ease-out forwards",
        "mesh-rotate": "mesh-rotate 8s ease-in-out infinite",
        "orbit": "orbit 20s linear infinite",
        "shimmer": "shimmer 3s linear infinite",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-gradient': 'linear-gradient(135deg, hsl(210 63% 11%) 0%, hsl(210 55% 18%) 50%, hsl(190 90% 20%) 100%)',
      },
      fontFamily: {
        'inter': ['Inter', 'system-ui', 'sans-serif'],
        'space': ['Space Grotesk', 'sans-serif'],
        // Keep legacy references working
        'lora': ['Space Grotesk', 'sans-serif'],
        'montserrat': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

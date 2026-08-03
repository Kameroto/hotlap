export const designTokens = {
  colors: {
    primary: "#E10600",
    secondary: "#111111",
    accent: "#FFD100",

    background: "#FFFFFF",
    surface: "#F8F9FA",

    text: {
      primary: "#111111",
      secondary: "#666666",
      light: "#FFFFFF",
    },

    border: "#E5E7EB",
  },

  spacing: {
    section: "py-24",
    container: "max-w-7xl mx-auto px-6 lg:px-8",
  },

  radius: {
    card: "rounded-2xl",
    button: "rounded-xl",
  },

  shadow: {
    card: "shadow-lg",
    hover: "hover:shadow-xl transition-all duration-300",
  },
} as const;
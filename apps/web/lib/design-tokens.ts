export const designTokens = {
  colors: {
    primary:
      "#FF6A00",

    primaryBright:
      "#FF7A00",

    primarySoft:
      "#FF9A3D",

    background:
      "#080A0C",

    surface:
      "#101316",

    graphite:
      "#171B1F",

    elevated:
      "#1D2227",

    border:
      "#30363D",

    text: {
      primary:
        "#F7F7F5",

      secondary:
        "#9CA3AA",

      tertiary:
        "#737A82",

      inverse:
        "#080A0C",
    },

    semantic: {
      success:
        "#29C36A",

      warning:
        "#F5A524",

      destructive:
        "#EF4444",
    },
  },

  spacing: {
    section:
      "py-16 md:py-20 lg:py-24",

    compactSection:
      "py-12 md:py-16",

    container:
      "mx-auto w-full max-w-[1440px] px-5 sm:px-6 lg:px-8 xl:px-10",
  },

  radius: {
    small:
      "rounded-md",

    medium:
      "rounded-lg",

    card:
      "rounded-xl",

    panel:
      "rounded-2xl",

    pill:
      "rounded-full",
  },

  shadow: {
    card:
      "shadow-[0_14px_50px_rgba(0,0,0,0.28)]",

    elevated:
      "shadow-[0_24px_80px_rgba(0,0,0,0.42)]",

    hover:
      "transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.42)]",
  },

  motion: {
    fast:
      "duration-200",

    normal:
      "duration-300",

    slow:
      "duration-500",

    ease:
      "ease-[cubic-bezier(0.22,1,0.36,1)]",
  },

  typography: {
    kicker:
      "text-xs font-bold uppercase tracking-[0.18em]",

    hero:
      "text-5xl font-bold leading-[0.95] tracking-[-0.045em] sm:text-6xl lg:text-7xl xl:text-8xl",

    sectionTitle:
      "text-3xl font-bold tracking-[-0.035em] sm:text-4xl lg:text-5xl",

    cardTitle:
      "text-lg font-semibold tracking-[-0.015em]",
  },
} as const;
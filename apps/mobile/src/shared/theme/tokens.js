/**
 * Single source of truth for design values.
 * Consumed by tailwind.config.js (CommonJS) and typed by theme/index.ts.
 */
const colors = {
  background: "#F4F8F5",
  surface: "#FFFFFF",
  surfaceMuted: "#EDF3EF",
  ink: {
    DEFAULT: "#12241B",
    muted: "#5A6E64",
    faint: "#8B9A92",
  },
  accent: {
    DEFAULT: "#2F9E69",
    soft: "#E4F2EA",
    strong: "#1E7A50",
  },
  line: "#E2EAE5",
  danger: "#C0453A",
  dangerSoft: "#FBEAE8",
  warning: "#B0731B",
  warningSoft: "#FDF3E3",
  white: "#FFFFFF",
  transparent: "transparent",
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

const typography = {
  families: {
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    semibold: "Inter_600SemiBold",
    bold: "Inter_700Bold",
  },
  sizes: {
    caption: 12,
    label: 13,
    body: 15,
    title: 20,
    heading: 28,
    display: 34,
  },
};

module.exports = { colors, spacing, radii, typography };

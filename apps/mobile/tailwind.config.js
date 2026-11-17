const { colors, radii, spacing, typography } = require("./src/shared/theme/tokens.js");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors,
      spacing,
      borderRadius: {
        sm: radii.sm,
        md: radii.md,
        lg: radii.lg,
        xl: radii.xl,
        full: radii.full,
      },
      fontFamily: {
        inter: [typography.families.regular],
        "inter-medium": [typography.families.medium],
        "inter-semibold": [typography.families.semibold],
        "inter-bold": [typography.families.bold],
      },
      fontSize: {
        caption: typography.sizes.caption,
        label: typography.sizes.label,
        body: typography.sizes.body,
        title: typography.sizes.title,
        heading: typography.sizes.heading,
        display: typography.sizes.display,
      },
    },
  },
  plugins: [],
};

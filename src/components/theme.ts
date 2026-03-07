import { StyleSheet, ViewStyle, TextStyle } from "react-native";

export const COLORS = {
  primary: "#1E3A5F",
  onPrimary: "#FFFFFF",
  secondary: "#2563EB",
  onSecondary: "#FFFFFF",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  onBackground: "#0F172A",
  onSurface: "#0F172A",
  error: "#DC2626",
  errorContainer: "#FEE2E2",

  // Status colors
  available: "#16A34A",
  inUse: "#2563EB",
  maintenance: "#D97706",
  retired: "#6B7280",

  // Misc
  divider: "#E2E8F0",
  textSecondary: "#64748B",
};

export const TYPOGRAPHY = StyleSheet.create({
  headlineLarge: {
    fontSize: 32,
    fontWeight: "700" as TextStyle["fontWeight"],
    color: COLORS.onBackground,
  },
  headlineMedium: {
    fontSize: 24,
    fontWeight: "700" as TextStyle["fontWeight"],
    color: COLORS.onBackground,
  },
  titleMedium: {
    fontSize: 16,
    fontWeight: "600" as TextStyle["fontWeight"],
    color: COLORS.onBackground,
  },
  bodyLarge: {
    fontSize: 16,
    color: COLORS.onBackground,
  },
  bodyMedium: {
    fontSize: 14,
    color: COLORS.onBackground,
  },
  bodySmall: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  labelSmall: {
    fontSize: 11,
    fontWeight: "600" as TextStyle["fontWeight"],
    color: COLORS.primary,
  },
});

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const CARD_STYLE: ViewStyle = {
  backgroundColor: COLORS.surface,
  borderRadius: 12,
  padding: SPACING.lg,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.08,
  shadowRadius: 4,
  elevation: 2,
};

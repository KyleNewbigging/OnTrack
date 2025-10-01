import React from "react";
import { useStore } from "./store";

const LIGHT_COLORS = {
  background: "#f3f4f6",
  surface: "#ffffff",
  surfaceMuted: "#f9fafb",
  text: "#111827",
  textMuted: "#6b7280",
  border: "#e5e7eb",
  accent: "#3b82f6",
  accentMuted: "#2563eb",
  button: "#111827",
  buttonText: "#ffffff",
  danger: "#ef4444",
  dangerText: "#ffffff",
  success: "#16a34a",
  chip: "#111827",
  chipText: "#f9fafb",
  inputBackground: "#ffffff",
  inputBorder: "#e5e7eb",
};

const DARK_COLORS = {
  background: "#0f172a",
  surface: "#111827",
  surfaceMuted: "#15213a",
  text: "#f8fafc",
  textMuted: "#94a3b8",
  border: "#1e293b",
  accent: "#38bdf8",
  accentMuted: "#0ea5e9",
  button: "#38bdf8",
  buttonText: "#0f172a",
  danger: "#f87171",
  dangerText: "#ffffff",
  success: "#22c55e",
  chip: "#1e293b",
  chipText: "#e2e8f0",
  inputBackground: "#1e293b",
  inputBorder: "#334155",
};

export type ThemeName = "light" | "dark";
export type ThemeColors = typeof LIGHT_COLORS;

export function useThemeColors(): ThemeColors {
  const theme = useStore((s) => s.theme);
  return React.useMemo(() => (theme === "dark" ? DARK_COLORS : LIGHT_COLORS), [theme]);
}

export function useThemeName(): ThemeName {
  return useStore((s) => s.theme);
}

export function getThemeToggleContent(theme: ThemeName) {
  if (theme === "dark") {
    return { icon: "SUN", title: "Daybreak", subtitle: "Slip back into light mode" };
  }
  return { icon: "MOON", title: "Nebula", subtitle: "Sail into night mode" };
}

/**
 * Design tokens — mirrored in app/globals.css @theme for Tailwind utilities.
 */
export const colors = {
  void: "#0A0E14",
  charcoal: "#1A2530",
  silver: "#C9D1D9",
  frost: "#3F4F5E",
  frostLight: "#5A6D7E",
  wolf: "#8C6B3E",
  wolfLight: "#A6844D",
  textPrimary: "#E8ECF0",
  textSecondary: "#C9D1D9",
  textMuted: "#7A8794",
  border: "#2A3644",
  borderSubtle: "#1F2935",
} as const;

export const layout = {
  containerMax: "90rem",
  headerHeight: "4.5rem",
  touchMin: "44px",
} as const;

export const motion = {
  easeOutExpo: "cubic-bezier(0.16, 1, 0.3, 1)",
  durationFast: "200ms",
  durationNormal: "400ms",
  durationSlow: "700ms",
} as const;
